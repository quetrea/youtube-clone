import { z } from "zod";
import {
  eq,
  and,
  or,
  lt,
  desc,
  ilike,
  getTableColumns,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const searchRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string().nullish(),
        categoryId: z.string().uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
            relevanceScore: z.number().optional(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, query, categoryId } = input;

      // Simple search if query is empty or null
      if (!query || query.trim() === '') {
        const data = await db
          .select({
            ...getTableColumns(videos),
            user: users,
            relevanceScore: sql<number>`1`, // Default score for non-search results
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
          })
          .from(videos)
          .innerJoin(users, eq(videos.userId, users.id))
          .where(
            and(
              categoryId ? eq(videos.categoryId, categoryId) : undefined,
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
          .orderBy(desc(videos.updatedAt), desc(videos.id))
          .limit(limit + 1);

        const hasMore = data.length > limit;
        const items = hasMore ? data.slice(0, -1) : data;
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
      }

      // Perform search with relevance scoring
      const cleanQuery = query.trim();
      const queryWords = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);
      
      // Define the SQL for the relevance score calculation to reuse
      const relevanceScoreSQL = sql<number>`
        CASE 
          -- Exact match gets highest score (10)
          WHEN LOWER(${videos.title}) = ${cleanQuery.toLowerCase()} THEN 10
          -- Title starts with query gets high score (8)
          WHEN LOWER(${videos.title}) LIKE ${`${cleanQuery.toLowerCase()}%`} THEN 8
          -- Contains all words in exact order gets good score (6)
          WHEN LOWER(${videos.title}) LIKE ${`%${cleanQuery.toLowerCase()}%`} THEN 6
          -- Contains all words but not in order gets decent score (4)
          WHEN ${queryWords.every(word => sql`LOWER(${videos.title}) LIKE ${'%' + word + '%'}`)} THEN 4
          -- Contains some words gets lower score (2)
          WHEN ${queryWords.some(word => sql`LOWER(${videos.title}) LIKE ${'%' + word + '%'}`)} THEN 2
          -- Fall back for any other matches
          ELSE 1
        END
        -- Multiply by recency factor (optional)
        * (1.0 + (EXTRACT(EPOCH FROM (${videos.updatedAt} - '1970-01-01'::timestamp)) / 
          EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - '1970-01-01'::timestamp)) * 0.5))
      `;
      
      // For cursor pagination, we'll use a simpler approach
      let whereClause;
      if (categoryId && cursor) {
        // With category filter and cursor pagination
        whereClause = and(
          or(
            ...queryWords.map(word => 
              ilike(videos.title, `%${word}%`)
            ),
            ilike(videos.description, `%${cleanQuery}%`)
          ),
          eq(videos.categoryId, categoryId),
          cursor ? lt(videos.id, cursor.id) : undefined
        );
      } else if (categoryId) {
        // With category filter only
        whereClause = and(
          or(
            ...queryWords.map(word => 
              ilike(videos.title, `%${word}%`)
            ),
            ilike(videos.description, `%${cleanQuery}%`)
          ),
          eq(videos.categoryId, categoryId)
        );
      } else if (cursor) {
        // With cursor pagination only
        whereClause = and(
          or(
            ...queryWords.map(word => 
              ilike(videos.title, `%${word}%`)
            ),
            ilike(videos.description, `%${cleanQuery}%`)
          ),
          lt(videos.id, cursor.id)
        );
      } else {
        // Basic search query
        whereClause = or(
          ...queryWords.map(word => 
            ilike(videos.title, `%${word}%`)
          ),
          ilike(videos.description, `%${cleanQuery}%`)
        );
      }
      
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
          // Calculate relevance score using SQL
          relevanceScore: relevanceScoreSQL,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(whereClause)
        .orderBy(desc(relevanceScoreSQL), desc(videos.updatedAt), desc(videos.id))
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
            relevanceScore: lastItem.relevanceScore,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});
