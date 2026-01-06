const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  },
  turbopack: {
    root: __dirname, // ensures Next uses this folder as root
  },
};

module.exports = nextConfig;
