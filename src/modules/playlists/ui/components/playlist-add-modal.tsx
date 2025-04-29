import { ResponsiveModal } from "@/components/responsive-dialog";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { Loader2, SquareCheckIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { toast } from "sonner";

interface PlaylistAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const PlaylistAddModal = ({
  open,
  onOpenChange,
  videoId,
}: PlaylistAddModalProps) => {
  const utils = trpc.useUtils();
  const {
    data: playlists,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.playlists.getManyForVideo.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      videoId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!videoId && open,
    }
  );

  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: (data) => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId });
      toast.success("Video added to playlist");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId });

      toast.success("Video removed from playlist");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <ResponsiveModal
      title="Add to playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {playlists?.pages?.flatMap((page, index) => (
              <div key={index}>
                {page.items.map((playlist) => (
                  <Button
                    variant={"ghost"}
                    className="w-full justify-start px-2 [&_svg]:size-5 "
                    size={"lg"}
                    key={playlist.id}
                    onClick={() => {
                      if (playlist.containsVideo) {
                        removeVideo.mutate({
                          playlistId: playlist.id,
                          videoId,
                        });
                      } else {
                        addVideo.mutate({
                          playlistId: playlist.id,
                          videoId,
                        });
                      }
                    }}
                    disabled={removeVideo.isPending || addVideo.isPending}
                  >
                    {playlist.containsVideo ? (
                      <SquareCheckIcon className="mr-2" />
                    ) : (
                      <SquareIcon className="mr-2" />
                    )}
                    {playlist.name}
                  </Button>
                ))}
                {!isLoading && (
                  <InfiniteScroll
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
};
