import { useMemo } from "react";
import Link from "next/link";
import { VideoGetManyOutput } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenu } from "./video-menu";

interface VideoInfoProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);

  const compactCreatedAt = useMemo(() => {
    return formatDistanceToNow(data.createdAt);
  }, [data.createdAt]);

  return (
    <div className="flex gap-3">
      <Link href={`/users/${data.user.id}`}>
        <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/videos/${data.id}`}>
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {data.title}
          </h3>
        </Link>
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
