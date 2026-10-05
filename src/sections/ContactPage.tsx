/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { FormEvent, useState } from "react";
import { submitContactAction } from "@/app/actions/contact";
import styles from "./ContactPage.module.css";
import ScrollReveal from "@/components/ScrollReveal";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

type ContactContent = {
  contactMethods: Array<{ id: string; label: string; value: string; href: string; icon: string }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
  location: string;
  availabilityText: string;
};

const topics = [
  ["briefcase", "Job Opportunities", "Full-time, internships, or contract work."],
  ["bolt", "Project Collaboration", "Building something exciting together."],
  ["chat", "Technical Discussion", "Tech, systems, or just a good chat."],
  ["file", "Mentorship / Guidance", "Happy to help where I can."],
  ["note", "Feedback", "Feedback on my work is always welcome."],
  ["box", "Just Saying Hi", "Feel free to reach out for any reason."],
];

function Icon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "email") {
    return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 7 8 6 8-6" /></svg>;
  }

  if (name === "linkedin") {
    return <span className={styles.simpleIcon}>in</span>;
  }

  if (name === "github") {
    return <span className={styles.simpleIcon}>GH</span>;
  }

  if (name === "x") {
    return <span className={styles.simpleIcon}>𝕏</span>;
  }

  if (name === "briefcase") {
    return <svg {...common}><rect x="4" y="7" width="16" height="13" rx="1" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M4 11h16M9 12v2M15 12v2" /></svg>;
  }

  if (name === "bolt") {
    return <svg {...common}><path d="M13 2 5 13h6l-1 9 8-12h-6z" /></svg>;
  }

  if (name === "chat") {
    return <svg {...common}><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-4.5 4v-4.5A3.5 3.5 0 0 1 5 10.5z" /></svg>;
  }

  if (name === "file") {
    return <svg {...common}><path d="M5 4h10l4 4v12H5z" /><path d="M15 4v5h4M8 13h8M8 17h6" /></svg>;
  }

  if (name === "note") {
    return <svg {...common}><path d="M6 4h12v16H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>;
  }

  return <svg {...common}><path d="M5 8h14v10H5z" /><path d="M8 8V6h8v2M9 12h6M9 15h4" /></svg>;
}

