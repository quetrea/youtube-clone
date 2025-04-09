"use client";

import { trpc } from "@/trpc/client";
interface SuggestionsSectionProps {
  videoId: string;
}
export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
  return <div>Suggestions</div>;
};
