/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  basePath: '/AzubiKIa', // Wichtig: Muss Ihr Repository-Name sein
  trailingSlash: true, 
  experimental: {},
  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;
