"use client";

import RouteError from "@/components/RouteError";

export default function PublicError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <RouteError area="Portfolio" retry={retry} />;
}
