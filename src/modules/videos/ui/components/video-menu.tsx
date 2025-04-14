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
  const onShare = () => {
    // TODO: Change if deploying outside of VERCEL
    const shareUrl = `${
      process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
    }/videos/${videoId}`;

    navigator.clipboard.writeText(shareUrl);

    toast.success("Link copied to the clipboard!");
  };

  return (
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
        <DropdownMenuItem onClick={() => {}}>
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
  );
};
