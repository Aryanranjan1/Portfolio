import type { Metadata } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import styles from "../LegalPage.module.css";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

export async function generateMetadata(): Promise<Metadata> {
  const [canonical, images] = await Promise.all([
    getAbsoluteSiteUrl("/privacy"),
    getDefaultSocialImageMetadata(),
  ]);

  return {
    title: "Privacy Policy",
    description:
      "How this portfolio collects, uses, stores, and protects information submitted through its contact and article comment forms.",
    robots: { index: true, follow: true },
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: "Privacy Policy",
      description:
        "How this portfolio collects, uses, stores, and protects personal information.",
      ...(canonical ? { url: canonical } : {}),
      ...(images ? { images } : {}),
    },
  };
}

const sections = [
  { id: "information", label: "01 Information we collect" },
  { id: "use", label: "02 How we use information" },
  { id: "contact-submissions", label: "03 Contact submissions" },
  { id: "comments", label: "04 Article comments" },
  { id: "rate-limiting", label: "05 Rate limiting" },
  { id: "cookies", label: "06 Cookies" },
  { id: "analytics", label: "07 Analytics" },
  { id: "hosting", label: "08 Database and hosting" },
  { id: "third-parties", label: "09 Third-party services" },
  { id: "retention", label: "10 Retention and deletion" },
  { id: "security", label: "11 Data security" },
  { id: "rights", label: "12 Your privacy rights" },
  { id: "children", label: "13 Children’s privacy" },
  { id: "international", label: "14 International visitors" },
  { id: "changes", label: "15 Policy changes" },
  { id: "contact", label: "16 Contact" },
];

