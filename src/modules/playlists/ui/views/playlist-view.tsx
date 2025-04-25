"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { PlaylistCreateModal } from "../components/playlist-create-modal";

export const PlaylistsView = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <PlaylistCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6 select-none">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Playlists</h1>
            <p className="text-xs text-muted-foreground">
              Collections you have created
            </p>
          </div>

          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-full"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon />
          </Button>
        </div>
      </div>
    </>
  );
};
