import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type VideoGetOneOutput =
  inferRouterOutputs<AppRouter>["videos"]["getOne"];

// TODO: Change to video GetMany
export type VideoGetManyOutput =
  inferRouterOutputs<AppRouter>["suggestions"]["getMany"];

// Adding types for the search results with relevance score
export type SearchResultItem = inferRouterOutputs<AppRouter>["search"]["getMany"]["items"][number] & {
  relevanceScore: number;
}

export type SearchResultOutput = Omit<inferRouterOutputs<AppRouter>["search"]["getMany"], "items"> & {
  items: SearchResultItem[];
};
