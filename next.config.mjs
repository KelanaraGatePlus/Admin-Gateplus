/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Ignore ESLint during production builds to avoid failing the build
        // while we iteratively address linting rules and missing plugins.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
