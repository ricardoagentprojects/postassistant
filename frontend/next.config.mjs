/** @type {import('next').NextConfig} */
// Em `next dev`, o browser chama /api/v1/* no mesmo host; o Next encaminha para o FastAPI (evita CORS e mistura 127.0.0.1 vs localhost).
// Em Docker (frontend): API_INTERNAL_URL=http://backend:8000
const apiInternal =
  process.env.API_INTERNAL_URL ||
  process.env.BACKEND_INTERNAL_URL ||
  'http://127.0.0.1:8000';

const nextConfig = {
  async rewrites() {
    const base = apiInternal.replace(/\/+$/, '');
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${base}/api/v1/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
