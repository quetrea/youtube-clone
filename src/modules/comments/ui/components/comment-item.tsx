import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronUpIcon,
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

import { formatDistanceToNow, format } from "date-fns";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { CommentsGetManyOutput } from "../../types";
import { CommentReplies } from "./comment-replies";

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
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const [likeClicked, setLikeClicked] = useState(false);
  const [dislikeClicked, setDislikeClicked] = useState(false);

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
    setLikeClicked(true);
    setTimeout(() => setLikeClicked(false), 300);
    like.mutate({ commentId: comment.id });
  };
  const handleDislike = () => {
    setDislikeClicked(true);
    setTimeout(() => setDislikeClicked(false), 300);
    dislike.mutate({ commentId: comment.id });
  };
  return (
    <div className=" rounded-xl p-2 transition-colors duration-300">
      <div
        className={cn("flex gap-4 group", {
          "opacity-50": isPending,
        })}
        data-state={isPending ? "loading" : "default"}
      >
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={variant === "comment" ? "lg" : "sm"}
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>
        <div className="flex-1 min-w-0 group/comment">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-meidum text-sm pb-0.5">
                {comment.user.name}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground hover:underline cursor-pointer hover:text-muted-foreground/80 transition-colors">
                    {formatDistanceToNow(comment.createdAt, {
                      addSuffix: true,
                    })}
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-black/80 max-w-[200px] px-3 py-2"
                >
                  <div className="flex flex-col gap-1 text-sm font-normal">
                    <p className="text-gray-300">
                      {format(comment.createdAt, "PPpp")}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </Link>
          <p className="text-sm ">{comment.value}</p>

          <div className="relative overflow-hidden">
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height:
                    comment.likeCount > 0 || comment.dislikeCount > 0
                      ? "auto"
                      : ["0px", "auto"],
                  opacity:
                    comment.likeCount > 0 || comment.dislikeCount > 0
                      ? 1
                      : [0, 1],
                }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  opacity: { duration: 0.2 },
                }}
                className="origin-top border-t border-transparent group-hover/comment:border-gray-100 mt-2 pt-2"
                style={{
                  transformOrigin: "top",
                  pointerEvents: "auto",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Button
                            disabled={isPending}
                            className={cn(
                              "size-8",
                              comment.viewerReactions === "like" &&
                                "animate-like"
                            )}
                            size={"icon"}
                            variant={"ghost"}
                            onClick={handleLike}
                          >
                            <motion.div
                              animate={{
                                scale: likeClicked
                                  ? [1, 1.4, 1]
                                  : comment.viewerReactions === "like"
                                  ? 1.1
                                  : 1,
                              }}
                              transition={{
                                duration: 0.3,
                                type: likeClicked ? "tween" : "spring",
                                stiffness: 300,
                              }}
                            >
                              <ThumbsUpIcon
                                className={cn(
                                  "transition-transform",
                                  comment.viewerReactions === "like" &&
                                    "fill-black"
                                )}
                              />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <motion.span
                        key={comment.likeCount}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          comment.viewerReactions === "like" && "text-blue-500"
                        )}
                      >
                        {comment.likeCount}
                      </motion.span>
                      <TooltipContent side="top" className="bg-black/80">
                        <p>Like</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Button
                            disabled={isPending}
                            className={cn(
                              "size-8",
                              comment.viewerReactions === "dislike" &&
                                "animate-like"
                            )}
                            size={"icon"}
                            variant={"ghost"}
                            onClick={handleDislike}
                          >
                            <motion.div
                              animate={{
                                scale: dislikeClicked
                                  ? [1, 1.4, 1]
                                  : comment.viewerReactions === "dislike"
                                  ? 1.1
                                  : 1,
                              }}
                              transition={{
                                duration: 0.3,
                                type: dislikeClicked ? "tween" : "spring",
                                stiffness: 300,
                              }}
                            >
                              <ThumbsDownIcon
                                className={cn(
                                  "transition-transform",
                                  comment.viewerReactions === "dislike" &&
                                    "fill-black"
                                )}
                              />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <motion.span
                        key={comment.dislikeCount}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          comment.viewerReactions === "dislike" &&
                            "text-blue-500"
                        )}
                      >
                        {comment.dislikeCount}
                      </motion.span>
                      <TooltipContent side="top" className="bg-black/80">
                        <p>Dislike</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {variant === "comment" && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={"ghost"}
                        size={"sm"}
                        className="h-8"
                        onClick={() => setIsReplyOpen(true)}
                      >
                        Reply
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
              <MessageSquareIcon className="size-4 " />
              Reply
            </DropdownMenuItem>

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
              setIsRepliesOpen(true);
            }}
          />
        </div>
      )}
      {comment.replyCount > 0 && variant === "comment" && (
        <div className="pl-14">
          <Button
            size="sm"
            variant={"tertiary"}
            className="text-blue-500"
            onClick={() => setIsRepliesOpen((current) => !current)}
          >
            {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {comment.replyCount} replies
          </Button>
        </div>
      )}
      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies parentId={comment.id} videoId={comment.videoId} />
      )}
    </div>
  );
};
