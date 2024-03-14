/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'source.boringavatars.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
<<<<<<< HEAD
=======
        hostname: 'psicoreinventar.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'zksjstmpprqqnhiviwwa.supabase.co',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'pub-a73a0280999e4a0cbf0918b31f9f798b.r2.dev',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
>>>>>>> a5a37de (update: image on cloudflare r2)
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
