// next.config.ts

const withImages = require('next-images');

module.exports = withImages({
  images: {
    domains: ['storage.appwrite.io'], // Allow images only from Appwrite storage
  },
  typescript: {
    // Remove ignoreBuildErrors
    ignoreBuildErrors: false,
  },
});
