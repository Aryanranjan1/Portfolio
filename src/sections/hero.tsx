import Image from "next/image";

const HERO_CONTENT = {
  microcopy: ["Code", "Design", "Automate", "Repeat"],
  kicker: "Ideas / Code / Real Impact",
  title: "Build What Matters.",
  scrollLabel: "Scroll",
  index: {
    current: "01",
    total: "04",
  },
  note: {
    lineOne: "Small Steps.",
    lineTwo: "Bigger Systems.",
  },
} as const;

export default function Hero({ location, year }: { location: string; year: number }) {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="
        hero
        relative
        h-dvh
        min-h-170
        w-full
        overflow-hidden
        bg-[#050505]
        text-[#efefeb]
      "
    >
      {/* ============================================================
          BACKGROUND
      ============================================================= */}

      <div
        aria-hidden="true"
        className="
          hero-background
          public-hero-media-enter
          absolute
          -inset-7.5
          z-0
          bg-cover
          bg-center
          bg-no-repeat
          will-change-transform
        "
      >
        <Image
          src="/hero.webp"
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover object-[center_47%]"
        />
        {/* Image overlay */}

        <div
          className="
            absolute
            inset-0
            bg-linear-to-b
            from-black/8
            via-black/4
            to-black/34
          "
        />

        {/* Vignette */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_47%,transparent_30%,rgba(0,0,0,0.12)_67%,rgba(0,0,0,0.48)_100%)]
          "
        />
      </div>

      {/* ============================================================
          LEFT MICRO COPY
      ============================================================= */}

      <div
        className="
          absolute
          left-[3.15vw]
          top-38.25
          z-10
          font-mono
          text-[10px]
          leading-[1.85]
          tracking-[0.07em]
          text-white/55
          uppercase

          max-[1023px]:left-6

          max-[767px]:left-5
          max-[767px]:top-26.25
          max-[767px]:text-[8px]

          max-[520px]:hidden
        "
      >
        {HERO_CONTENT.microcopy.map((item) => (
          <span key={item} className="block">
            {item}
          </span>
        ))}

        <span
          aria-hidden="true"
          className="
            mt-3
            block
            h-px
            w-5
            bg-white/55
          "
        />
      </div>

      {/* ============================================================
          LOCATION / YEAR
      ============================================================= */}

      <div
        className="
          absolute
          right-[3.15vw]
          top-41.75
          z-10
          text-right
          font-mono
          text-[10px]
          leading-[1.65]
          tracking-[0.075em]
          text-white/55
          uppercase

          max-[1023px]:right-6

          max-[767px]:right-5
          max-[767px]:top-28
          max-[767px]:text-[8px]

          max-[520px]:top-25
        "
      >
        <div>{location}</div>
        <div>{`// ${year}`}</div>
      </div>

      {/* ============================================================
          MAIN HERO CONTENT
      ============================================================= */}

      <div
        className="
          absolute
          left-1/2
          top-[48.5%]
          z-10
          w-[min(1000px,82vw)]
          -translate-x-1/2
          -translate-y-1/2
          text-center

          max-[767px]:top-[48%]
          max-[767px]:w-[90vw]

          max-[520px]:top-[47%]
        "
      >
        {/* Kicker */}

        <p
          className="
            mb-6.75
            whitespace-nowrap
            font-mono
            text-[10px]
            font-normal
            leading-none
            tracking-[0.34em]
            text-white/68
            uppercase

            max-[767px]:mb-5
            max-[767px]:whitespace-normal
            max-[767px]:text-[7px]
            max-[767px]:leading-[1.6]
            max-[767px]:tracking-[0.21em]

            max-[520px]:mx-auto
            max-[520px]:max-w-75
          "
        >
          {HERO_CONTENT.kicker}
        </p>

        {/* Main heading */}

        <h1
          id="hero-title"
          className={`public-hero-content-enter
            whitespace-nowrap
            font-mono
            text-[clamp(48px,5.5vw,82px)]
            font-normal
            leading-[0.94]
            tracking-[-0.065em]
            text-white
            [text-shadow:0_0_1px_rgba(255,255,255,0.95),0_0_9px_rgba(255,255,255,0.08)]

            max-[767px]:whitespace-normal
            max-[767px]:text-[clamp(35px,9vw,60px)]
            max-[767px]:leading-[0.96]
          `}
        >
          {HERO_CONTENT.title}
        </h1>
      </div>

      {/* ============================================================
          SCROLL INDICATOR
      ============================================================= */}

      <div
        aria-hidden="true"
        className="
          absolute
          right-[4.8vw]
          top-1/2
          z-10
          flex
          -translate-y-1/2
          flex-col
          items-center
          gap-3.25

          max-[1023px]:right-6

          max-[520px]:hidden
        "
      >
        <span
          className="
            h-18.5
            w-px
            bg-linear-to-b
            from-white/8
            via-white/65
            to-white/8
          "
        />

        <span
          className="
            font-mono
            text-[8px]
            leading-none
            tracking-[0.08em]
            text-white/62
            uppercase
          "
        >
          {HERO_CONTENT.scrollLabel}
        </span>

        <span
          className="
            h-18.5
            w-px
            bg-linear-to-b
            from-white/8
            via-white/65
            to-white/8
          "
        />

        <span
          className="
            size-1.25
            animate-[scrollPulse_2s_ease-in-out_infinite]
            rounded-full
            border
            border-white/80
          "
        />
      </div>

      {/* ============================================================
          BOTTOM LEFT INDEX
      ============================================================= */}

      <div
        className="
          absolute
          bottom-[10.5%]
          left-[3.55vw]
          z-10
          flex
          items-center
          gap-4.25
          font-mono
          text-[9px]
          leading-none
          tracking-[0.08em]
          text-white/56

          max-[1023px]:left-6

          max-[767px]:bottom-7.5

          max-[520px]:bottom-1.75
        "
      >
        <span>{HERO_CONTENT.index.current}</span>

        <span>/</span>

        <span>{HERO_CONTENT.index.total}</span>

        <span
          aria-hidden="true"
          className="
            h-px
            w-18
            bg-white/32
          "
        />
      </div>

      {/* ============================================================
          BOTTOM RIGHT NOTE
      ============================================================= */}

      <div
        className="
          absolute
          right-[3.15vw]
          bottom-[10.5%]
          z-10
          text-left
          font-mono
          text-[9px]
          leading-[1.7]
          tracking-[0.06em]
          text-white/58
          uppercase

          max-[1023px]:right-6

          max-[767px]:right-5
          max-[767px]:bottom-7.5
          max-[767px]:text-[7px]

          max-[520px]:bottom-7
        "
      >
        <div>{HERO_CONTENT.note.lineOne}</div>

        <div>{HERO_CONTENT.note.lineTwo}</div>

        <span
          aria-hidden="true"
          className="
            mt-2.75
            block
            h-px
            w-5
            bg-white/45
          "
        />
      </div>

      {/* ============================================================
          CSS ANIMATIONS
      ============================================================= */}

      <style>{`
        @keyframes scrollPulse {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.55;
          }

          50% {
            transform: translateY(5px);
            opacity: 1;
          }
        }

        /*
         * Reduced-motion users get a completely static background
         * and no decorative pulse animation.
         */

        @media (prefers-reduced-motion: reduce) {
          .hero-background {
            animation: none;
            transform: none;
          }

          .hero [class*="animate-"] {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
