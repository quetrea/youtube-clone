import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TrashIcon,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { CommentForm } from "./comment-form";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { CommentsGetManyOutput } from "../../types";

interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number];
  variant?: "reply" | "comment";
}

export const CommentItem = ({
  comment,
  variant = "comment",
}: CommentItemProps) => {
  const clerk = useClerk();
  const { userId } = useAuth();

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setAreRepliesOpen] = useState(false);

  const utils = trpc.useUtils();
  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Failed to delete comment");

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Failed to like comment");

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Failed to dislike comment");

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const isPending = remove.isPending || like.isPending || dislike.isPending;

  const handleRemove = () => {
    remove.mutate({ commentId: comment.id });
  };

  const handleLike = () => {
    like.mutate({ commentId: comment.id });
  };
  const handleDislike = () => {
    dislike.mutate({ commentId: comment.id });
  };
  return (
    <div className=" rounded-xl p-6  transition-colors duration-300">
      <div
        className={cn("flex gap-4 group", {
          "opacity-50": isPending,
        })}
        data-state={isPending ? "loading" : "default"}
      >
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={"lg"}
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>
        <div className="flex-1 min-w-0 group">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-meidum text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
          <p className="text-sm ">{comment.value}</p>

          <div
            className={cn(
              "flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-all",
              {
                "opacity-70": isPending,
                "opacity-100":
                  comment.likeCount > 0 || comment.dislikeCount > 0,
              }
            )}
          >
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={isPending}
                    className="size-8"
                    size={"icon"}
                    variant={"ghost"}
                    onClick={handleLike}
                  >
                    <ThumbsUpIcon
                      className={cn(
                        comment.viewerReactions === "like" && "fill-black"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <span>{comment.likeCount}</span>
                <TooltipContent side="top" className="bg-black/80">
                  <p>Like</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={isPending}
                    className="size-8"
                    size={"icon"}
                    variant={"ghost"}
                    onClick={handleDislike}
                  >
                    <ThumbsDownIcon
                      className={cn(
                        comment.viewerReactions === "dislike" && "fill-black"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <span>{comment.dislikeCount}</span>
                <TooltipContent side="top" className="bg-black/80">
                  <p>Dislike</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {variant === "comment" && (
              <Button
                variant={"ghost"}
                size={"sm"}
                className="h-8"
                onClick={() => setIsReplyOpen(true)}
              >
                Reply
              </Button>
            )}
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {variant === "comment" && (
              <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                <MessageSquareIcon className="size-4 " />
                Reply
              </DropdownMenuItem>
            )}
            {comment.user.clerkId === userId && (
              <DropdownMenuItem
                onClick={handleRemove}
                disabled={remove.isPending}
              >
                <TrashIcon className="size-4 " />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentForm
            variant="reply"
            parentId={comment.id}
            videoId={comment.videoId}
            onCancel={() => setIsReplyOpen(false)}
            onSuccess={() => {
              setIsReplyOpen(false);
              setAreRepliesOpen(true);
            }}
          />
        </div>
      )}
    </div>
  );
};
