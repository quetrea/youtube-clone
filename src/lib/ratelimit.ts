import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
});
