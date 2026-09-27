import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const adminEmail =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  if (!adminEmail) {
    throw new Error(
      "ADMIN_EMAIL is not defined",
    );
  }

  const sessionEmail =
    session.user.email
      .trim()
      .toLowerCase();

  if (sessionEmail !== adminEmail) {
    throw new Error("FORBIDDEN");
  }

  return session.user;
}