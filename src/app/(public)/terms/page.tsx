import type { Metadata } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-origin";
import PublicSiteShell from "@/components/PublicSiteShell";
import styles from "../LegalPage.module.css";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

export async function generateMetadata(): Promise<Metadata> {
  const [canonical, images] = await Promise.all([
    getAbsoluteSiteUrl("/terms"),
    getDefaultSocialImageMetadata(),
  ]);

  return {
    title: "Terms of Use",
    description:
      "Terms governing use of this portfolio, its projects, technical articles, code examples, and public content.",
    robots: { index: true, follow: true },
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: "Terms of Use",
      description:
        "Rules and conditions for using this portfolio and its published content.",
      ...(canonical ? { url: canonical } : {}),
      ...(images ? { images } : {}),
    },
  };
}

const sections = [
  { id: "use", label: "01 Website use" },
  { id: "prohibited", label: "02 Prohibited activities" },
  { id: "submissions", label: "03 Comments and submissions" },
  { id: "intellectual-property", label: "04 Intellectual property" },
  { id: "projects", label: "05 Projects and demonstrations" },
  { id: "technical-content", label: "06 Technical content" },
  { id: "third-parties", label: "07 Third-party services" },
  { id: "privacy", label: "08 Privacy" },
  { id: "availability", label: "09 Availability and changes" },
  { id: "warranties", label: "10 Disclaimer of warranties" },
  { id: "liability", label: "11 Limitation of liability" },
  { id: "indemnity", label: "12 Indemnity" },
  { id: "access", label: "13 Restriction of access" },
  { id: "updates", label: "14 Changes to these terms" },
  { id: "law", label: "15 Governing law" },
  { id: "contact", label: "16 Contact" },
];

