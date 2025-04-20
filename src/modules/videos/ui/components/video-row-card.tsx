import Link from "next/link";
import { useMemo } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { UserInfo } from "@/modules/users/ui/components/user-info";
import { UserAvatar } from "@/components/user-avatar";

import { VideoMenu } from "./video-menu";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoGetManyOutput } from "../../types";
import { formatDistanceToNow } from "date-fns";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutput["items"][number] & {
    relevanceScore?: number;
  };
  onRemove?: () => void;
  showRelevance?: boolean;
}

export const VideoRowCardSkeleton = ({
  size = "default",
}: VariantProps<typeof videoRowCardVariants>) => {
  return (
    <div className={videoRowCardVariants({ size })}>
      <div className={thumbnailVariants({ size })}>
        <VideoThumbnailSkeleton />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <div className="flex-1 min-w-0">
            <Skeleton
              className={cn("h-5 w-[40%]", size === "compact" && "h-4 w-[40%]")}
            />
            {size === "default" && (
              <>
                <Skeleton className="h-4 w-[20%] mt-1" />
                <div className="flex items-center gap-2 my-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </>
            )}
            {size === "compact" && (
              <>
                <Skeleton className="h-4 w-[50%] mt-1" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoRowCard = ({
  data,
  size = "default",
  onRemove,
  showRelevance = false,
}: VideoRowCardProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);

  const compactCreatedAt = useMemo(() => {
    return formatDistanceToNow(data.createdAt);
  }, [data.createdAt]);

  // Get a label for the relevance score
  const relevanceLabel = useMemo(() => {
    if (!showRelevance || typeof data.relevanceScore !== "number") return null;

    if (data.relevanceScore >= 10) return "Perfect match";
    if (data.relevanceScore >= 8) return "Excellent match";
    if (data.relevanceScore >= 6) return "Good match";
    if (data.relevanceScore >= 4) return "Relevant";
    if (data.relevanceScore >= 2) return "Somewhat relevant";
    return "Low relevance";
  }, [data.relevanceScore, showRelevance]);

  return (
    <div className={videoRowCardVariants({ size })}>
      <Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl!}
          previewUrl={data.previewUrl!}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      {/*Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "font-medium line-clamp-2 flex-grow",
                  size === "compact" ? "text-sm" : "text-base"
                )}
              >
                {data.title}
              </h3>
              {relevanceLabel && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {relevanceLabel}
                </Badge>
              )}
            </div>
            {size === "default" && (
              <>
                <div className="flex items-center gap-2 my-3">
                  <UserAvatar
                    size={"sm"}
                    imageUrl={data.user.imageUrl}
                    name={data.user.name}
                  />
                  <UserInfo size={"sm"} name={data.user.name} />
                </div>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground w-fit line-clamp-2">
                      {data.description ?? "No description"}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-black/70"
                  >
                    <p className="text-xs text-muted-foreground">
                      From the video description
                    </p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {size === "default" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compactViews} views • {formatDistanceToNow(data.createdAt)}
              </p>
            )}
            {size === "compact" && (
              <UserInfo size={"sm"} name={data.user.name} />
            )}
            {size === "compact" && (
              <p className="text-xs text-muted-foreground">
                {data.viewCount} views • {compactCreatedAt}
              </p>
            )}
          </Link>
          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};
