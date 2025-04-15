import type { Metadata } from "next";
import { HydrateClient, trpc } from "@/trpc/server";
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { DEFAULT_LIMIT } from "@/constants";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

// Dinamik metadata oluşturma fonksiyonu
export async function generateMetadata({
  params,
}: {
  params: { videoId: string };
}): Promise<Metadata> {
  noStore();

  try {
    // Video ve video sahibi bilgilerini çek
    const [videoData] = await db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        userId: videos.userId,
        thumbnailUrl: videos.thumbnailUrl,
        createdAt: videos.createdAt,
      })
      .from(videos)
      .where(eq(videos.id, params.videoId));

    if (!videoData) {
      return {
        title: "Video Not Found",
        description: "The video you're looking for could not be found",
      };
    }

    // Video sahibinin bilgilerini çek
    const [userData] = await db
      .select({
        name: users.name,
        imageUrl: users.imageUrl,
      })
      .from(users)
      .where(eq(users.id, videoData.userId));

    // Açıklama için maksimum karakter sayısı
    const maxDescLength = 160;
    const shortDescription = videoData.description
      ? videoData.description.length > maxDescLength
        ? videoData.description.substring(0, maxDescLength) + "..."
        : videoData.description
      : "No description available for this video";

    // Paylaşılabilir tarih formatı
    const formattedDate = videoData.createdAt.toISOString();

    return {
      title: videoData.title,
      description: shortDescription,
      openGraph: {
        title: videoData.title,
        description: shortDescription,
        type: "video.other",
        url: `https://newtube.example.com/videos/${videoData.id}`,
        images: [
          {
            url: videoData.thumbnailUrl || "/images/default-thumbnail.jpg",
            width: 1280,
            height: 720,
            alt: videoData.title,
          },
        ],
        siteName: "NewTube",
        locale: "en_US",
        // Not: publishedTime type hatasını düzelttim - OpenGraphVideoOther'da yoktu
      },
      twitter: {
        card: "summary_large_image",
        title: videoData.title,
        description: shortDescription,
        images: [videoData.thumbnailUrl || "/images/default-thumbnail.jpg"],
        creator: userData?.name || "NewTube User",
      },
      authors: [
        {
          name: userData?.name || "NewTube User",
          url: `https://newtube.example.com/channel/${videoData.userId}`,
        },
      ],
      alternates: {
        canonical: `https://newtube.example.com/videos/${videoData.id}`,
      },
      other: {
        "og:video": `https://newtube.example.com/embed/${videoData.id}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Video - NewTube",
      description: "Discover video content",
    };
  }
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;

  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });
  void trpc.suggestions.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
