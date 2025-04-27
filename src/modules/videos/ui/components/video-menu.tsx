import { useState } from "react";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { APP_URL } from "@/constants";
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

// TODO: implement whats left
export const VideoMenu = ({
  videoId,
  variant = "ghost",
  onRemove,
}: VideoMenuProps) => {
  const [openPlaylistAddModal, setOpenPlaylistAddModal] = useState(false);

  const onShare = () => {
    const shareUrl = `${APP_URL}/videos/${videoId}`;

    navigator.clipboard.writeText(shareUrl);

    toast.success("Link copied to the clipboard!");
  };

  return (
    <>
      <PlaylistAddModal
        open={openPlaylistAddModal}
        onOpenChange={setOpenPlaylistAddModal}
        videoId={videoId}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} className="rounded-full" size={"icon"}>
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon size={"size-4 mr-2"} />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenPlaylistAddModal(true)}>
            <ListPlusIcon size={"size-4 mr-2"} />
            Add to playlist
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem onClick={onRemove}>
              <Trash2Icon size={"size-4 mr-2"} />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
