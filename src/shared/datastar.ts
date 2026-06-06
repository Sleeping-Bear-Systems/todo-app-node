import type { Context } from "hono";
import { streamSSE } from "hono/streaming";

export async function sseRedirect(c: Context, url: string): Promise<Response> {
  const safeUrl = JSON.stringify(url).replace(/<\//g, "<\\/");

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: "datastar-patch-elements",
      data: `selector body\nmode append\nelements <script>window.location.href=${safeUrl}</script>`,
    });
  });
}
