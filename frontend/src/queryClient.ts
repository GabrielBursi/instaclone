import { isServer, QueryClient } from '@tanstack/react-query'

export const makeQueryClient = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
				refetchOnWindowFocus: false,
			},
		},
	})

	return queryClient
}

let browserQueryClient: QueryClient | null = null

export const getQueryClient = () => {
	if (isServer) return makeQueryClient()
	else {
		if (!browserQueryClient) {
			browserQueryClient = makeQueryClient()
		}
		return browserQueryClient
	}
}
