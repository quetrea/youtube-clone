"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { VideoRowCard } from "@/modules/videos/ui/components/video-row-card";

interface VideosSectionProps {
  playlistId: string;
}

// Error component
const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">
        {error.message || "Failed to load videos"}
      </p>
      <Button variant="outline" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
};

// Loading skeleton for desktop view
const VideosSkeletonDesktop = () => (
  <div className="hidden md:grid gap-4 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
    {Array.from({ length: 18 }).map((_, index) => (
      <VideoGridCardSkeleton key={index} />
    ))}
  </div>
);

// Loading skeleton for mobile view
const VideosSkeletonMobile = () => (
  <div className="grid md:hidden gap-4 gap-y-10 grid-cols-1 sm:grid-cols-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <VideoGridCardSkeleton key={index} />
    ))}
  </div>
);

// Loading component that handles both mobile and desktop views
const VideosSkeleton = () => {
  const isMobile = useIsMobile();
  return isMobile ? <VideosSkeletonMobile /> : <VideosSkeletonDesktop />;
};

// Videos content component
const VideosContent = ({ playlistId }: VideosSectionProps) => {
  const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      playlistId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Process items to add relevanceScore property that's expected by the video card components
  const items = videos.pages.flatMap((page) =>
    page.items.map((item) => ({
      ...item,
      relevanceScore: 0, // Add default relevanceScore for VideoGridCard component
    }))
  );

  const utils = trpc.useUtils();

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId });

      toast.success("Video removed from playlist");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {items.map((video) => (
          <VideoGridCard
            key={video.id}
            data={video}
            onRemove={() =>
              removeVideo.mutate({ playlistId, videoId: video.id })
            }
          />
        ))}
      </div>
      <div className="hidden flex-col gap-4  md:flex">
        {items.map((video) => (
          <VideoRowCard
            key={video.id}
            data={video}
            size={"compact"}
            onRemove={() =>
              removeVideo.mutate({ playlistId, videoId: video.id })
            }
          />
        ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

// Main component with Suspense and Error boundaries
export const VideosSection = ({ playlistId }: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSkeleton />}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Reset the query when the user clicks try again
          window.location.reload();
        }}
      >
        <VideosContent playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};
