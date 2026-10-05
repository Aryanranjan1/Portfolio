import Link from "next/link";

import type { ContactSubmissionStatus } from "@/db/mutations/contact";
import { getAdminMessages } from "@/db/queries/admin";
import styles from "@/components/admin/AdminShell.module.css";
import MessageStatusButton from "./MessageStatusButton";

type MessagesPageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

const statuses: ContactSubmissionStatus[] = ["unread", "read", "replied", "archived"];

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;
  const selectedStatus = statuses.find((status) => status === params.status);
  const messages = await getAdminMessages(selectedStatus, params.q);

  return (
    <main>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Inbox</p>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.intro}>Contact form submissions, newest first. Messages remain stored until manually removed from the database.</p>
        </div>
      </header>

      <nav className={styles.quickLinks} aria-label="Filter messages">
        <Link className={styles.quickLink} href={messageHref(undefined, params.q)}>All</Link>
        {statuses.map((status) => <Link aria-current={selectedStatus === status ? "page" : undefined} className={styles.quickLink} href={messageHref(status, params.q)} key={status}>{status}</Link>)}
      </nav>

      <form action="/admin/messages" className={styles.listToolbar}>
        {selectedStatus && <input name="status" type="hidden" value={selectedStatus} />}
        <label className={styles.searchField}><span>Search messages</span><input defaultValue={params.q ?? ""} maxLength={120} name="q" placeholder="Sender, email, subject, or message" /></label>
        <button className={styles.quickLink} type="submit">Search</button>
      </form>

      {messages.length === 0 ? (
        <section className={styles.statCard} aria-live="polite">No messages in this view.</section>
      ) : (
        <section className={styles.messageList} aria-label="Contact messages">
          {messages.map((message) => (
            <article className={styles.messageCard} key={message.id}>
              <div className={styles.messageHeader}>
                <div>
                  <h2>{message.subject}</h2>
                  <p className={styles.messageByline}>{message.name} · <a href={`mailto:${message.email}`}>{message.email}</a></p>
                </div>
                <span className={styles.messageStatus}>{message.status}</span>
              </div>
              <p className={styles.messageDate}>{message.submittedAt.toLocaleString()}</p>
              <details className={styles.messageDetails}>
                <summary>Open message</summary>
                <p className={styles.messageBody}>{message.message}</p>
              </details>
              <div className={styles.messageActions}>
                <a className={styles.quickLink} href={gmailComposeUrl(message.email, message.subject)}>Reply in Gmail ↗</a>
                {statuses.map((status) => (
                  status !== message.status && (
                    <MessageStatusButton id={message.id} key={status} status={status} />
                  )
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function gmailComposeUrl(email: string, subject: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: email, su: `Re: ${subject}` });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function messageHref(status: ContactSubmissionStatus | undefined, search?: string) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (search) query.set("q", search);
  return query.size ? `/admin/messages?${query.toString()}` : "/admin/messages";
}
