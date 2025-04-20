"use client";

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

interface ResultsSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
}

export const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
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
