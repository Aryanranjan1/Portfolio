/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useState, type FormEvent } from "react";
import { submitCommentAction } from "@/app/actions/comments";
import styles from "./comments.module.css";

export type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
};

type DisplayComment = {
  id: string;
  author: string;
  date: string;
  dateTime: string;
  text: string;
};

type CommentsProps = {
  comments: Comment[];
  slug: string;
};

function formatCommentDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}

function toDisplayComment(comment: Comment): DisplayComment {
  return {
    id: comment.id,
    author: comment.name,
    date: formatCommentDate(comment.createdAt),
    dateTime: comment.createdAt.toISOString(),
    text: comment.content,
  };
}

export default function Comments({
  comments,
  slug,
}: CommentsProps) {
  const displayComments = comments.map(toDisplayComment);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await submitCommentAction({ slug, name, content });
      if (!result.success) {
        setMessage("Unable to submit your comment. Please try again.");
        return;
      }

      setName("");
      setContent("");
      setMessage("Comment submitted for moderation.");
    } catch {
      setMessage("Unable to submit your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="comments"
      className={styles.comments}
      aria-labelledby="comments-heading"
    >
      <div className={styles.commentsRail} aria-hidden="true">
        <span className={styles.commentsRailIndex}>05</span>
        <span className={styles.commentsRailLine} />
        <span className={styles.commentsRailMeta}>
          DISCUSSION
          <br />
          OPEN
        </span>
      </div>

      <div className={styles.commentsMain}>
        <div className={styles.commentsTopline}>
          <span className={styles.commentsLabel}>// COMMENTS</span>
          <span className={styles.commentsRule} />
          <span className={styles.commentsCount}>
            {String(displayComments.length).padStart(2, "0")}
          </span>
        </div>

        <div className={styles.commentsHeader}>
          <div>
            <span className={styles.commentsEyebrow}>
              READER DISCUSSION
            </span>
            <h2 id="comments-heading">Thoughts on the article.</h2>
          </div>

          <span className={styles.commentsHeaderMark}>+</span>
        </div>

        <form
          className={styles.commentForm}
          onSubmit={handleSubmit}
        >
          <div className={styles.formHeader}>
            <span>LEAVE A COMMENT</span>
            <span>NO ACCOUNT REQUIRED</span>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.nameField}>
              <span>YOUR NAME</span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                maxLength={100}
                required
                disabled={isSubmitting}
              />
            </label>

            <label className={styles.messageField}>
              <span>COMMENT</span>
              <textarea
                name="comment"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Share your thoughts on this article..."
                rows={5}
                maxLength={5000}
                required
                disabled={isSubmitting}
              />
            </label>
          </div>

          <div className={styles.formFooter}>
            <span role="status" aria-live="polite">
              {message || "COMMENTS ARE REVIEWED BEFORE PUBLICATION"}
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "SENDING..." : "SEND COMMENT →"}
            </button>
          </div>
        </form>

        <div className={styles.commentsList}>
          {displayComments.length === 0 ? (
            <div className={styles.emptyComments}>
              NO COMMENTS YET.
            </div>
          ) : (
            displayComments.map((comment, index) => (
              <article
                key={comment.id}
                className={styles.comment}
              >
                <div className={styles.commentIndex}>
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className={styles.commentBody}>
                  <div className={styles.commentMeta}>
                    <span>{comment.author}</span>
                    <time dateTime={comment.dateTime}>{comment.date}</time>
                  </div>

                  <p>{comment.text}</p>

                </div>

                <span className={styles.commentArrow}>↗</span>
              </article>
            ))
          )}
        </div>

        <div className={styles.commentsFooter}>
          <span>COMMENTS / DATABASE</span>
          <span>MODERATION REQUIRED</span>
        </div>
      </div>
    </section>
  );
}
