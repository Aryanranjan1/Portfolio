import SocialIcon from "./SocialIcon";
import type { FooterSocialLink } from "@/lib/footer/map-footer-social-links";

export default function FooterSocialLinks({
  links,
  className,
  linkClassName,
}: {
  links: FooterSocialLink[];
  className: string;
  linkClassName: string;
}) {
  return (
    <div className={className}>
      {links.map((link) => (
        <a
          key={link.type}
          href={link.href}
          className={linkClassName}
          aria-label={link.label}
          {...(["youtube", "threads", "instagram"].includes(link.type)
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          <SocialIcon name={link.type} />
        </a>
      ))}
    </div>
  );
}
