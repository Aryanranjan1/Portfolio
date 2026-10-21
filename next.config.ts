import type { NextConfig } from "next";

function getConvexImagePattern() {
  const value = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".convex.cloud")) return null;
    return { protocol: "https" as const, hostname: url.hostname, port: "", pathname: "/api/storage/**", search: "" };
  } catch {
    return null;
  }
}

const convexImagePattern = getConvexImagePattern();

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/sitemap",
        destination: "/sitemap.xml",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
  experimental: {
    globalNotFound: true,
  },
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(convexImagePattern ? [convexImagePattern] : []),
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_678_400,
    qualities: [60, 75],
  },
};

export default nextConfig;
