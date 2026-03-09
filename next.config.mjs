/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minio.gateplus.id",
        port: "9000",
        pathname: "/media-gateplus/**",
      },
    ],
  },
};

export default nextConfig;
