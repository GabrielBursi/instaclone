import { Like as TLike, LikePayload, PaginatedResponde, PaginationParams, Post, ReturnService } from "@/types"
import { Api } from "./config"

const GetAll = async (post_id: number, queryParams?: PaginationParams): ReturnService<PaginatedResponde<TLike>> => {
	try {
		const { data } = await Api(`/likes/${post_id}`, { params: queryParams })
		return data
	} catch {
		return new Error()
	}
}

const Like = async (body: LikePayload): ReturnService<{ like: TLike, post: Post }> => {
	try {
		const { data } = await Api.post(`/likes/like`, body)
		return data
	} catch {
		return new Error()
	}
}

export const LikeServices = {
	GetAll,
	Like,
} as const
