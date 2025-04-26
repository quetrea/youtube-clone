"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  PlaylistGridCard,
  PlaylistGridCardSkeleton,
} from "@/modules/playlists/ui/components/playlist-grid-card";
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
const PlaylistsSkeletonDesktop = () => (
  <div className="hidden md:grid gap-4 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
    {Array.from({ length: 18 }).map((_, index) => (
      <PlaylistGridCardSkeleton key={index} />
    ))}
  </div>
);

// Loading skeleton for mobile view
const PlaylistsSkeletonMobile = () => (
  <div className="grid md:hidden gap-4 gap-y-10 grid-cols-1 sm:grid-cols-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <PlaylistGridCardSkeleton key={index} />
    ))}
  </div>
);

// Loading component that handles both mobile and desktop views
const PlaylistsSkeleton = () => {
  const isMobile = useIsMobile();
  return isMobile ? <PlaylistsSkeletonMobile /> : <PlaylistsSkeletonDesktop />;
};

// Videos content component
const PlaylistsContent = () => {
  const [playlists, playlistsQuery] =
    trpc.playlists.getMany.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  // Process items to add relevanceScore property that's expected by the video card components
  const items = playlists.pages.flatMap((page) =>
    page.items.map((item) => ({
      ...item,
    }))
  );

  return (
    <>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6 ">
        {items.map((playlist) => (
          <PlaylistGridCard data={playlist} key={playlist.id} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={playlistsQuery.hasNextPage}
        isFetchingNextPage={playlistsQuery.isFetchingNextPage}
        fetchNextPage={playlistsQuery.fetchNextPage}
      />
    </>
  );
};

// Main component with Suspense and Error boundaries
export const PlaylistsSection = () => {
  return (
    <Suspense fallback={<PlaylistsSkeleton />}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Reset the query when the user clicks try again
          window.location.reload();
        }}
      >
        <PlaylistsContent />
      </ErrorBoundary>
    </Suspense>
  );
};
