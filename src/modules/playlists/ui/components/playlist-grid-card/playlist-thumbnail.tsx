import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaylistThumbnailProps {
  title: string;
  videoCount: number;
  className?: string;
  thumbnailUrl?: string | null;
  aspectRatio?: "video" | "custom";
}

export const PlaylistThumbnail = ({
  title,
  videoCount,
  className,
  thumbnailUrl,
  aspectRatio,
}: PlaylistThumbnailProps) => {
  const compactCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(videoCount);
  }, [videoCount]);
  return (
    <div className={cn("relative pt-3 group", className)}>
      {/* Stack Effect Layers */}
      <div className="relative">
        {/* Background layers */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden
         rounded-xl bg-black/20 aspect-video"
        />
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden
         rounded-xl bg-black/25 aspect-video"
        />

        {/* Main Image */}
        <div className="relative rounded-xl aspect-video">
          <Image
            src={thumbnailUrl || THUMBNAIL_FALLBACK}
            alt={title}
            fill
            className="object-cover rounded-xl w-full h-full"
          />

          {/* Hover overlay */}
          <div
            className="absolute inset-0 rounded-xl bg-black/70 opacity-0 
          group-hover:opacity-100 transition-opacity 
          flex items-center justify-center"
          >
            <div className="flex items-center gap-x-2">
              <PlayIcon className="size-4 text-white fill-white" />
              <span className="text-white font-medium">Play all</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video count indicator */}
      <div
        className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 
      text-white text-xs font-medium flex items-center gap-x-1"
      >
        <ListVideoIcon className="size-4" />
        {compactCount} videos
      </div>
    </div>
  );
};

export const PlaylistThumbnailSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div className={cn("relative pt-3", className)}>
      {/* Stack Effect Layers */}
      <div className="relative">
        {/* Background layers */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%]
           rounded-xl bg-black/20 aspect-video"
        />
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%]
           rounded-xl bg-black/25 aspect-video"
        />

        {/* Main Image Skeleton */}
        <Skeleton className="relative rounded-xl aspect-video w-full" />
      </div>

      {/* Video count indicator skeleton */}
      <div className="absolute bottom-2 right-2">
        <Skeleton className="h-5 w-20 rounded" />
      </div>
    </div>
  );
};
