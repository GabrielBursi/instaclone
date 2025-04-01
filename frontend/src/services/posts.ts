import { CreatePostPayload, CursorPaginationParams, PaginatedResponde, Post, ReturnService } from "@/types"
import { Api } from "./config"

const GetAll = async (queryParams?: CursorPaginationParams & { user_id: string }): ReturnService<PaginatedResponde<Post>> => {
	try {
		const { data } = await Api<PaginatedResponde<Post>>('/posts', { params: queryParams })
		return data
	} catch {
		return new Error()
	}
}

const Create = async (body: CreatePostPayload): ReturnService<Post> => {
	try {
		const { data } = await Api.post<{ post: Post }>('/posts', body)
		return data.post
	} catch {
		return new Error()
	}
}

const DeleteById = async (post_id: number): ReturnService<void> => {
	try {
		await Api.delete(`/posts/${post_id}`)
	} catch {
		return new Error()
	}
}

export const PostServices = {
	GetAll,
	Create,
	DeleteById,
} as const
