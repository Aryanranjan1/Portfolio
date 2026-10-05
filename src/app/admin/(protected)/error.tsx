"use client";

import RouteError from "@/components/RouteError";

export default function AdminError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <RouteError area="Admin" retry={retry} />;
}
