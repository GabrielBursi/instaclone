import { Follower, FollowPayload, PaginatedResponde, PaginationParams, ReturnService } from "@/types";
import { Api } from "./config";

export const GetFollowers = async (user_id: number, queryParams?: PaginationParams): ReturnService<PaginatedResponde<Follower>> => {
	try {
		const { data } = await Api(`/followers/${user_id}`, { params: queryParams })
		return data
	} catch {
		return new Error()
	}
}

export const GetFollowing = async (user_id: number, queryParams?: PaginationParams): ReturnService<PaginatedResponde<Follower>> => {
	try {
		const { data } = await Api(`/followers/${user_id}/following`, { params: queryParams })
		return data
	} catch {
		return new Error()
	}
}

export const Follow = async (body: FollowPayload): ReturnService<void> => {
	try {
		await Api.post('/followers/follow', body)
	} catch {
		return new Error()
	}
}

export const Unfollow = async (body: FollowPayload): ReturnService<void> => {
	try {
		await Api.post('/followers/unfollow', body)
	} catch {
		return new Error()
	}
}


export const FollowerServices = {
	GetFollowers,
	GetFollowing,
	Follow,
	Unfollow,
} as const
