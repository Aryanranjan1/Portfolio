import Link from "next/link";
import Image from "next/image";

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Email", href: "mailto:hello@example.com" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "Resume", href: "/resume.pdf" },
      { label: "Now", href: "/now" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0b0b0b] text-[#efefeb]">
      {/* CTA */}

     
      <div className="mx-auto max-w-7xl px-[6%] pb-24 pt-16 md:pb-32 md:pt-20">
            

            <Image
              src="/ascii-art-v2.png"
              alt=""
              width={1920}
              height={800}
              sizes="100vw"
              className="block h-auto w-full"
            />
             
            
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-6 text-[11.5px] font-normal uppercase tracking-[0.34em] text-[#71716d]">
              Have a project in mind?
            </p>

            <h2 className="max-w-2xl text-[clamp(32px,6vw,72px)] font-medium leading-[0.95] tracking-[-0.045em]">
              Let&apos;s build something worth shipping.
            </h2>
          </div>

          <Link
            href="/contact"
            className="group flex w-fit items-center gap-4 border border-white/10 bg-[#efefeb] px-5 py-3 text-[12.5px] font-medium text-[#0b0b0b] transition-transform duration-300 hover:-translate-y-1"
          >
            Start a conversation

            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl border-t border-white/10 px-[6%]">
        <div className="grid grid-cols-2 gap-12 py-12 md:grid-cols-4 md:gap-8">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-[13px] font-semibold uppercase tracking-[0.14em]"
            >
              Aryan Ranjan
            </Link>

            <p className="mt-5 max-w-52 text-[12.5px] font-light leading-relaxed text-[#71716d]">
              Full-stack developer building thoughtful, reliable digital
              products.
            </p>
          </div>

          {/* Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#71716d]">
                {column.title}
              </p>

              <ul className="space-y-3">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http");
                  const mail = link.href.startsWith("mailto:");

                  return (
                    <li key={link.label}>
                      {external || mail ? (
                        <a
                          href={link.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noreferrer" : undefined}
                          className="text-[12.5px] font-normal text-[#efefeb]/70 transition-colors duration-200 hover:text-[#efefeb]"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[12.5px] font-normal text-[#efefeb]/70 transition-colors duration-200 hover:text-[#efefeb]"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-[6%] py-6 text-[10px] font-normal uppercase tracking-[0.08em] text-[#71716d] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Aryan Ranjan. All rights reserved.</p>

        <p>Built by Aryan Ranjan</p>
      </div>
    </footer>
  );
}