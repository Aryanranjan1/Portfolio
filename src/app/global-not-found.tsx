import type { Metadata } from "next";
import "./globals.css";
import NotFoundContent from "@/components/NotFoundContent";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <NotFoundContent />
      </body>
    </html>
  );
}
