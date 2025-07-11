/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/types'],
  webpack: (config) => {
    // Handle decorators in shared packages
    config.module.rules.push({
      test: /\.tsx?$/,
      include: /node_modules\/@repo\/types/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-typescript',
          ],
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-transform-class-properties',
          ],
        },
      },
    });

    return config;
  },
};

export default nextConfig;
