import { useMemo } from "react";
import Link from "next/link";
import { VideoGetManyOutput } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenu } from "./video-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface VideoInfoProps {
  data: VideoGetManyOutput["items"][number] & {
    relevanceScore?: number;
  };
  onRemove?: () => void;
  showRelevance?: boolean;
}

export const VideoInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-10 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[70%]" />
      </div>
    </div>
  );
};

export const VideoInfo = ({ data, onRemove, showRelevance = false }: VideoInfoProps) => {
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
    if (!showRelevance || typeof data.relevanceScore !== 'number') return null;
    
    if (data.relevanceScore >= 10) return "Perfect match";
    if (data.relevanceScore >= 8) return "Excellent match";
    if (data.relevanceScore >= 6) return "Good match";
    if (data.relevanceScore >= 4) return "Relevant";
    if (data.relevanceScore >= 2) return "Somewhat relevant";
    return "Low relevance";
  }, [data.relevanceScore, showRelevance]);

  return (
    <div className="flex gap-3">
      <Link href={`/users/${data.user.id}`}>
        <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link href={`/videos/${data.id}`} className="flex-grow">
            <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
              {data.title}
            </h3>
          </Link>
          {relevanceLabel && (
            <Badge variant="outline" className="shrink-0 text-xs">
              {relevanceLabel}
            </Badge>
          )}
        </div>
        <Link href={`/users/${data.user.id}`}>
          <UserInfo name={data.user.name} />
        </Link>
        <Link href={`/videos/${data.id}`}>
          <p>
            {compactViews} views • {compactCreatedAt}
          </p>
        </Link>
        <div className="flex-shrink-0">
          <VideoMenu videoId={data.id} onRemove={onRemove} />
        </div>
      </div>
    </div>
  );
};
