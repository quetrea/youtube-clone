import { HydrateClient, trpc } from "@/trpc/server";
import { VideoView } from "@/modules/videos/ui/views/video-view";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;

  void trpc.videos.getOne.prefetch({ id: videoId });
  // todo: dont forget to change to `prefetchInfinite`
  void trpc.comments.getMany.prefetch({ videoId: videoId });

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
