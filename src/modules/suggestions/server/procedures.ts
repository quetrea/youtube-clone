import { z } from "zod";
import {
  eq,
  and,
  or,
  lt,
  desc,
  getTableColumns,
  not,
  sql,
  inArray,
} from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  videoReactions,
  videos,
  videoViews,
  subscriptions,
} from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        userId: z.string().uuid().optional(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, videoId, userId } = input;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // 1. Find user's viewing history if userId is provided
      let userViewedVideoIds: string[] = [];
      let userSubscribedCreatorIds: string[] = [];

      if (userId) {
        // Get videos the user has already viewed
        const userViews = await db
          .select({ videoId: videoViews.videoId })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
          .limit(50); // Limit to recent views

        userViewedVideoIds = userViews.map((view) => view.videoId);

        // Get creators the user has subscribed to
        const userSubscriptions = await db
          .select({ creatorId: subscriptions.creatorId })
          .from(subscriptions)
          .where(eq(subscriptions.viewerId, userId));

        userSubscribedCreatorIds = userSubscriptions.map(
          (sub) => sub.creatorId
        );
      }

      // Main query with advanced recommendations
      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          // Calculate a relevance score based on multiple factors
          relevanceScore: sql<number>`
            CASE
              -- Same category gets a boost
              WHEN ${videos.categoryId} = ${existingVideo.categoryId} THEN 50
              ELSE 0
            END
            +
            -- Popularity boost based on views and likes
            (SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${
            videos.id
          }) * 0.1
            +
            (SELECT COUNT(*) FROM ${videoReactions} 
             WHERE ${videoReactions.videoId} = ${videos.id} 
             AND ${videoReactions.type} = 'like') * 0.5
            -
            -- Small penalty for dislikes
            (SELECT COUNT(*) FROM ${videoReactions} 
             WHERE ${videoReactions.videoId} = ${videos.id} 
             AND ${videoReactions.type} = 'dislike') * 0.2
            ${
              // Boost for videos from subscribed creators
              userSubscribedCreatorIds.length > 0
                ? sql` + CASE WHEN ${
                    videos.userId
                  } IN (${userSubscribedCreatorIds.join(
                    ","
                  )}) THEN 30 ELSE 0 END`
                : sql``
            }
          `.as("relevance_score"),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            // Exclude current video
            not(eq(videos.id, existingVideo.id)),
            // Only public videos
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(sql`relevance_score`), desc(videos.updatedAt))
        .limit(limit + 1);

      const hasMore = data.length > limit;

      // Remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});
