import { useEffect } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

import { Button } from "./ui/button";

interface InfiniteScrollProps {
  isManuel?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteScroll = ({
  isManuel = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManuel) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    isManuel,
    fetchNextPage,
  ]);
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef} className={"h-1"} />
      {hasNextPage ? (
        <Button
          variant={"secondary"}
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          You have reached the end of the list
        </p>
      )}
    </div>
  );
};
