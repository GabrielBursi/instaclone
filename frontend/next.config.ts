import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'loremflickr.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'picsum.photos',
				pathname: '/**',
			},
		],
	},
}

export default nextConfig
