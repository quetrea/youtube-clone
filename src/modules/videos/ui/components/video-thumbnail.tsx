import { formatDuration } from "@/lib/utils";
import Image from "next/image";

import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoThumbnailProps {
  title: string;
  duration: number;
  imageUrl?: string;
  previewUrl?: string;
}

import { Skeleton } from "@/components/ui/skeleton";

export const VideoThumbnailSkeleton = () => {
  return (
    <div className={"relative w-full overflow-hidden  rounded-xl aspect-video"}>
      <Skeleton className="size-full" />
    </div>
  );
};

export const VideoThumbnail = ({
  imageUrl,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      {/* Thumbnail wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        {/* Default Image */}
        <Image
          src={imageUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="absolute h-full w-full object-cover  group-hover:opacity-0 transition-opacity duration-300"
        />

        {/* Preview Image (only shown on hover if previewUrl exists) */}
        {previewUrl && (
          <Image
            unoptimized={!!previewUrl}
            src={previewUrl ?? THUMBNAIL_FALLBACK}
            alt={`${title} preview`}
            fill
            className="absolute h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}
      </div>

      {/* Video duration box */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium  pointer-events-none">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