export default function PrivacyPage() {
  return (
    <PublicSiteShell>
      <main className={styles.page}>
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>LEGAL / 01</p>
            <h1>Privacy<br />Policy</h1>
          </div>
          <p className={styles.updated}>Last updated<br />11 October 2026</p>
        </header>

        <p className={styles.intro}>
          This Privacy Policy explains how information is collected, used, stored, and protected when you visit this personal portfolio, browse articles, submit a contact message, or leave an article comment. It should be read alongside applicable privacy laws and does not limit rights that cannot lawfully be limited.
        </p>

        <div className={styles.body}>
          <nav aria-label="On this page" className={styles.index}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>{section.label}</a>
            ))}
          </nav>

          <div className={styles.sections}>
            <section className={styles.section} id="information">
              <h2>1. Information We Collect</h2>
              <h3>Information you provide</h3>
              <p>When you submit the contact form, the website collects these details so the site operator can understand and review your enquiry and respond where appropriate:</p>
              <ul>
                <li>Your name.</li>
                <li>Your email address.</li>
                <li>The subject of your message.</li>
                <li>The message you provide.</li>
              </ul>
              <p>When you submit an article comment, the website stores:</p>
              <ul>
                <li>The name you provide.</li>
                <li>The comment text you provide.</li>
              </ul>
              <p>Comments remain pending until reviewed and are not displayed publicly unless approved.</p>
              <p>Please do not submit the following unless genuinely necessary and appropriate:</p>
              <ul>
                <li>Passwords or payment details.</li>
                <li>Government identification numbers.</li>
                <li>Sensitive personal information or confidential information.</li>
              </ul>
              <h3>Technical and request information</h3>
              <p>Depending on the hosting and deployment configuration, the hosting platform, server, application, or related infrastructure may process technical information such as:</p>
              <ul>
                <li>IP addresses and request timestamps.</li>
                <li>Requested URLs.</li>
                <li>Browser or device information.</li>
                <li>Error records.</li>
              </ul>
              <p>The application may derive a SHA-256-based rate-limit key from the client address supplied by a trusted hosting proxy. In this rate-limit mechanism:</p>
              <ul>
                <li>The application does not store the raw address.</li>
                <li>The derived key is not used for visitor analytics.</li>
                <li>Hosting infrastructure may process IP addresses separately.</li>
              </ul>
              <p>The ordinary contact and comment forms are not intended to collect:</p>
              <ul>
                <li>Sensitive personal information.</li>
                <li>Financial account details.</li>
                <li>Precise location information.</li>
                <li>Government-issued identification details.</li>
              </ul>
            </section>

            <section className={styles.section} id="use">
              <h2>2. How We Use Your Information</h2>
              <p>Information is used for purposes reasonably related to operating the portfolio, handling communications, maintaining functionality, and preventing abuse. This may include:</p>
              <ul>
                <li>Reviewing and responding to contact enquiries.</li>
                <li>Reviewing, approving, rejecting, or removing article comments.</li>
                <li>Limiting repeated or abusive submissions.</li>
                <li>Maintaining website integrity and investigating relevant technical problems or suspected misuse.</li>
                <li>Meeting applicable legal obligations where necessary.</li>
              </ul>
              <p>Personal information submitted through these forms is not intentionally collected for:</p>
              <ul>
                <li>Sale.</li>
                <li>Behavioural advertising.</li>
                <li>Unrelated commercial marketing.</li>
              </ul>
              <p>Access is intended to be limited to what is reasonably necessary for the purposes described here, subject to hosting and infrastructure arrangements.</p>
              <p>The application does not currently implement automated email delivery for contact submissions. Submission does not guarantee an email notification or a response within a particular period.</p>
            </section>

            <section className={styles.section} id="contact-submissions">
              <h2>3. Contact Form Submissions</h2>
              <p>Contact form details are stored in the website database for private administrative review. Contact submissions are not automatically published on the website.</p>
              <ul>
                <li>Submitting a message does not establish a contractual relationship.</li>
                <li>A response is not guaranteed.</li>
                <li>There is currently no application-level email delivery for these submissions.</li>
                <li>Messages remain in the database until an administrator removes them, subject to this policy.</li>
              </ul>
              <p>If you need to correct or request deletion of information in a previous submission, contact the site operator through the <a href="/contact">Contact page</a>.</p>
            </section>

            <section className={styles.section} id="comments">
              <h2>4. Article Comments and Moderation</h2>
              <p>Comments are stored with the name and comment text supplied and remain pending until reviewed. A comment is not displayed publicly unless an administrator approves it.</p>
              <p>If approved, the submitted name and comment may be visible to other visitors. Avoid including private contact details, confidential information, or information about another person without an appropriate reason.</p>
              <p>To maintain the relevance and safety of discussions, the administrator may:</p>
              <ul>
                <li>Approve a comment.</li>
                <li>Reject a comment.</li>
                <li>Remove a comment.</li>
              </ul>
              <p>Approval does not mean the site operator endorses every statement in a comment. If a published comment raises a privacy concern, contact the site operator to request a review.</p>
            </section>

            <section className={styles.section} id="rate-limiting">
              <h2>5. Rate Limiting and Abuse Prevention</h2>
              <p>The application may apply rate limits to contact and comment submissions to reduce:</p>
              <ul>
                <li>Spam.</li>
                <li>Automated abuse.</li>
                <li>Excessive requests.</li>
              </ul>
              <p>For this purpose, it may generate a SHA-256-derived key from the client address supplied by the trusted hosting proxy.</p>
              <p>The derived key is used for request-limiting rather than visitor analytics or advertising. The application does not store the raw client address as part of this mechanism, although hosting infrastructure may process or record it separately.</p>
              <p>Stale rate-limit entries become eligible for best-effort cleanup after 24 hours. Cleanup runs periodically during later limited form submissions, so entries may remain longer than 24 hours. Rate limiting cannot guarantee prevention of all abuse.</p>
            </section>

            <section className={styles.section} id="cookies">
              <h2>6. Cookies and Similar Technologies</h2>
              <p>This policy does not establish that the website currently uses any of the following:</p>
              <ul>
                <li>Tracking cookies.</li>
                <li>Advertising cookies.</li>
                <li>Analytics cookies.</li>
              </ul>
              <p>Cookie use depends on:</p>
              <ul>
                <li>The application code.</li>
                <li>Third-party integrations.</li>
                <li>The deployment configuration.</li>
              </ul>
              <p>Hosting or third-party services may use cookies or similar technologies for functionality or security. You can generally manage cookies through your browser settings, although disabling them may affect functionality on websites that rely on them.</p>
              <p>If non-essential cookies or similar technologies are introduced, their purposes and any applicable consent requirements should be reviewed and this policy updated where necessary.</p>
            </section>

            <section className={styles.section} id="analytics">
              <h2>7. Analytics and Website Usage</h2>
              <p>The SHA-256-derived rate-limit key described in this policy is not used by the application for visitor analytics. This does not guarantee that the following may not process analytics or diagnostic information independently:</p>
              <ul>
                <li>Hosting providers and content delivery networks.</li>
                <li>Security services.</li>
                <li>Other infrastructure components.</li>
              </ul>
              <p>If analytics services are introduced, the policy should be updated to identify them and explain:</p>
              <ul>
                <li>The information collected.</li>
                <li>The purposes of collection.</li>
                <li>Relevant retention practices.</li>
              </ul>
            </section>

            <section className={styles.section} id="hosting">
              <h2>8. Database Storage and Hosting</h2>
              <p>Contact submissions and article comments are stored in the website database. The details below depend on the deployment, and this website does not currently identify a specific database provider or storage location in this policy:</p>
              <ul>
                <li>The database provider and hosting region.</li>
                <li>The backup configuration.</li>
                <li>The associated infrastructure.</li>
              </ul>
              <p>Depending on the arrangement, service providers may process information to:</p>
              <ul>
                <li>Operate infrastructure and provide database access.</li>
                <li>Protect against abuse.</li>
                <li>Troubleshoot technical issues.</li>
                <li>Comply with legal obligations.</li>
              </ul>
              <p>Providers may have their own terms, privacy policies, and security practices.</p>
              <p>The website does not claim that all information is stored or processed in a single country. Where required by law, hosting arrangements and international data transfers should be assessed and appropriate safeguards implemented.</p>
            </section>

            <section className={styles.section} id="third-parties">
              <h2>9. Third-Party Services and External Links</h2>
              <p>The website may link to:</p>
              <ul>
                <li>External websites and professional profiles.</li>
                <li>Code repositories and project demonstrations.</li>
                <li>Other online resources.</li>
              </ul>
              <p>When you follow an external link, the destination service’s privacy practices apply to your activity there.</p>
              <p>External services may:</p>
              <ul>
                <li>Collect information.</li>
                <li>Use cookies.</li>
                <li>Process data under their own terms.</li>
              </ul>
              <p>The site operator does not control independently operated services. Infrastructure providers may also process technical information as necessary to deliver or protect the website.</p>
              <p>Review the privacy policies of external services before submitting personal information to them.</p>
            </section>

            <section className={styles.section} id="retention">
              <h2>10. Data Retention and Deletion</h2>
              <p>Information is retained according to the website’s actual data practices and applicable legal obligations.</p>
              <h3>Contact messages and comments</h3>
              <p>Contact submissions and comments:</p>
              <ul>
                <li>Remain in the database until an administrator removes them.</li>
                <li>Do not currently have a fixed automatic deletion period.</li>
                <li>Remain stored while pending; pending comments are not publicly displayed unless approved.</li>
              </ul>
              <h3>Rate-limit records</h3>
              <p>Stale rate-limit entries become eligible for best-effort cleanup after 24 hours, but may remain longer because cleanup runs periodically during later limited form submissions.</p>
              <h3>Backups and infrastructure records</h3>
              <p>Retention periods for backups, hosting logs, and infrastructure records depend on provider settings and are not specified universally by this website.</p>
              <p>You may request deletion of personal information you submitted. Requests are reviewed subject to:</p>
              <ul>
                <li>Verification.</li>
                <li>Technical limitations.</li>
                <li>Legal obligations.</li>
                <li>Legitimate retention needs.</li>
              </ul>
              <p>Deletion from the active database may not immediately remove information from every backup or independently maintained record.</p>
            </section>

            <section className={styles.section} id="security">
              <h2>11. Data Security</h2>
              <p>Reasonable technical and organisational measures should be used to protect submitted information against unauthorised access, alteration, disclosure, loss, or misuse. Measures may include:</p>
              <ul>
                <li>Restricting administrative access.</li>
                <li>Application security controls.</li>
                <li>Abuse prevention.</li>
                <li>Security features provided by the hosting environment.</li>
              </ul>
              <p>No website, database, hosting platform, or internet transmission method can be guaranteed completely secure. The site operator cannot guarantee that the following will never occur:</p>
              <ul>
                <li>Unauthorised access.</li>
                <li>Vulnerabilities or infrastructure failures.</li>
                <li>Security incidents.</li>
              </ul>
              <p>Avoid sending confidential or highly sensitive information through ordinary website forms. If a security incident occurs, it should be investigated and any notifications required by applicable law considered.</p>
            </section>

            <section className={styles.section} id="rights">
              <h2>12. Your Privacy Rights</h2>
              <p>Depending on your location and applicable law, you may have rights concerning your personal data, including the right to:</p>
              <ul>
                <li>Request access, correction, or deletion.</li>
                <li>Withdraw consent where processing is based on consent.</li>
                <li>Object to or restrict certain processing.</li>
                <li>Complain to a relevant data protection authority.</li>
              </ul>
              <p>To make a request, contact the site operator through the <a href="/contact">Contact page</a> and describe it clearly. The operator may need to verify your identity or connection to the information before acting. Requests are handled subject to applicable legal requirements, response periods, and exceptions.</p>
              <p>These rights are not absolute in every jurisdiction or circumstance. Information may need to be retained where required by law or where another valid legal basis applies. This policy does not promise that every listed right applies to every visitor.</p>
            </section>

            <section className={styles.section} id="children">
              <h2>13. Children’s Privacy</h2>
              <p>This is a general personal portfolio and is not specifically directed at children. The site operator does not intentionally seek to collect children’s personal information beyond information voluntarily submitted through ordinary website functionality.</p>
              <p>If you believe a child has submitted information that should not have been collected, contact the site operator and request a review. Where applicable law requires parental consent or additional safeguards, those requirements must be followed.</p>
            </section>

            <section className={styles.section} id="international">
              <h2>14. International Visitors and Data Transfers</h2>
              <p>The website may be accessed from different countries. Because the database provider and deployment region depend on the actual configuration, information may be processed or stored in a jurisdiction different from the visitor’s country of residence.</p>
              <p>Privacy protections and data-transfer requirements vary by jurisdiction. Where applicable law imposes requirements on international transfers, relevant parties should assess and implement the required safeguards. No particular transfer mechanism is claimed unless verified for the actual hosting arrangement.</p>
            </section>

            <section className={styles.section} id="changes">
              <h2>15. Changes to This Privacy Policy</h2>
              <p>This policy may be revised when website functionality, data collection, hosting arrangements, legal requirements, or security practices change. The current version will be published on this page with an updated “Last updated” date.</p>
              <p>Visitors are encouraged to review this page periodically. Where applicable law requires additional notice or consent for a material change, the relevant steps should be taken. Continued use of the website does not override rights or consent requirements imposed by law.</p>
            </section>

            <section className={styles.section} id="contact">
              <h2>16. Contact and Privacy Enquiries</h2>
              <p>For questions about this policy or to request access, correction, or deletion of personal information you submitted, use the current contact methods on the <a href="/contact">Contact page</a>.</p>
              <p>Please describe your request clearly and do not include passwords or unnecessary sensitive information in a privacy enquiry.</p>
            </section>

            <p className={styles.intro}>This policy describes the website’s intended practices based on the functionality currently identified. Review it whenever data collection, infrastructure, or third-party integrations change.</p>
          </div>
        </div>
      </main>
    </PublicSiteShell>
  );
}