export default function TermsPage() {
  return (
    <PublicSiteShell>
      <main className={styles.page}>
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>LEGAL / 02</p>
            <h1>Terms<br />of Use</h1>
          </div>
          <p className={styles.updated}>Last updated<br />11 October 2026</p>
        </header>

        <p className={styles.intro}>
          These Terms of Use govern access to and use of this personal portfolio website, including public pages, portfolio projects, technical articles, code examples, contact forms, article comments, and other published materials. By using the website, you agree to these terms and applicable law. If you do not agree, discontinue use of the website.
        </p>

        <div className={styles.body}>
          <nav aria-label="On this page" className={styles.index}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>{section.label}</a>
            ))}
          </nav>

          <div className={styles.sections}>
            <section className={styles.section} id="use">
              <h2>1. Website Use</h2>
              <p>You may access and use this website for lawful personal, educational, informational, and professional purposes, including:</p>
              <ul>
                <li>Browsing publicly available portfolio pages and articles.</li>
                <li>Sharing links to public pages.</li>
                <li>Reviewing project descriptions and demonstrations.</li>
                <li>Reading technical content for learning and research.</li>
                <li>Contacting the site operator through the available form.</li>
                <li>Submitting relevant comments where commenting is available.</li>
              </ul>
              <p>Your use must not violate applicable law, infringe another person’s rights, interfere with the website’s operation, or breach these terms. You are responsible for ensuring that your use of published materials is appropriate and complies with any licence terms that apply. Access to the website does not grant ownership of its content, code, designs, or branding.</p>
            </section>

            <section className={styles.section} id="prohibited">
              <h2>2. Acceptable Use and Prohibited Activities</h2>
              <p>You must not use the website in a way that harms the website, its operator, visitors, or third parties. Prohibited conduct includes:</p>
              <ul>
                <li>Using the website unlawfully or in violation of applicable regulations.</li>
                <li>Attempting unauthorised access to the website, database, administrative interfaces, accounts, or infrastructure.</li>
                <li>Interfering with availability, integrity, or normal operation, or bypassing rate limits, access restrictions, moderation controls, or security measures.</li>
                <li>Introducing malicious code, harmful files, automated attacks, or other disruptive activity.</li>
                <li>Sending excessive or abusive automated contact messages or comments.</li>
                <li>Exploiting vulnerabilities or accessing information that has not been made public.</li>
                <li>Impersonating another person, submitting spam or threats, harassing others, or publishing private information without an appropriate legal basis.</li>
                <li>Copying or commercially exploiting protected materials in violation of applicable rights or licence terms.</li>
              </ul>
              <p>Nothing here prohibits lawful security research, accessibility tools, ordinary search engine indexing, or other conduct permitted by law. Such activity must not involve unauthorised access or disruption. The site operator may take reasonable measures to investigate suspected misuse and protect the website.</p>
            </section>

            <section className={styles.section} id="submissions">
              <h2>3. Contact Forms, Comments, and Submissions</h2>
              <h3>Contact submissions</h3>
              <p>Provide information that is reasonably accurate and relevant. Do not use the form to submit:</p>
              <ul>
                <li>Spam or unsolicited bulk messages.</li>
                <li>Unlawful threats or malicious links.</li>
                <li>Material that infringes another person’s rights.</li>
              </ul>
              <p>A submission does not guarantee a response, a particular response time, or a professional, commercial, or contractual relationship.</p>
              <h3>Comments and moderation</h3>
              <p>Comments may be reviewed before publication. Where appropriate, the site operator may:</p>
              <ul>
                <li>Approve, reject, hide, or edit a comment.</li>
                <li>Remove comments that are unlawful, abusive, irrelevant, misleading, spam-related, privacy-invasive, or inconsistent with the website’s purpose.</li>
              </ul>
              <p>Submission does not guarantee publication.</p>
              <h3>Responsibility and permission</h3>
              <p>You are responsible for submitted content and must have the rights and permissions needed to share it. Do not submit the following unless sharing is lawful and genuinely necessary:</p>
              <ul>
                <li>Passwords or payment credentials.</li>
                <li>Confidential business information.</li>
                <li>Sensitive personal information.</li>
                <li>Another person’s private information.</li>
              </ul>
              <p>You retain rights you already hold in your submission. By submitting it, you permit the site operator to receive, store, review, and process it as reasonably necessary to:</p>
              <ul>
                <li>Operate the relevant feature and respond to an enquiry.</li>
                <li>Moderate comments and protect the website.</li>
              </ul>
              <p>This permission is subject to the Privacy Policy and applicable law. If a comment is approved, you permit its display with the submitted display name in connection with the relevant article. This does not transfer ownership or permit private contact messages to be published or used for unrelated marketing.</p>
            </section>

            <section className={styles.section} id="intellectual-property">
              <h2>4. Intellectual Property and Ownership</h2>
              <p>Unless otherwise indicated, original website content is owned by the site operator or used under an applicable licence or permission. This may include:</p>
              <ul>
                <li>Website design, layout, visual elements, graphics, and branding.</li>
                <li>Articles and project documentation.</li>
                <li>Original code examples.</li>
                <li>Identifying materials protected by law.</li>
              </ul>
              <p>All rights not expressly granted are reserved to the relevant rights holder, subject to applicable law and third-party licences.</p>
              <h3>Permitted use</h3>
              <p>You may use the content for lawful personal, educational, or informational purposes to:</p>
              <ul>
                <li>Read the website and share links to public pages.</li>
                <li>Refer to content and quote limited portions where permitted by law, with appropriate attribution and without misrepresenting the original material.</li>
              </ul>
              <h3>Restrictions</h3>
              <p>Unless authorised by the relevant rights holder or permitted by law, you must not:</p>
              <ul>
                <li>Reproduce substantial portions of original content or republish articles as your own work.</li>
                <li>Redistribute original designs or branding as standalone assets.</li>
                <li>Sell or sublicense protected materials without permission.</li>
                <li>Remove applicable attribution or claim ownership of work created by someone else.</li>
              </ul>
              <h3>Third-party materials and licences</h3>
              <p>Projects may include materials governed by separate licences, such as:</p>
              <ul>
                <li>Open-source components and libraries.</li>
                <li>Stock assets and APIs.</li>
                <li>Other third-party materials.</li>
              </ul>
              <p>Those licences remain applicable and these terms do not grant rights the site operator does not possess. An explicit licence attached to a repository or project governs materials within its scope.</p>
            </section>

            <section className={styles.section} id="projects">
              <h2>5. Portfolio Projects and Demonstrations</h2>
              <p>The website may showcase the following work to demonstrate capabilities and document technical decisions:</p>
              <ul>
                <li>Software projects, websites, and applications.</li>
                <li>Experiments, prototypes, and design concepts.</li>
                <li>Other development work.</li>
              </ul>
              <p>A project may be:</p>
              <ul>
                <li>Experimental, incomplete, or under development.</li>
                <li>Discontinued or no longer maintained.</li>
              </ul>
              <p>A project description does not mean that it is a supported commercial product or that a demonstration will remain operational.</p>
              <p>Live demonstrations, repositories, downloads, and external project links may be subject to:</p>
              <ul>
                <li>Separate terms or licences.</li>
                <li>Technical requirements.</li>
                <li>Third-party policies.</li>
              </ul>
              <p>Unless expressly stated otherwise, demonstrations are provided for evaluation and informational purposes without a commitment to ongoing maintenance or support.</p>
              <p>Do not submit the following to a demonstration unless the service explicitly supports that use and appropriate safeguards are in place:</p>
              <ul>
                <li>Real confidential information.</li>
                <li>Production credentials.</li>
                <li>Sensitive data.</li>
              </ul>
              <p>References to the following do not necessarily imply endorsement, sponsorship, partnership, or affiliation:</p>
              <ul>
                <li>Third-party products or services.</li>
                <li>Organisations or clients.</li>
              </ul>
              <p>Project-specific ownership, confidentiality, and third-party rights continue to apply.</p>
            </section>

            <section className={styles.section} id="technical-content">
              <h2>6. Technical Articles, Code Examples, and Advice</h2>
              <p>The website may publish the following technical material for general educational and informational purposes:</p>
              <ul>
                <li>Articles and tutorials.</li>
                <li>Programming examples and architecture discussions.</li>
                <li>Troubleshooting guides and other technical material.</li>
              </ul>
              <p>Technologies and practices change over time, including:</p>
              <ul>
                <li>APIs, libraries, and frameworks.</li>
                <li>Security recommendations and development practices.</li>
              </ul>
              <p>Although reasonable care may be taken, the site operator does not guarantee that every article, example, configuration, or recommendation is:</p>
              <ul>
                <li>Complete or current.</li>
                <li>Error-free.</li>
                <li>Suitable for every environment.</li>
              </ul>
              <p>You are responsible for reviewing and testing information before applying it to your systems. Before deploying code or commands in production, consider:</p>
              <ul>
                <li>Security and compatibility.</li>
                <li>Data integrity and backups.</li>
                <li>Performance and operational requirements.</li>
              </ul>
              <p>Examples may require adaptation and may omit controls necessary in a production system.</p>
              <p>Technical content is not a guarantee of results or a substitute for specialised professional assessment. Reading an article or using a code example does not create a:</p>
              <ul>
                <li>Consulting or support relationship.</li>
                <li>Employment relationship.</li>
                <li>Other contractual relationship.</li>
              </ul>
              <p>You remain responsible for decisions made using the information.</p>
            </section>

            <section className={styles.section} id="third-parties">
              <h2>7. Third-Party Services and External Links</h2>
              <p>The website may link to or integrate with:</p>
              <ul>
                <li>External websites, repositories, and demonstrations.</li>
                <li>Documentation and social networks.</li>
                <li>Hosting providers and other services.</li>
              </ul>
              <p>Those services operate independently and may have their own terms, privacy policies, security practices, availability requirements, and content standards.</p>
              <p>The site operator does not control independently operated services and does not guarantee their:</p>
              <ul>
                <li>Accuracy or security.</li>
                <li>Availability or suitability.</li>
              </ul>
              <p>Following a link or using a third-party service is your decision. Review the relevant provider’s terms and policies before using it or submitting information. Projects that depend on external APIs, libraries, hosting, or other services may be affected by their availability and changes.</p>
            </section>

            <section className={styles.section} id="privacy">
              <h2>8. Privacy and Personal Information</h2>
              <p>Use of the website may involve:</p>
              <ul>
                <li>Submitting personal information through contact forms or article comments.</li>
                <li>Processing technical information needed to deliver and protect the website.</li>
              </ul>
              <p>The collection, use, storage, and retention of that information are described in the <a href="/privacy">Privacy Policy</a>.</p>
              <p>These terms should be read alongside the Privacy Policy. Applicable privacy laws and relevant privacy disclosures govern personal-data matters to the extent required by law.</p>
            </section>

            <section className={styles.section} id="availability">
              <h2>9. Website Availability and Modifications</h2>
              <p>Subject to applicable law and separate contractual obligations, the site operator may update, modify, suspend, restrict, or discontinue parts of the website. This may include:</p>
              <ul>
                <li>Updating articles or changing or removing projects.</li>
                <li>Modifying design or functionality.</li>
                <li>Disabling forms or comments, or removing outdated content.</li>
                <li>Restricting access for maintenance, security, or operational reasons.</li>
              </ul>
              <p>Reasonable efforts may be made to maintain functionality, but uninterrupted access is not guaranteed. Content, links, demonstrations, and examples may change or become unavailable without prior notice. The site operator is not obligated to preserve every historical version or maintain every project indefinitely.</p>
            </section>

            <section className={styles.section} id="warranties">
              <h2>10. Disclaimer of Warranties</h2>
              <p>To the extent permitted by applicable law, the website and its public content are provided on an “as is” and “as available” basis. The site operator does not guarantee:</p>
              <ul>
                <li>That the website will always be accessible.</li>
                <li>That all information will be accurate or current.</li>
                <li>That examples will work in every environment or demonstrations will remain available.</li>
                <li>That the website will be free from all errors, vulnerabilities, or harmful components.</li>
              </ul>
              <p>Nothing in this section excludes a warranty or legal protection that cannot lawfully be excluded or limited. Any project-specific warranties, support commitments, or service agreements must be established separately where applicable.</p>
            </section>

            <section className={styles.section} id="liability">
              <h2>11. Limitation of Liability</h2>
              <p>To the extent permitted by applicable law, the site operator will not be responsible for losses arising solely from:</p>
              <ul>
                <li>Ordinary reliance on general informational content.</li>
                <li>Temporary website unavailability or changes to published materials.</li>
                <li>The independent operation of third-party services.</li>
                <li>Applying technical examples without appropriate testing or using a project outside its intended or documented purpose.</li>
              </ul>
              <p>Nothing in these terms excludes or limits liability where prohibited by law, including liability that cannot lawfully be disclaimed. Nothing here limits rights or remedies provided by mandatory consumer protection, privacy, or other applicable laws. This section defines intended boundaries for use of a personal portfolio and does not exempt the site operator from all legal responsibility.</p>
            </section>

            <section className={styles.section} id="indemnity">
              <h2>12. Indemnity</h2>
              <p>To the extent permitted by applicable law, you may be responsible for losses, claims, or reasonable costs directly resulting from:</p>
              <ul>
                <li>Your unlawful misuse of the website.</li>
                <li>Infringement of third-party rights.</li>
                <li>Material breach of these terms.</li>
              </ul>
              <p>This section does not create liability where law prohibits it and does not require you to compensate the site operator for losses caused by the operator’s own unlawful conduct. Responsibility depends on the facts, applicable law, and the rights of the parties involved.</p>
            </section>

            <section className={styles.section} id="access">
              <h2>13. Suspension and Restriction of Access</h2>
              <p>The site operator may take reasonable steps to restrict or suspend access where there is a credible concern involving:</p>
              <ul>
                <li>Security threats or attempted unauthorised access.</li>
                <li>Repeated spam or abusive submissions.</li>
                <li>Interference with website functionality.</li>
                <li>Unlawful use or material violations of these terms.</li>
              </ul>
              <p>Where appropriate and reasonably practicable, restrictions may be limited to the affected feature or activity. Any action remains subject to applicable law and relevant legal obligations.</p>
            </section>

            <section className={styles.section} id="updates">
              <h2>14. Changes to These Terms</h2>
              <p>These terms may be revised to reflect changes in:</p>
              <ul>
                <li>Website functionality or content.</li>
                <li>Technical infrastructure.</li>
                <li>Legal requirements or operational practices.</li>
              </ul>
              <p>The current version will be published on this page with an updated “Last updated” date.</p>
              <p>Review these terms periodically if you use the website regularly. Where a change requires additional notice or consent under applicable law or a separate agreement, those requirements must be followed. A revision does not retroactively remove rights that cannot lawfully be taken away.</p>
            </section>

            <section className={styles.section} id="law">
              <h2>15. Governing Law and Jurisdiction</h2>
              <p>These terms are subject to the laws applicable to the site operator and the circumstances of the relevant use, without overriding mandatory legal protections that apply to visitors. Where legally permissible, disputes may be brought before the competent courts with jurisdiction over the relevant matter.</p>
              <p>Nothing in this section is intended to deprive a visitor of mandatory rights, consumer protections, or access to a competent authority or court where applicable law provides otherwise. The governing law and jurisdiction should be made more specific after the relevant legal circumstances have been confirmed.</p>
            </section>

            <section className={styles.section} id="contact">
              <h2>16. Contact</h2>
              <p>For questions about these Terms of Use, published materials, project demonstrations, or the website, use the current contact methods on the <a href="/contact">Contact page</a>.</p>
              <p>Please describe your enquiry clearly. Avoid including:</p>
              <ul>
                <li>Passwords or confidential credentials.</li>
                <li>Unnecessary sensitive information.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </PublicSiteShell>
  );
}
