import {
	CreateUserPayload,
	CursorPaginationParams,
	PaginatedResponde,
	ReturnService,
	User,
} from '@/types'
import { Api } from './config'

const GetAll = async (
	queryParams?: CursorPaginationParams & { search?: string }
): ReturnService<PaginatedResponde<User>> => {
	try {
		const { data } = await Api<PaginatedResponde<User>>('/users', {
			params: queryParams,
		})
		return data
	} catch {
		return new Error()
	}
}

const GetById = async (user_id: string): ReturnService<User> => {
	try {
		const { data } = await Api<{ user: User }>(`/users/${user_id}`)
		return data.user
	} catch {
		return new Error()
	}
}

const Create = async (body: CreateUserPayload): ReturnService<User> => {
	try {
		const { data } = await Api.post<{ user: User }>(`/users`, body)
		return data.user
	} catch {
		return new Error()
	}
}

export const UserServices = {
	GetAll,
	GetById,
	Create,
} as const
