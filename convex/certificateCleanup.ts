import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const removeAbandonedUploads = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = (Date.now() - 24 * 60 * 60 * 1000) * 1000;
    const stale = await ctx.db.query("certificateUpload").withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff)).take(100);
    for (const upload of stale) {
      try { await ctx.storage.delete(upload.storageId as Id<"_storage">); } catch { /* A prior cleanup may already have removed the object. */ }
      await ctx.db.delete(upload._id);
    }
    return stale.length;
  },
});
