type SocialIconName = "email" | "github" | "linkedin" | "threads" | "x" | "instagram" | "youtube";

export default function SocialIcon({ name }: { name: SocialIconName }) {
  if (name === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5.5" width="18" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3.5 6L12 13L20.5 6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 .7a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.48 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .7Z" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M5.04 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.8 9.5h4.48V21H2.8V9.5ZM10 9.5h4.3v1.57h.06c.6-1.14 2.06-2.34 4.24-2.34 4.53 0 5.37 2.98 5.37 6.86V21h-4.48v-4.78c0-1.14-.02-2.6-1.58-2.6-1.6 0-1.84 1.22-1.84 2.52V21H10V9.5Z" />
      </svg>
    );
  }

  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.85h1.73L8.26 4.03H6.4L17.8 19.85Z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M23.5 6.2a3.01 3.01 0 0 0-2.12-2.13C19.51 3.55 12 3.55 12 3.55s-7.51 0-9.38.52A3.01 3.01 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3.01 3.01 0 0 0 2.12 2.13c1.87.52 9.38.52 9.38.52s7.51 0 9.38-.52a3.01 3.01 0 0 0 2.12-2.13A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.55 15.58V8.42L15.73 12l-6.18 3.58Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2C6.3 2 3 6 3 12s3.3 10 9 10c4.7 0 8-2.5 8-6.4 0-2.4-1.4-4-3.8-4.6-.4-3-2.1-4.6-5-4.6-2.2 0-3.8 1-4.5 2.8l2.1 1c.4-1 1.2-1.5 2.4-1.5 1.4 0 2.2.7 2.5 2-4.8-.1-7.5 1.8-7.5 5.1 0 2.6 2 4.4 4.8 4.4 2.3 0 4.1-1.2 5-3.2 1.1.5 1.6 1.3 1.6 2.5 0 2.5-2.2 4.2-5.6 4.2-4.2 0-6.7-3-6.7-7.7S7.8 4.4 12 4.4c2.2 0 3.8.7 4.9 2.2l1.8-1.3C17.2 3.1 14.9 2 12 2Zm-.2 15.9c-1.5 0-2.4-.7-2.4-1.9 0-1.7 1.7-2.6 4.9-2.5-.1 2.7-1 4.4-2.5 4.4Z" />
    </svg>
  );
}
