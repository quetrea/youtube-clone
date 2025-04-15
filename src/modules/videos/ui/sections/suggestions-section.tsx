"use client";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { useUser } from "@clerk/nextjs";

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
  const { user } = useUser();
  
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId: videoId,
        userId: user?.id, // Pass the user's ID if available for personalized recommendations
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
