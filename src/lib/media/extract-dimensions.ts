import imageSize from "next/dist/compiled/image-size";
import { spawn } from "node:child_process";

const MAX_DATABASE_INTEGER = 2_147_483_647;

export async function extractMediaDimensions(bytes: Uint8Array, mimeType: string): Promise<{ width: number | null; height: number | null }> {
  if (mimeType.startsWith("image/")) {
    try {
      const result = imageSize(bytes);
      const swapsAxes = result.orientation === 5 || result.orientation === 6 || result.orientation === 7 || result.orientation === 8;
      const width = swapsAxes ? result.height : result.width;
      const height = swapsAxes ? result.width : result.height;
      return { width: validDimension(width), height: validDimension(height) };
    } catch {
      return { width: null, height: null };
    }
  }
  if (mimeType.startsWith("video/")) {
    try {
      const stdout = await probeVideoDimensions(bytes);
      const stream = (JSON.parse(stdout) as { streams?: { width?: number; height?: number }[] }).streams?.[0];
      return { width: validDimension(stream?.width), height: validDimension(stream?.height) };
    } catch {
      return { width: null, height: null };
    }
  }
  return { width: null, height: null };
}

function validDimension(value: number | undefined): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_DATABASE_INTEGER ? value : null;
}

function probeVideoDimensions(bytes: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", "pipe:0"], { stdio: ["pipe", "pipe", "ignore"] });
    let output = "";
    const timeout = setTimeout(() => child.kill("SIGKILL"), 2500);
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { output += chunk; if (output.length > 16 * 1024) child.kill("SIGKILL"); });
    child.once("error", (error) => { clearTimeout(timeout); reject(error); });
    child.once("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve(output); else reject(new Error("VIDEO_DIMENSIONS_UNAVAILABLE"));
    });
    child.stdin.end(Buffer.from(bytes));
  });
}
