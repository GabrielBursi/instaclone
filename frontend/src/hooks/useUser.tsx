import { UserServices } from '@/services'
import { SafeType, User } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export function useUser(userId?: number) {
	const {
		data,
		isLoading,
		isError,
		error: errorRq,
	} = useQuery({
		queryKey: ['user', userId],
		queryFn: () => UserServices.GetById(userId!.toString()),
		enabled: !!userId,
	})

	const [user, setUser] = useState<SafeType<User> | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!data && (isError || !!errorRq)) {
			setError('Erro')
			return
		}

		if (!!data && data instanceof Error) {
			setError(data.message)
			return
		}

		if (!!data && !(data instanceof Error)) setUser(data)
	}, [data, errorRq, isError])

	return {
		user,
		isLoading,
		error,
	} as const
}
