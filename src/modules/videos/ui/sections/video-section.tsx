"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

import {
  VideoPlayer,
  VideoPlayerSkeleton,
} from "@/modules/videos/ui/components/video-player";
import { VideoBanner } from "../components/video-banner";
import { VideoTopRow, VideoTopRowSkeleton } from "../components/video-top-row";
import { useAuth } from "@clerk/nextjs";

interface VideoSectionProps {
  videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionSkeleton = () => {
  return (
    <>
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
    </>
  );
};

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
  const { isSignedIn, userId } = useAuth();

  const utils = trpc.useUtils();

  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  const handlePlay = () => {
    if (!isSignedIn) return;

    createView.mutate({ videoId });
  };
  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        {(video.visibility !== "private" || userId === video.user.clerkId) && (
          <VideoPlayer
            autoPlay
            onPlay={handlePlay}
            playbackId={video.muxPlaybackId}
            thumbnailUrl={video.thumbnailUrl}
          />
        )}

        {video.visibility === "private" && userId !== video.user.clerkId && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Private Video</h3>
              <p>
                This video is private and can only be viewed by the creator.
              </p>
            </div>
          </div>
        )}
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};
