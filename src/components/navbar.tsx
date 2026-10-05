"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar({ personName, resumeUrl }: { personName: string; resumeUrl: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [resumeNotice, setResumeNotice] = useState(false);

  const notifyResumeUnavailable = () => {
    setResumeNotice(true);
    window.setTimeout(() => setResumeNotice(false), 2800);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Hide the navbar while scrolling down on tablet/desktop,
  // and reveal it again while scrolling up. Mobile stays visible.
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const isTabletOrDesktop = window.matchMedia("(min-width: 768px)").matches;
      const currentScrollY = window.scrollY;

      if (!isTabletOrDesktop || currentScrollY <= 10) {
        setNavVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY) {
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setNavVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    <header
      className={`
        fixed top-0 left-0 z-50 w-full
        transition-transform duration-300 ease-out
        ${navVisible ? "md:translate-y-0" : "md:-translate-y-full"}
      `}
    >
<nav
  aria-label="Primary navigation"
  className="
    h-21
    border-b border-white/10
    bg-[rgba(5,5,5,0.38)]
    px-[3.15vw]
  "
>
        <div
          className="
            relative
            mx-auto
            grid
            h-full
            grid-cols-[1fr_auto_1fr]
            items-center
          "
        >
          {/* =========================================================
              LOGO
          ========================================================== */}

          <Link
            href="/"
            aria-label={`${personName || "Portfolio"} — Home`}
            onClick={closeMenu}
            className="
              grid
              size-14.5
              place-items-center
              overflow-hidden
              rounded-full
              shadow-[0_5px_20px_rgba(0,0,0,0.35)]
              md:size-14
            "
          >
            <Image
              src="/vercel.svg"
              alt=""
              width={330}
              height={330}
              sizes="(max-width: 767px) 53px, 48px"
              className="size-13.25 object-contain md:size-12"
            />
          </Link>

          {/* =========================================================
              TABLET / DESKTOP NAVIGATION
          ========================================================== */}

          <div className="hidden h-full items-center justify-center md:flex">
            <div className="flex h-full items-center gap-8 lg:gap-14">
              {links.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`
                      group
                      relative
                      flex
                      h-full
                      items-center
                      font-mono
                      text-[10px]
                      font-normal
                      uppercase
                      tracking-[0.075em]
                      transition-colors
                      duration-200
                      ${
                        active
                          ? "text-white"
                          : "text-[#efefeb]/70 hover:text-white"
                      }
                    `}
                  >
                    {link.label}

                    {/* Active / hover underline */}
                    <span
                      className={`
                        absolute
                        right-0
                        bottom-6
                        left-0
                        h-px
                        origin-center
                        bg-[#efefeb]
                        transition-transform
                        duration-220
                        ease-[cubic-bezier(.22,1,.36,1)]
                        ${
                          active
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }
                      `}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              RESUME — TABLET / DESKTOP
          ========================================================== */}

          {resumeUrl ? <a
            href={resumeUrl} target="_blank" rel="noopener noreferrer" title="Open resume" aria-label="Open resume in a new tab"
            className="
              hidden
              h-10.75
              items-center
              justify-self-end
              border
              border-white/20
              font-mono
              text-[9px]
              uppercase
              tracking-[0.07em]
              text-white
              transition-colors
              duration-200
              hover:border-white/45
              hover:bg-white/[0.035]
              md:flex
            "
          >
            <span className="flex items-center gap-2.75 px-4.5">
              <span
                aria-hidden="true"
                className="
                  size-2.25
                  shrink-0
                  rounded-full
                  bg-[#ff5a1f]
                  shadow-[0_0_12px_rgba(255,90,31,0.28)]
                "
              />

              <span>Resume</span>
            </span>

            <span
              aria-hidden="true"
              className="
                grid
                h-full
                w-11.75
                place-items-center
                border-l
                border-white/16
                text-[16px]
                text-white/60
                transition-all
                duration-200
              "
            >
              ↓
            </span>
          </a> : <button type="button" onClick={notifyResumeUnavailable} title="Resume not available" aria-label="Resume not available" className="hidden h-10.75 items-center justify-self-end border border-white/20 font-mono text-[9px] uppercase tracking-[0.07em] text-white transition-colors duration-200 hover:border-white/45 hover:bg-white/[0.035] md:flex">
            <ResumeButtonContent />
          </button>}

          {/* =========================================================
              MOBILE
          ========================================================== */}

          <div className="absolute right-0 md:hidden">
            {/* =======================================================
                MOBILE MENU BUTTON
            ======================================================== */}

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className={`
  group
  relative
  z-100
  flex
  h-9.5
  items-center
  border
  border-white/20
  font-mono
  text-[9px]
  uppercase
  tracking-[0.07em]
  text-white
  transition-colors
  duration-200
  hover:border-white/45
  hover:bg-white/[0.035]
  motion-reduce:transition-none
  ${menuOpen ? "bg-[#070707]" : "bg-transparent"}
`}
            >
              {/* Menu / Close label */}

              <span
                className="
                  flex
                  h-full
                  items-center
                  gap-2.75
                  px-4.5
                "
              >
                {/* Green status light */}

                <span
                  aria-hidden="true"
                  className="
                    size-2.25
                    shrink-0
                    rounded-full
                    bg-[#7CFF6B]
                    shadow-[0_0_12px_rgba(124,255,107,0.28)]
                    transition-transform
                    duration-200
                    group-hover:scale-[1.15]
                  "
                />

                {/* Menu / Close text */}

                <span className="relative h-4 overflow-hidden leading-4">
                  <span
                    className={`
                      block
                      transition-transform
                      duration-500
                      motion-reduce:transition-none
                      ${
                        menuOpen
                          ? "-translate-y-4"
                          : "translate-y-0"
                      }
                    `}
                  >
                    Menu
                  </span>

                  <span
                    className={`
                      absolute
                      inset-0
                      transition-transform
                      duration-500
                      motion-reduce:transition-none
                      ${
                        menuOpen
                          ? "translate-y-0"
                          : "translate-y-4"
                      }
                    `}
                  >
                    Close
                  </span>
                </span>
              </span>

              {/* Divider + Plus / Close icon */}

              <span
                aria-hidden="true"
                className="
                  grid
                  h-full
                  w-11.75
                  place-items-center
                  border-l
                  border-white/16
                  text-white/60
                  transition-all
                  duration-200
                "
              >
                <span
                  className={`
                    grid
                    size-4
                    place-items-center
                    transition-transform
                    duration-500
                    motion-reduce:transition-none
                    ${
                      menuOpen
                        ? "rotate-315"
                        : "rotate-0"
                    }
                  `}
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
              </span>
            </button>

            {/* =======================================================
                FULLSCREEN MOBILE MENU
            ======================================================== */}

            <div
              id="mobile-navigation"
              aria-hidden={!menuOpen}
              className={`
                fixed
                inset-0
                z-90
                transition-[visibility]
                duration-500
                motion-reduce:transition-none
                ${
                  menuOpen
                    ? "visible"
                    : "invisible"
                }
              `}
            >
              {/* Background */}

              <div
                className={`
                  absolute
                  inset-0
                  bg-[#efefeb]
                  transition-opacity
                  duration-500
                  motion-reduce:transition-none
                  ${
                    menuOpen
                      ? "opacity-100"
                      : "opacity-0"
                  }
                `}
              />

              {/* =====================================================
                  DECORATIVE BACKGROUND
              ====================================================== */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  overflow-hidden
                "
              >
                {/* Grid */}

                <div
                  className="
                    absolute
                    inset-0
                    opacity-[0.035]
                    bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
                    bg-size-[50px_50px]
                  "
                />

                {/* Circle 1 */}

                <div
                  className={`
                    absolute
                    -left-24
                    top-24
                    size-64
                    rounded-full
                    border
                    border-black/10
                    transition-all
                    duration-1000
                    motion-reduce:transition-none
                    ${
                      menuOpen
                        ? "scale-100 rotate-0 opacity-100"
                        : "scale-50 -rotate-45 opacity-0"
                    }
                  `}
                />

                {/* Circle 2 */}

                <div
                  className={`
                    absolute
                    -right-32
                    top-1/3
                    size-80
                    rounded-full
                    border
                    border-black/10
                    transition-all
                    delay-100
                    duration-1000
                    motion-reduce:transition-none
                    ${
                      menuOpen
                        ? "scale-100 rotate-0 opacity-100"
                        : "scale-50 rotate-45 opacity-0"
                    }
                  `}
                />

                {/* Circle 3 */}

                <div
                  className={`
                    absolute
                    bottom-[-20%]
                    left-1/3
                    size-96
                    rounded-full
                    border
                    border-black/10
                    transition-all
                    delay-200
                    duration-1000
                    motion-reduce:transition-none
                    ${
                      menuOpen
                        ? "scale-100 opacity-100"
                        : "scale-50 opacity-0"
                    }
                  `}
                />
              </div>

              {/* =====================================================
                  MOBILE MENU CONTENT
              ====================================================== */}

              <div
                className={`
                  absolute
                  inset-0
                  flex
                  flex-col
                  px-[7%]
                  pt-28
                  transition-transform
                  duration-700
                  ease-[cubic-bezier(0.65,0.01,0.05,0.99)]
                  motion-reduce:transition-none
                  ${
                    menuOpen
                      ? "translate-x-0"
                      : "translate-x-full"
                  }
                `}
              >
                {/* Navigation */}

                <nav aria-label="Mobile navigation">
                  <ul>
                    {links.map((link, index) => {
                      const active = isActivePath(
                        pathname,
                        link.href,
                      );

                      return (
                        <li
                          key={link.href}
                          className={`
                            border-b
                            border-black/10
                            transition-all
                            duration-700
                            motion-reduce:transition-none
                            ${
                              menuOpen
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                            }
                          `}
                          style={{
                            transitionDelay: menuOpen
                              ? `${150 + index * 60}ms`
                              : "0ms",
                          }}
                        >
                          <Link
                            href={link.href}
                            aria-current={
                              active
                                ? "page"
                                : undefined
                            }
                            onClick={closeMenu}
                            className="
                              group
                              flex
                              items-center
                              justify-between
                              py-5
                            "
                          >
                            <span
                              className={`
                                text-[clamp(2.5rem,11vw,5rem)]
                                font-medium
                                leading-none
                                tracking-tighter
                                transition-transform
                                duration-300
                                motion-reduce:transition-none
                                group-hover:translate-x-2
                                ${
                                  active
                                    ? "text-black"
                                    : "text-black/50"
                                }
                              `}
                            >
                              {link.label}
                            </span>

                            <span
                              aria-hidden="true"
                              className={`
                                text-lg
                                transition-all
                                duration-300
                                motion-reduce:transition-none
                                group-hover:translate-x-1
                                ${
                                  active
                                    ? "opacity-100"
                                    : "opacity-30"
                                }
                              `}
                            >
                              ↗
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                    <li className={`border-b border-black/10 transition-all duration-700 motion-reduce:transition-none ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`} style={{ transitionDelay: menuOpen ? `${150 + links.length * 60}ms` : "0ms" }}>
                      {resumeUrl ? <a href={resumeUrl} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="group flex items-center justify-between py-5"><span className="text-[clamp(2.5rem,11vw,5rem)] font-medium leading-none tracking-tighter text-black/50 transition-transform duration-300 group-hover:translate-x-2 motion-reduce:transition-none">Resume</span><span aria-hidden="true" className="text-lg opacity-30">↗</span></a> : <button type="button" onClick={() => { closeMenu(); notifyResumeUnavailable(); }} className="group flex w-full items-center justify-between py-5 text-left"><span className="text-[clamp(2.5rem,11vw,5rem)] font-medium leading-none tracking-tighter text-black/50 transition-transform duration-300 group-hover:translate-x-2 motion-reduce:transition-none">Resume</span><span aria-hidden="true" className="text-lg opacity-30">↗</span></button>}
                    </li>
                  </ul>
                </nav>

                {/* ===================================================
                    MOBILE MENU FOOTER
                ==================================================== */}

                <div
                  className={`
                    mt-auto
                    flex
                    items-end
                    justify-between
                    border-t
                    border-black/10
                    py-6
                    transition-all
                    duration-700
                    motion-reduce:transition-none
                    ${
                      menuOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-5 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: menuOpen
                      ? "500ms"
                      : "0ms",
                  }}
                >
                  <div>
                    <p
                      className="
                        mb-1
                        text-[9px]
                        font-normal
                        uppercase
                        tracking-[0.2em]
                        text-black/40
                      "
                    >
                      Available for work
                    </p>

                    <p
                      className="
                        text-[12.5px]
                        font-light
                        text-black/60
                      "
                    >
                      Let&apos;s build something meaningful.
                    </p>
                  </div>

                  <Link
                    href="/contact"
                    onClick={closeMenu}
                    className="
                      rounded-lg
                      bg-black
                      px-4
                      py-3
                      text-[12.5px]
                      font-medium
                      text-white
                      transition-transform
                      duration-200
                      motion-reduce:transition-none
                      hover:-translate-y-1
                    "
                  >
                    Contact →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div aria-live="polite" className={`fixed right-5 top-24 z-100 border border-white/20 bg-[#111] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.08em] text-white shadow-xl transition-all duration-200 ${resumeNotice ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`} role="status">Resume not available</div>
    </header>
  );
}

function ResumeButtonContent() {
  return <><span className="flex items-center gap-2.75 px-4.5"><span aria-hidden="true" className="size-2.25 shrink-0 rounded-full bg-[#ff5a1f] shadow-[0_0_12px_rgba(255,90,31,0.28)]" /><span>Resume</span></span><span aria-hidden="true" className="grid h-full w-11.75 place-items-center border-l border-white/16 text-[16px] text-white/60 transition-all duration-200">↓</span></>;
}
