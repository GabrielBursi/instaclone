import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FollowerServices } from '@/services/followers'
import { SafeType, User } from '@/types'
import { useCallback, useEffect, useState } from 'react'

type OldUser = SafeType<User>

export function useFollowing(userId?: number) {
	const queryClient = useQueryClient()

	const {
		data: followersData,
		isLoading: isLoadingFollowers,
		isError: isErrorFollowers,
	} = useQuery({
		queryKey: ['followers', userId],
		queryFn: () => FollowerServices.GetFollowers(userId!),
		enabled: !!userId,
	})

	const {
		data: followingData,
		isLoading: isLoadingFollowing,
		isError: isErrorFollowing,
	} = useQuery({
		queryKey: ['following', userId],
		queryFn: () => FollowerServices.GetFollowing(userId!),
		enabled: !!userId,
	})

	const [followers, setFollowers] = useState<SafeType<User>[]>([])
	const [following, setFollowing] = useState<SafeType<User>[]>([])
	const [fetchError, setFetchError] = useState<string | null>(null)

	useEffect(() => {
		if (isErrorFollowers || isErrorFollowing) {
			setFetchError('Erro ao carregar lista de seguidores/seguidos.')
			return
		}

		if (followersData && !(followersData instanceof Error)) {
			const valid = followersData?.data?.filter((f) => !!f) ?? []
			setFollowers(valid)
		}
		if (followingData && !(followingData instanceof Error)) {
			const valid = followingData?.data?.filter((f) => !!f) ?? []
			setFollowing(valid)
		}
	}, [followersData, followingData, isErrorFollowers, isErrorFollowing])

	const {
		mutate: followUser,
		isPending: isFollowingUser,
		error: followError,
	} = useMutation({
		mutationFn: FollowerServices.Follow,
		onMutate: async (variables) => {
			await queryClient.cancelQueries({
				queryKey: ['user', variables.following_id],
			})
			await queryClient.cancelQueries({
				queryKey: ['user', variables.follower_id],
			})

			const previousFollowingUserData = queryClient.getQueryData([
				'user',
				variables.following_id,
			])
			const previousFollowerUserData = queryClient.getQueryData([
				'user',
				variables.follower_id,
			])

			queryClient.setQueryData(
				['user', variables.following_id],
				(old: OldUser) => {
					if (!old) return old
					return {
						...old,
						followers_count: (old.followers_count ?? 0) + 1,
					}
				}
			)

			queryClient.setQueryData(
				['user', variables.follower_id],
				(old: OldUser) => {
					if (!old) return old
					return {
						...old,
						following_count: (old.following_count ?? 0) + 1,
					}
				}
			)

			return { previousFollowingUserData, previousFollowerUserData }
		},
		onError: async (_err, variables, context) => {
			await queryClient.cancelQueries({
				queryKey: ['user', variables.following_id],
			})
			await queryClient.cancelQueries({
				queryKey: ['user', variables.follower_id],
			})
			queryClient.setQueryData(
				['user', variables.following_id],
				context?.previousFollowingUserData
			)
			queryClient.setQueryData(
				['user', variables.follower_id],
				context?.previousFollowerUserData
			)
		},
		onSettled: async (_data, _err, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ['user', variables.following_id],
				}),
				queryClient.invalidateQueries({
					queryKey: ['user', variables.follower_id],
				}),
				queryClient.invalidateQueries({
					queryKey: ['followers', variables.following_id],
				}),
				queryClient.invalidateQueries({
					queryKey: ['following', variables.follower_id],
				}),
			])
		},
	})

	const {
		mutate: unfollowUser,
		isPending: isUnfollowingUser,
		error: unfollowError,
	} = useMutation({
		mutationFn: FollowerServices.Unfollow,
		onMutate: async (variables) => {
			await queryClient.cancelQueries({
				queryKey: ['user', variables.following_id],
			})

			const previousFollowingUserData = queryClient.getQueryData([
				'user',
				variables.following_id,
			])
			const previousFollowerUserData = queryClient.getQueryData([
				'user',
				variables.follower_id,
			])

			queryClient.setQueryData(
				['user', variables.following_id],
				(old: OldUser) => {
					if (!old) return old
					return {
						...old,
						followers_count: Math.max(0, (old.followers_count ?? 1) - 1),
					}
				}
			)

			queryClient.setQueryData(
				['user', variables.follower_id],
				(old: OldUser) => {
					if (!old) return old
					return {
						...old,
						following_count: Math.max(0, (old.following_count ?? 1) - 1),
					}
				}
			)

			return { previousFollowingUserData, previousFollowerUserData }
		},
		onError: async (_err, variables, context) => {
			await queryClient.cancelQueries({
				queryKey: ['user', variables.following_id],
			})
			await queryClient.cancelQueries({
				queryKey: ['user', variables.follower_id],
			})
			queryClient.setQueryData(
				['user', variables.following_id],
				context?.previousFollowingUserData
			)
			queryClient.setQueryData(
				['user', variables.follower_id],
				context?.previousFollowerUserData
			)
		},
		onSettled: async (_data, _err, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['user', userId] }),
				queryClient.invalidateQueries({
					queryKey: ['user', variables.following_id],
				}),
				queryClient.invalidateQueries({
					queryKey: ['user', variables.follower_id],
				}),
				queryClient.invalidateQueries({
					queryKey: ['followers', variables.following_id],
				}),
				queryClient.invalidateQueries({
					queryKey: ['following', variables.follower_id],
				}),
			])
		},
	})

	const isUserFollowingOther = useCallback((otherId: number) => {
		const isFollowing = following.some(user => user?.id === otherId)
		return isFollowing
	}, [following])

	return {
		followers,
		following,
		isLoadingFollowers,
		isLoadingFollowing,
		fetchError,
		followUser,
		unfollowUser,
		isFollowingUser,
		isUnfollowingUser,
		followError,
		unfollowError,
		isUserFollowingOther,
	} as const
}
