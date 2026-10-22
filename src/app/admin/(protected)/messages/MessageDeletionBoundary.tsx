"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/AdminShell.module.css";

type DeletionState = boolean | null;
const MessageDeletionContext = createContext<((cacheInvalidated: boolean) => void) | null>(null);

export function MessageDeletionBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [cacheInvalidated, setCacheInvalidated] = useState<DeletionState>(null);

  if (cacheInvalidated !== null) {
    return (
      <div>
        <p role="status">
          {cacheInvalidated
            ? "Message permanently deleted."
            : "Message permanently deleted, but the list could not be revalidated. Refresh the message list if it remains stale."}
        </p>
        {!cacheInvalidated && (
          <button className={styles.actionButton} onClick={() => router.refresh()} type="button">
            Refresh message list
          </button>
        )}
      </div>
    );
  }

  return (
    <MessageDeletionContext.Provider value={setCacheInvalidated}>
      {children}
    </MessageDeletionContext.Provider>
  );
}

export function useMessageDeletionConfirmed() {
  const onDeleted = useContext(MessageDeletionContext);
  if (!onDeleted) throw new Error("DeleteMessageButton must be inside MessageDeletionBoundary");
  return onDeleted;
}
