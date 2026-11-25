import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("remove abandoned certificate uploads", { hours: 1 }, internal.certificateCleanup.removeAbandonedUploads);

export default crons;
