"use client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "../components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "../components/video-grid-card";

interface SuggestionsSectionProps {
  videoId: string;
  isManuel?: boolean;
}

// Helper function to validate UUID format
const isValidUUID = (id: string | null | undefined): boolean => {
  if (!id) return false;

  // UUID v4 format regex
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const SuggestionsSection = ({
  videoId,
  isManuel,
}: SuggestionsSectionProps) => {
  return (
    <Suspense fallback={<SuggestionsSkeleton />}>
      <ErrorBoundary fallback={<SuggestionsError />}>
        <SuggestionsContentSuspense videoId={videoId} isManuel={isManuel} />
      </ErrorBoundary>
    </Suspense>
  );
};

const SuggestionsContentSuspense = ({
  videoId,
  isManuel,
}: SuggestionsSectionProps) => {
  const { userId, isSignedIn } = useAuth();

  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId: videoId,
        ...(isSignedIn && userId && isValidUUID(userId) ? { userId } : {}),
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  return (
    <>
      <div className="hidden md:block space-y-3">
        {suggestions.pages.flatMap((page) =>
          page.items.map((video) => {
            return (
              <VideoRowCard key={video.id} data={video} size={"compact"} />
            );
          })
        )}
      </div>{" "}
      <div className="block md:hidden space-y-10">
        {suggestions.pages.flatMap((page) =>
          page.items.map((video) => {
            return <VideoGridCard key={video.id} data={video} />;
          })
        )}
      </div>
      <InfiniteScroll
        isManuel={isManuel}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

const SuggestionsSkeleton = () => {
  return (
    <>
      <div className="hidden md:block space-y-3">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <VideoRowCardSkeleton key={index} size="compact" />
          ))}
      </div>
      <div className="block md:hidden space-y-10">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <VideoGridCardSkeleton key={index} />
          ))}
      </div>
    </>
  );
};

// Error fallback component for the suggestions section
const SuggestionsError = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-lg font-semibold text-destructive mb-2">
        Failed to load suggestions
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        There was an error loading the video suggestions.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
      >
        Try again
      </button>
    </div>
  );
};
