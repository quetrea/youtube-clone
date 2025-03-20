import { StudioView } from "@/modules/studio/ui/view/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";

const Page = async () => {
  void trpc.studio.getMany.prefetchInfinite();

  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

export default Page;
