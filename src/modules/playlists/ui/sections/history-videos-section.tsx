"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
const HistoryVideosSkeletonDesktop = () => (
  <div className="hidden md:grid gap-4 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
    {Array.from({ length: 18 }).map((_, index) => (
      <VideoGridCardSkeleton key={index} />
    ))}
  </div>
);

// Loading skeleton for mobile view
const HistoryVideosSkeletonMobile = () => (
  <div className="grid md:hidden gap-4 gap-y-10 grid-cols-1 sm:grid-cols-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <VideoGridCardSkeleton key={index} />
    ))}
  </div>
);

// Loading component that handles both mobile and desktop views
const HistoryVideosSkeleton = () => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <HistoryVideosSkeletonMobile />
  ) : (
    <HistoryVideosSkeletonDesktop />
  );
};

// Videos content component
const HistoryVideosContent = () => {
  const [videos, videosQuery] =
    trpc.playlists.getHistory.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  // Process items to add relevanceScore property that's expected by the video card components
  const items = videos.pages.flatMap((page) =>
    page.items.map((item) => ({
      ...item,
      relevanceScore: 0, // Default relevance score for home videos
    }))
  );

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {items.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>
      <div className="hidden flex-col gap-4  md:flex">
        {items.map((video) => (
          <VideoRowCard key={video.id} data={video} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={videosQuery.hasNextPage}
        isFetchingNextPage={videosQuery.isFetchingNextPage}
        fetchNextPage={videosQuery.fetchNextPage}
      />
    </>
  );
};

// Main component with Suspense and Error boundaries
export const HistoryVideosSection = () => {
  return (
    <Suspense fallback={<HistoryVideosSkeleton />}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Reset the query when the user clicks try again
          window.location.reload();
        }}
      >
        <HistoryVideosContent />
      </ErrorBoundary>
    </Suspense>
  );
};
