import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Avoid duplicate canvas mount/unmount in dev
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
  turbopack: {},
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
