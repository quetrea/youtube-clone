import { Metadata } from "next";
import { HydrateClient, trpc } from "@/trpc/server";
import { HomeView } from "@/modules/home/ui/views/home-view";

interface PageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export const metadata: Metadata = {
  title: "Home - Discover the Best Video Content",
  description: "Watch the latest and most popular videos on NewTube. Browse by categories and follow your favorite content creators.",
  keywords: ["video platform", "watch videos", "content creators", "popular videos"],
  alternates: {
    canonical: "https://newtube.example.com",
  },
  openGraph: {
    title: "Home - NewTube",
    description: "Discover and share the best video content",
    url: "https://newtube.example.com",
    type: "website",
    images: [
      {
        url: "/images/home-og.jpg", // Special Open Graph image for the home page
        width: 1200,
        height: 630,
        alt: "NewTube Home",
      },
    ],
  },
};

const Page = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
