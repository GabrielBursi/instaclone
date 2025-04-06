'use client'

import { getQueryClient } from "@/queryClient"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PropsWithChildren } from "react"


export const Provider = ({ children }: PropsWithChildren) => {
	const qc = getQueryClient()

	return (
		<QueryClientProvider client={qc}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}
