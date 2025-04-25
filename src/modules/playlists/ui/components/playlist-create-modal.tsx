import { ResponsiveModal } from "@/components/responsive-dialog";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PlaylistCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Playlist name is required"),
});

export const PlaylistCreateModal = ({
  open,
  onOpenChange,
}: PlaylistCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const create = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success("Playlist created", {
        description: "Your playlist has been created successfully",
      });
      form.reset();
      onOpenChange(false);
      // Invalidate any relevant queries to refresh the playlist list
      utils.playlists.getMany.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create playlist", {
        description: error.message || "Something went wrong. Please try again.",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    setIsSubmitting(true);
    create.mutate(data);
  });

  return (
    <ResponsiveModal
      title="Create New Playlist"
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          form.reset();
        }
        onOpenChange(newOpen);
      }}
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Playlist Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter playlist name"
                    {...field}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Playlist"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
