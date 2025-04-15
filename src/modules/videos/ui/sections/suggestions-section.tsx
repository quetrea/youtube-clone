"use client";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { useAuth } from "@clerk/nextjs";

import { VideoRowCard } from "../components/video-row-card";
import { VideoGridCard } from "../components/video-grid-card";

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
