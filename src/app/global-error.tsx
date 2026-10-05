"use client";

import RouteError from "@/components/RouteError";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#080808", color: "#efefeb", fontFamily: "Arial, sans-serif" }}>
        <RouteError area="Site" retry={retry} />
      </body>
    </html>
  );
}