export default function ContactPage({ contactMethods, faqs, location, availabilityText }: ContactContent) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "rate">("idle");
  const [openFaq, setOpenFaq] = useState(0);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status !== "idle") setStatus("idle");
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const result = await submitContactAction(form);
      if (result.success) {
        setForm(initialForm);
        setStatus("success");
      } else {
        setStatus(result.error === "CONFLICT" ? "rate" : "error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="contact-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>// CONTACT</div>
            <h1 id="contact-title" className={`${styles.heroTitle} public-hero-content-enter`}>
              LET’S<br />CONNECT.
            </h1>
            <div className={styles.heroRule} />
            <p className={styles.heroDescription}>
              Ideas, opportunities, collaborations, or just a hi —
              I’d love to hear from you.
            </p>
          </div>

          <div className={styles.heroSide}>
            SAME<br />CURIOSITY.<br />BIGGER<br />THINGS.
          </div>
        </div>
      </section>

      <section className={styles.main}>
        <div className={styles.shell}>
          <ScrollReveal />
          <div className={styles.contactGrid}>
            <section className={styles.messagePanel} data-scroll-reveal aria-labelledby="message-title">
              <SectionMeta index="// 001" note="I USUALLY REPLY WITHIN 24–48 HOURS." />
              <div className={styles.sectionLine} />
              <h2 id="message-title" className={styles.panelTitle}>SEND A MESSAGE</h2>

                  {status === "success" ? (
                <div className={styles.successState} role="status" aria-live="polite">
                  <div className={styles.successMark}>✓</div>
                  <h3>MESSAGE SENT.</h3>
                  <p>
                    Thanks for reaching out. Your message has been saved.
                    I’ll get back to you as soon as I can.
                  </p>
                  <button
                    type="button"
                    className={styles.submit}
                    onClick={() => setStatus("idle")}
                  >
                    <span>SEND ANOTHER</span><span>→</span>
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <Field id="contact-name" label="Name *">
                    <input
                      id="contact-name"
                      name="name"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      type="text"
                      placeholder="Your name"
                      maxLength={100}
                      required
                    />
                  </Field>

                  <Field id="contact-email" label="Email *">
                    <input
                      id="contact-email"
                      name="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      type="email"
                      placeholder="you@example.com"
                      maxLength={320}
                      required
                    />
                  </Field>

                  <Field id="contact-subject" label="Subject *" full>
                    <input
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      type="text"
                      placeholder="What’s this about?"
                      maxLength={200}
                      required
                    />
                  </Field>

                  <Field id="contact-message" label="Message *" full>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      placeholder="Tell me about your project, idea, or opportunity..."
                      maxLength={5000}
                      required
                    />
                  </Field>

                  <div className={styles.formBottom}>
                    <button
                      className={styles.submit}
                      type="submit"
                      disabled={status === "submitting"}
                    >
                      <span>
                        {status === "submitting" ? "SENDING..." : "SEND MESSAGE"}
                      </span>
                      <span>→</span>
                    </button>

                    <div className={styles.privacy}>
                      <span className={styles.lock} aria-hidden="true" />
                      <span>Your information is safe with me.<br />I never share your data.</span>
                    </div>
                  </div>

                  {status === "rate" && (
                    <p className={styles.formError} role="alert">
                      Too many submissions right now. Please try again later.
                    </p>
                  )}

                  {status === "error" && (
                    <p className={styles.formError} role="alert">
                      Something went wrong while sending your message. Please check your details and try again.
                    </p>
                  )}
                </form>
              )}
            </section>

            <section className={styles.methodsPanel} data-scroll-reveal aria-labelledby="methods-title">
              <SectionMeta index="// 002" note="" />
              <div className={styles.sectionLine} />
              <h2 id="methods-title" className={styles.panelTitle}>OTHER WAYS TO REACH ME</h2>

                <div className={styles.methodList}>
                {contactMethods.map((method) => (
                  <a
                    key={method.id}
                    className={styles.method}
                    href={method.href}
                    target={method.href.startsWith("http") ? "_blank" : undefined}
                    rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    <span className={styles.methodIcon} aria-hidden="true">
                      <Icon name={method.icon} />
                    </span>
                    <span className={styles.methodCopy}>
                      <strong>{method.label}</strong>
                      <span className={styles.value}>{method.value}</span>
                    </span>
                    <span className={styles.circleArrow} aria-hidden="true">↗</span>
                  </a>
                ))}

                <div className={styles.method}>
                  <span className={styles.methodIcon} aria-hidden="true">
                    <Icon name="location" />
                  </span>
                  <span className={styles.methodCopy}>
                    <strong>Location</strong>
                    <span className={styles.value}>{location}</span>
                    <span>{availabilityText}</span>
                  </span>
                  <span className={styles.circleArrow} aria-hidden="true">↗</span>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.lowerGrid}>
            <section className={styles.topicsPanel} data-scroll-reveal aria-labelledby="topics-title">
              <SectionMeta index="// 004" note="SOME REASONS PEOPLE REACH OUT." />
              <h2 id="topics-title" className={styles.lowerTitle}>FREQUENT TOPICS</h2>

              <div className={styles.topicsGrid}>
                {topics.map(([icon, title, description]) => (
                  <article key={title} className={styles.topic}>
                    <div className={styles.topicIcon} aria-hidden="true"><Icon name={icon} /></div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.faqPanel} data-scroll-reveal aria-labelledby="faq-title">
              <SectionMeta index="// 005" note="QUICK ANSWERS" />
              <h2 id="faq-title" className={styles.lowerTitle}>FAQ</h2>

              <div className={styles.faqList}>
                {faqs.map((faq, index) => {
                  const open = openFaq === index;

                  return (
                    <div key={faq.id} className={`${styles.faqItem} ${open ? styles.open : ""}`}>
                      <button
                        type="button"
                        className={styles.faqQuestion}
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? -1 : index)}
                      >
                        <span>{faq.question}</span>
                        <span className={styles.faqPlus}>+</span>
                      </button>

                      <div className={styles.faqAnswer}>
                        <div><p>{faq.answer}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionMeta({ index, note }: { index: string; note: string }) {
  return (
    <div className={styles.sectionMeta}>
      <span>{index}</span>
      <span>{note}</span>
    </div>
  );
}

function Field({
  id,
  label,
  children,
  full = false,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
