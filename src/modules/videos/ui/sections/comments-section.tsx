"use client";
import { Suspense } from "react";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentsSectionsProps {
  videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionsProps) => {
  return (
    <Suspense fallback={<CommentsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>...error</p>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CommentsSectionSkeleton = () => {
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        {/* Comment count skeleton */}
        <Skeleton className="h-7 w-32" />

        {/* Comment form skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-20 flex-1 rounded-lg" />
        </div>

        {/* Comments list skeleton */}
        <div className="flex flex-col gap-4 mt-2">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2 mt-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const CommentsSectionSuspense = ({ videoId }: CommentsSectionsProps) => {
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">
          {comments.pages[0].totalCount} Comments
        </h1>
        <CommentForm videoId={videoId} onSuccess={() => {}} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.pages
            .flatMap((page) => page.items)
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          <InfiniteScroll
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
          />
        </div>
      </div>
    </div>
  );
};
