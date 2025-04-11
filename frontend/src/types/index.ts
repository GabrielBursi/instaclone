export interface MetaPagination {
	next_cursor: number
	total: number
	page: number
	per_page: number
	total_pages: number
	has_next_page: boolean
	has_prev_page: boolean
}

export interface User {
	id: number
	username: string
	name: string
	email: string
	bio: string
	avatar_url: string
	created_at: string
	posts_count: number
	followers_count: number
	following_count: number
}

export interface Post {
	id: number
	user_id: number
	caption: string
	image_url: string
	published_at: string
	likes_count: number
	username: string
	name: string
	avatar_url: string
}

export interface Like {
	id: number
	username: string
	name: string
	email: string
	bio: string
	avatar_url: string
	created_at: string
	posts_count: number
	followers_count: number
	following_count: number
}

export interface Follower {
	id: number
	username: string
	name: string
	email: string
	bio: string
	avatar_url: string
	created_at: string
	posts_count: number
	followers_count: number
	following_count: number
}

export type SafeType<TObj = unknown> = {
	[TKey in keyof TObj]?: TObj[TKey] extends object
		? SafeType<TObj[TKey]> | null
		: TObj[TKey] | null
}

export interface PaginatedResponde<TData extends object> {
	readonly data: SafeType<TData>[]
	readonly meta: SafeType<MetaPagination>
}

export type CursorPaginationParams = {
	cursor?: string
	limit?: string
}

export type PaginationParams = {
	page?: number
	per_page?: number
}

export type ReturnService<TData = unknown> = Promise<SafeType<TData> | Error>

export type CreateUserPayload = {
	username: string
	name: string
	email: string
	bio?: string | null
	avatar_url?: string | null
}

export type CreatePostPayload = {
	caption: string
	image_url?: string | null
	user_id: number
}

export type LikePayload = {
	user_id: number
	post_id: number
}

export type FollowPayload = {
	follower_id: number
	following_id: number
}
