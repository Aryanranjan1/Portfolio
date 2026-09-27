import { auth } from "@/auth";

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>Admin Dashboard</h1>

      <p>
        Welcome, {session?.user?.email}.
      </p>

      <section
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <div>
          <h2>Projects</h2>
          <p>
            Manage portfolio projects.
          </p>
        </div>

        <div>
          <h2>Blog</h2>
          <p>
            Manage articles.
          </p>
        </div>

        <div>
          <h2>Messages</h2>
          <p>
            View contact submissions.
          </p>
        </div>

        <div>
          <h2>Settings</h2>
          <p>
            Manage site settings.
          </p>
        </div>
      </section>
    </main>
  );
}