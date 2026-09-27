"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Prevent the page behind the fullscreen menu from scrolling.
  useEffect(() => {
    if (!menuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [menuOpen]);

  // Close mobile menu when Escape is pressed.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-2.75 right-[3.5%] left-[3.5%] z-50">
      <div className="flex h-11.25 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Aryan Ranjan"
          onClick={closeMenu}
          className="grid size-14.5 place-items-center overflow-hidden rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.35)]"
        >
          <Image
            src="/vercel.svg"
            alt="Aryan Ranjan"
            width={330}
            height={330}
            priority
            className="size-13.25 object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center rounded-[9px] bg-[#efefeb] p-0 text-[#71716d] shadow-[0_7px_26px_rgba(0,0,0,0.4)] md:flex">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[5px] px-5 py-2.75 text-[12.5px] font-normal leading-none tracking-normal transition-colors duration-200 ${
                  active
                    ? "bg-[#050505] text-[#efefeb]"
                    : "hover:bg-[#050505] hover:text-[#efefeb]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Resume */}
        <Link
          href="/resume.pdf"
          download
          className="hidden items-center gap-2.25 rounded-lg border border-white/10 bg-[#070707] py-0.75 pl-0.75 pr-3.25 text-[12.5px] font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:-translate-y-px md:flex"
        >
          <span className="grid size-7.75 place-items-center rounded-lg bg-[#efefeb] text-[16px] text-[#090909]">
            ↓
          </span>

          Resume
        </Link>

        {/* Mobile */}
        <div className="md:hidden">
          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="relative z-100 flex h-10 items-center gap-2 rounded-lg bg-[#efefeb] px-3 text-black shadow-[0_5px_20px_rgba(0,0,0,0.35)]"
          >
            {/* Menu / Close */}
            <span className="relative h-4 overflow-hidden text-[10px] font-normal leading-4">
              <span
                className={`block transition-transform duration-500 motion-reduce:transition-none ${
                  menuOpen ? "-translate-y-4" : "translate-y-0"
                }`}
              >
                Menu
              </span>

              <span
                className={`absolute inset-0 transition-transform duration-500 motion-reduce:transition-none ${
                  menuOpen ? "translate-y-0" : "translate-y-4"
                }`}
              >
                Close
              </span>
            </span>

            {/* + / × icon */}
            <span
              className={`grid size-4 place-items-center transition-transform duration-500 motion-reduce:transition-none ${
                menuOpen ? "rotate-315" : "rotate-0"
              }`}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="size-4"
              >
                <path
                  d="M8 0V16M0 8H16"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
              </svg>
            </span>
          </button>

          {/* Fullscreen Mobile Menu */}
          <div
            id="mobile-navigation"
            aria-hidden={!menuOpen}
            className={`fixed inset-0 z-90 transition-[visibility] duration-500 motion-reduce:transition-none ${
              menuOpen ? "visible" : "invisible"
            }`}
          >
            {/* Background */}
            <div
              className={`absolute inset-0 bg-[#efefeb] transition-opacity duration-500 motion-reduce:transition-none ${
                menuOpen ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Decorative Background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {/* Grid */}
              <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[50px_50px]" />

              {/* Circle 1 */}
              <div
                className={`absolute -left-24 top-24 size-64 rounded-full border border-black/10 transition-all duration-1000 motion-reduce:transition-none ${
                  menuOpen
                    ? "scale-100 rotate-0 opacity-100"
                    : "scale-50 -rotate-45 opacity-0"
                }`}
              />

              {/* Circle 2 */}
              <div
                className={`absolute -right-32 top-1/3 size-80 rounded-full border border-black/10 transition-all delay-100 duration-1000 motion-reduce:transition-none ${
                  menuOpen
                    ? "scale-100 rotate-0 opacity-100"
                    : "scale-50 rotate-45 opacity-0"
                }`}
              />

              {/* Circle 3 */}
              <div
                className={`absolute bottom-[-20%] left-1/3 size-96 rounded-full border border-black/10 transition-all delay-200 duration-1000 motion-reduce:transition-none ${
                  menuOpen
                    ? "scale-100 opacity-100"
                    : "scale-50 opacity-0"
                }`}
              />
            </div>

            {/* Mobile Menu Content */}
            <div
              className={`absolute inset-0 flex flex-col px-[7%] pt-28 transition-transform duration-700 ease-[cubic-bezier(0.65,0.01,0.05,0.99)] motion-reduce:transition-none ${
                menuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Navigation */}
              <nav aria-label="Mobile navigation">
                <ul>
                  {links.map((link, index) => {
                    const active = isActivePath(pathname, link.href);

                    return (
                      <li
                        key={link.href}
                        className={`border-b border-black/10 transition-all duration-700 motion-reduce:transition-none ${
                          menuOpen
                            ? "translate-y-0 opacity-100"
                            : "translate-y-10 opacity-0"
                        }`}
                        style={{
                          transitionDelay: menuOpen
                            ? `${150 + index * 60}ms`
                            : "0ms",
                        }}
                      >
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          onClick={closeMenu}
                          className="group flex items-center justify-between py-5"
                        >
                          <span
                            className={`text-[clamp(2.5rem,11vw,5rem)] font-medium leading-none tracking-tighter transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-2 ${
                              active
                                ? "text-black"
                                : "text-black/50"
                            }`}
                          >
                            {link.label}
                          </span>

                          <span
                            aria-hidden="true"
                            className={`text-lg transition-all duration-300 motion-reduce:transition-none group-hover:translate-x-1 ${
                              active
                                ? "opacity-100"
                                : "opacity-30"
                            }`}
                          >
                            ↗
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Bottom */}
              <div
                className={`mt-auto flex items-end justify-between border-t border-black/10 py-6 transition-all duration-700 motion-reduce:transition-none ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }`}
                style={{
                  transitionDelay: menuOpen ? "500ms" : "0ms",
                }}
              >
                <div>
                  <p className="mb-1 text-[9px] font-normal uppercase tracking-[0.2em] text-black/40">
                    Available for work
                  </p>

                  <p className="text-[12.5px] font-light text-black/60">
                    Let&apos;s build something meaningful.
                  </p>
                </div>

                <Link
                  href="/resume.pdf"
                  download
                  onClick={closeMenu}
                  className="rounded-lg bg-black px-4 py-3 text-[12.5px] font-medium text-white transition-transform duration-200 motion-reduce:transition-none hover:-translate-y-1"
                >
                  Resume ↓
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

