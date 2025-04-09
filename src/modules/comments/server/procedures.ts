import { z } from "zod";

import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { db } from "@/db";
import { commentInsertSchema, comments } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        value: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId, value } = input;
      const { id: userId } = ctx.user;

      const [createComment] = await db
        .insert(comments)
        .values({ userId, videoId, value })
        .returning();

      return createComment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const { videoId } = input;

      const data = await db
        .select()
        .from(comments)
        .where(eq(comments.videoId, videoId));

      return data;
    }),
});
