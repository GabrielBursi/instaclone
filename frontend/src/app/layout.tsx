import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './global.css'
import { Navbar } from '@/components/Navbar'
import { Provider } from '@/providers'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/queryClient'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'InstaClone',
	description: 'Este é um projeto fullstack desenvolvido com Node.js no backend e Next.js no frontend, com o objetivo de praticar conceitos fundamentais abordados no curso JStack. O foco principal está em paginação, infinite scroll e optimistic updates utilizando React Query.',
}


export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const qc = getQueryClient()

	return (
		<html lang="en">
			<Navbar />
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased mt-20`}
			>
				<Provider>
					<HydrationBoundary state={dehydrate(qc)}>
						{children}
					</HydrationBoundary>
				</Provider>
			</body>
		</html>
	)
}
