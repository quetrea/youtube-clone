import { HistoryVideosSection } from "../sections/history-videos-section";
import { LikedVideosSection } from "../sections/liked-video-section";

export const LikedView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold">Liked</h1>
        <p className="text-xs text-muted-foreground">Liked videos</p>
      </div>
      <LikedVideosSection />
    </div>
  );
};
