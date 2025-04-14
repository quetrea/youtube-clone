"use client";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { VideoRowCard } from "../components/video-row-card";
import { VideoGridCard } from "../components/video-grid-card";

interface SuggestionsSectionProps {
  videoId: string;
  isManuel?: boolean;
}
export const SuggestionsSection = ({
  videoId,
  isManuel,
}: SuggestionsSectionProps) => {
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId: videoId,
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
