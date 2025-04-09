import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@clerk/nextjs";
import { UserIcon } from "lucide-react";

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
}

export const CommentForm = ({ videoId, onSuccess }: CommentFormProps) => {
  const { user } = useUser();
  return (
    <form className="flex gap-4 group">
      {user ? (
        <UserAvatar
          size={"lg"}
          imageUrl={user.imageUrl}
          name={user.username || "User"}
        />
      ) : (
        <div className="bg-gray-200 text-gray-500  rounded-full flex items-center justify-center h-10 w-10 ">
          <UserIcon className="size-6" />
        </div>
      )}

      <div className="flex-1">
        <Textarea
          placeholder="Add a comment..."
          className="resize-none bg-transparent overflow-hidden min-h-0"
        />
        <div className="justify-end gap-2 mt-2 flex">
          <Button type="submit" size={"sm"}>
            Comment
          </Button>
        </div>
      </div>
    </form>
  );
};
