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
import { SearchResultItem } from "@/modules/videos/types";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ResultsSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
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
        {error.message || "Failed to load search results"}
      </p>
      <Button variant="outline" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
};

// Loading skeleton for desktop view
const ResultsSkeletonDesktop = () => (
  <div className="hidden flex-col gap-4 md:flex">
    {Array.from({ length: 5 }).map((_, index) => (
      <VideoRowCardSkeleton key={index} />
    ))}
  </div>
);

// Loading skeleton for mobile view
const ResultsSkeletonMobile = () => (
  <div className="flex flex-col gap-4 gap-y-10 pt-6 md:hidden p-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <VideoGridCardSkeleton key={index} />
    ))}
  </div>
);

// Loading component that handles both mobile and desktop views
const ResultsSkeleton = () => {
  const isMobile = useIsMobile();
  return isMobile ? <ResultsSkeletonMobile /> : <ResultsSkeletonDesktop />;
};

// Results content component
const ResultsContent = ({ query, categoryId }: ResultsSectionProps) => {
  const isMobile = useIsMobile();

  const [results, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      query,
      categoryId: categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Process items to ensure relevanceScore is properly typed
  const items = results.pages.flatMap((page) =>
    page.items.map((item) => ({
      ...item,
      // Ensure relevanceScore is a number (could be undefined from the API)
      relevanceScore:
        typeof item.relevanceScore === "number" ? item.relevanceScore : 0,
    }))
  );

  // Determine if we should show relevance indicators
  const showRelevance = !!query && query.trim() !== "";

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col gap-4 gap-y-10">
          {items.map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
              showRelevance={showRelevance}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((video) => (
            <VideoRowCard
              key={video.id}
              data={video}
              showRelevance={showRelevance}
            />
          ))}
        </div>
      )}
      <InfiniteScroll
        hasNextPage={resultQuery.hasNextPage}
        isFetchingNextPage={resultQuery.isFetchingNextPage}
        fetchNextPage={resultQuery.fetchNextPage}
      />
    </>
  );
};

// Main component with Suspense and Error boundaries
export const ResultsSection = (props: ResultsSectionProps) => {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Reset the query when the user clicks try again
          window.location.reload();
        }}
      >
        <ResultsContent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};
