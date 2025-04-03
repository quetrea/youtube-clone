"use client";

import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StudioUploader } from "./studio-uploader";
import { ResponsiveModal } from "@/components/responsive-dialog";
import { useRouter } from "next/navigation";

interface UploadModalProps {
  open: boolean;
  action: (open: boolean) => void;
  url: string | null;
}

export const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.success("Something went wrong!");
    },
  });

  const handleCreate = () => {
    if (!create.isPending) {
      create.mutate();
    }
    document.title = "Creating";
  };

  const open = !!create.data?.url;
  const action = create.reset;
  const url = create.data?.url ?? "";

  const onSuccess = () => {
    if (!create.data?.video.id) return;

    create.reset();
    router.push(`/studio/videos/${create.data.video.id}`);
  };

  return (
    <>
      <ResponsiveModal title="Upload a video" open={open} onOpenChange={action}>
        {url ? (
          <StudioUploader endpoint={url} onSuccess={onSuccess} />
        ) : (
          <Loader2Icon />
        )}
      </ResponsiveModal>

      <Button
        variant={"secondary"}
        onClick={handleCreate}
        disabled={create.isPending}
      >
        {create.isPending ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <PlusIcon className="" />
        )}
        Create
      </Button>
    </>
  );
};
