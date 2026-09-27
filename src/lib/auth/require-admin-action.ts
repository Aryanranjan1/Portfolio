import { auth } from "@/auth";

export async function requireAdminAction() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
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