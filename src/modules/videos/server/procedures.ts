import { db } from "@/db";
import { z } from "zod";
import {
  subscriptions,
  users,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { mux } from "@/lib/mux";
import { UTApi } from "uploadthing/server";
import { PgColumn } from "drizzle-orm/pg-core";

export const videosRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;

      let userId;

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      );

      const [existingVideo] = await db
        .with(viewerReactions, viewerSubscriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users),
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ),
            viewerSubscribed: isNotFull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            ),
          },
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
          viewerReaction: viewerReactions.type,
        })
        .from(videos)
        .innerJoin(users, eq(users.id, videos.userId))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        )
        .where(eq(videos.id, input.id))
        .limit(1);

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingVideo;
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [existingVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl: null,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingVideo.thumbnailKey);
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const utapi = new UTApi();
      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

      const uploadedThumbnail = await utapi.uploadFilesFromUrl(
        tempThumbnailUrl
      );

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data;

      const [restoredVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl,
          thumbnailKey,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return restoredVideo;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [deletedVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (deletedVideo.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(deletedVideo.thumbnailKey);
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }

      if (!deletedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedVideo;
    }),
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updatedVideo;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*", // TODO: In production, set to your url
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Başlıksız",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return { video: video, url: upload.url };
  }),
});
function isNotFull(
  viewerId: PgColumn<
    {
      name: "viewer_id";
      tableName: "viewer_subscriptions";
      dataType: "string";
      columnType: "PgUUID";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    },
    {},
    {}
  >
): any {
  throw new Error("Function not implemented.");
}
