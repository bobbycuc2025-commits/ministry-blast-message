/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ REQUIRED for static export
  output: "export",

  images: {
    unoptimized: true
  },

  // ❌ next start is NOT allowed in export mode
  // swcMinify is automatic in Next 16, can be omitted

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  }
};

module.exports = nextConfig;
