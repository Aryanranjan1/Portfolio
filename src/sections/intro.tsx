import Image from "next/image";
import type { AboutProfile } from "@/lib/about/get-about-content";

const INTRO_CONTENT = {
  sectionLabel: {
    prefix: "//",
    text: "ABOUT ME",
  },

  title: {
    mutedLines: ["turning ideas", "into useful things."],
  },


  meta: {
    index: "02",
    items: ["IDEAS", "CODE", "DISCIPLINE", "FREEDOM"],
  },


  quote: {
    lines: ["Same", "curiosity.", "Higher", "standards."],
  },

  identity: {
    items: ["DEVELOPER", "LEARNER", "BUILDER"],
    separator: "//",
  },

  image:
    "/intro.png",
} as const;

export default function IntroSection({ profile, year }: { profile: AboutProfile; year: number }) {
  return (
    <section
      id="about"
      aria-labelledby="intro-title"
      className="
        relative
        min-h-screen
        w-full
        overflow-hidden
        bg-[#e1e1e3]
        px-[4.35vw]
        py-7
        text-[#151515]
        antialiased

        max-[767px]:min-h-225
        max-[767px]:px-6
        max-[767px]:py-5.5

        max-[480px]:min-h-205
        max-[480px]:px-5
        max-[480px]:py-5
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[calc(100vh-56px)]
          w-full
          max-w-375

          max-[767px]:min-h-214

          max-[480px]:min-h-195
        "
      >
        {/* ============================================================
            TOP SECTION LABEL
        ============================================================= */}

        <div
          className="
            absolute
            top-31
            left-0
            right-0
            z-10
            flex
            items-center
            gap-6.5
            pointer-events-none

            max-[767px]:top-18
            max-[767px]:gap-4
          "
        >
          <div
            className="
              shrink-0
              font-mono
              text-[10px]
              leading-none
              tracking-[0.035em]
              text-[#151515]
              whitespace-nowrap

              max-[767px]:text-[8px]
            "
          >
            <span
              aria-hidden="true"
              className="mr-3"
            >
              {INTRO_CONTENT.sectionLabel.prefix}
            </span>

            {INTRO_CONTENT.sectionLabel.text}
          </div>

          <div
            aria-hidden="true"
            className="
              h-px
              w-123.75
              max-w-[40vw]
              bg-[rgba(5,5,5,0.28)]

              max-[767px]:max-w-none
              max-[767px]:w-full
            "
          />
        </div>

        {/* ============================================================
            MAIN ARTWORK
        ============================================================= */}

        <figure
          aria-hidden="true"
          className="
            absolute
            top-0
            right-[4.5%]
            z-1
            h-full
            w-[min(58vw,850px)]
            pointer-events-none

            max-[1023px]:right-0
            max-[1023px]:w-[62vw]

            max-[767px]:
              opacity-[0.86]

            max-[480px]:
          "
        >
          <Image
            src={INTRO_CONTENT.image}
            alt=""
            fill
            sizes="
              (max-width: 480px) 125vw,
              (max-width: 760px) 115vw,
              (max-width: 1050px) 62vw,
              58vw
            "
            className="
              object-contain
              object-center
              mix-blend-multiply
              grayscale
              contrast-[1.03]
              scale-[1.025]
              transition-[transform,filter]
              duration-900
              ease-[cubic-bezier(.22,1,.36,1)]

              group-hover:scale-100
            "
          />

          {/* Artwork vignette */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              bg-[radial-gradient(ellipse_at_48%_46%,transparent_0_46%,rgba(225,225,227,0.04)_64%,rgba(225,225,227,0.18)_88%,rgba(225,225,227,0.5)_100%)]
            "
          />
        </figure>

        {/* ============================================================
            LEFT STATEMENT
        ============================================================= */}

        <div
          className="
            absolute
            top-[30.5%]
            left-0
            z-4
            w-127.5
            max-w-[40vw]

            max-[1023px]:w-117.5
            max-[1023px]:max-w-[46vw]

            max-[767px]:

            max-[480px]:
          "
        >
          <h2
            id="intro-title"
            className="
              m-0
              font-sans
              text-[clamp(47px,4.1vw,69px)]
              font-medium
              leading-[0.86]
              tracking-[-0.055em]
              text-[#050505]

              max-[1023px]:text-[clamp(42px,4.6vw,62px)]

              max-[767px]:text-[clamp(42px,11vw,68px)]

              max-[480px]:text-[43px]
            "
          >
            {profile.professionalTitle}
            <br />

            {INTRO_CONTENT.title.mutedLines.map((line) => (
              <span
                key={line}
                className="
                  font-mono
                  text-[0.82em]
                  font-normal
                  tracking-[-0.055em]
                  text-[#77777a]

                  max-[767px]:text-[0.78em]
                "
              >
                {line}
                <br />
              </span>
            ))}
          </h2>

          {/* Divider */}

          <div
            aria-hidden="true"
            className="
              my-7.75
              h-0.5
              w-6.25
              bg-[#77777a]

              max-[767px]:my-6.5
            "
          />

          {/* Description */}

          <p
            className="
              m-0
              max-w-100
              font-mono
              text-[13px]
              leading-normal
              tracking-[0.005em]
              text-[#4f4f50]

              max-[767px]:max-w-97.5
              max-[767px]:text-[11px]

              max-[480px]:max-w-77.5
              max-[480px]:text-[10px]
            "
          >
            {profile.shortDescription}
          </p>
        </div>

        {/* ============================================================
            RIGHT METADATA
        ============================================================= */}

        <aside
          className="
            absolute
            top-22.75
            z-6

            max-[1023px]:w-31.25

            max-[767px]:
              right-0
              w-20
          "
        >
          <div
            className="
              mb-4.5
              font-mono
              text-[13px]
              text-[#4c4c4d]

              max-[767px]:text-[10px]
            "
          >
            {INTRO_CONTENT.meta.index}
          </div>

          <div
            className="
              flex
              flex-col
              gap-0.5
              font-mono
              text-xs
              leading-[1.3]
              text-[#555556]
              uppercase

              max-[767px]:text-[8px]
            "
          >
            {INTRO_CONTENT.meta.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div
            aria-hidden="true"
            className="
              mt-5
              h-0.5
              w-4.5
              bg-[#555556]
            "
          />
        </aside>

        {/* ============================================================
            DECORATIVE DOTS
        ============================================================= */}

        <span
          aria-hidden="true"
          className="
            absolute
            top-[10.2%]
            right-[23.9%]
            z-6
            size-1
            rounded-full
            bg-[#050505]
          "
        />

        <span
          aria-hidden="true"
          className="
            absolute
            top-[14.5%]
            right-[20.9%]
            z-6
            size-1.25
            rounded-full
            bg-[#050505]
          "
        />

        {/* ============================================================
            PLUS MARK
        ============================================================= */}

        <span
          aria-hidden="true"
          className="
            absolute
            right-[3.3%]
            z-7
            h-6.25
            w-6.25
            text-[#050505]

            max-[767px]:
              top-[45%]
          "
        >
          <span
            className="
              absolute
              top-3
              left-0
              h-px
              w-6.25
              bg-current
            "
          />

          <span
            className="
              absolute
              top-0
              left-3
              h-6.25
              w-px
              bg-current
            "
          />
        </span>

        {/* ============================================================
            LOCATION
        ============================================================= */}

        <div
          className="
            absolute
            left-0
            z-6
            font-mono
            leading-[1.8]
            tracking-[0.06em]
            text-[#737375]
            uppercase

            max-[767px]:
              bottom-[4%]
              text-[8px]
          "
        >
          <div>{profile.location.toUpperCase()}</div>
          <div>{`// ${year}`}</div>
        </div>

        {/* ============================================================
            QUOTE
        ============================================================= */}

        <div
          className="
            absolute
            z-6
            border-l
            border-[#777779]
            pl-6
            font-mono
            leading-[1.42]
            text-[#555556]

            max-[1023px]:right-[6%]

            max-[767px]:
              right-0
              bottom-[12%]
              w-31.25
              text-[8px]

            max-[480px]:hidden
          "
        >
          {INTRO_CONTENT.quote.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}

          <div
            aria-hidden="true"
            className="
              mt-3
              h-0.5
              w-4.25
              bg-[#666668]
            "
          />
        </div>

        {/* ============================================================
            BOTTOM IDENTITY
        ============================================================= */}

        <div
          className="
            absolute
            z-7
            whitespace-nowrap
            font-mono
            tracking-[0.045em]
            text-[#414143]

            max-[767px]:
              right-0

            max-[480px]:
              bottom-[5%]
              text-[7px]
          "
        >
          <span className="text-[#222]">[</span>

          {INTRO_CONTENT.identity.items.map((item, index) => (
            <span key={item}>
              {item}

              {index < INTRO_CONTENT.identity.items.length - 1 && (
                <span className="px-2.75 text-[#555]">
                  {INTRO_CONTENT.identity.separator}
                </span>
              )}
            </span>
          ))}

          <span className="text-[#222]">]</span>
        </div>
      </div>
    </section>
  );
}
