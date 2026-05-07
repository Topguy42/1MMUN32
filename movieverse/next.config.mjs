/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/tv',
  assetPrefix: '/tv',
  reactStrictMode: true,

  images: {
    unoptimized: true,
    qualities: [20, 75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "artworks.thetvdb.com" },
      { protocol: "https", hostname: "media.kitsu.io" },
      { protocol: "https", hostname: "media.kitsu.app" },
      { protocol: "https", hostname: "kitsu-production-media.s3.us-west-002.backblazeb2.com" },
      { protocol: "https", hostname: "media.themoviedb.org" },
      { protocol: "https", hostname: "image.tmdb.org" },
    ],
  },

  env: {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    RABBIT_API_KEY: process.env.RABBIT_API_KEY,
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId,
  },
};

export default nextConfig;
