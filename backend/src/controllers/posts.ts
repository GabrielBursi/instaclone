import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../db';

const createPostSchema = z.object({
	caption: z.string().min(1),
	image_url: z.string().url().optional(),
	user_id: z.number().int().positive()
});

export class CreatePostController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = createPostSchema.safeParse(request.body);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { caption, image_url, user_id } = data;

		try {
			const { rows: [post] } = await query(`
        INSERT INTO posts(user_id, caption, image_url)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [user_id, caption, image_url]);

			reply.code(201).send({ post });
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const deletePostSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export class DeletePostController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = deletePostSchema.safeParse(request.params);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { id } = data;

		try {
			await query('DELETE FROM posts WHERE id = $1', [id]);
			reply.code(204).send();
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const listPostsOffsetSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	per_page: z.coerce.number().int().min(1).max(50).default(10),
	user_id: z.coerce.number().int().positive().optional()
});

export class ListPostsOffsetController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = listPostsOffsetSchema.safeParse(request.query);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { page, per_page, user_id } = data;
		const offset = (page - 1) * per_page;

		try {
			let postsQuery;
			let countQuery;

			if (user_id) {
				postsQuery = query(
					`SELECT p.*, u.username, u.name, u.avatar_url
           FROM posts p
           JOIN users u ON p.user_id = u.id
           WHERE p.user_id = $1
           ORDER BY p.published_at DESC
           LIMIT $2 OFFSET $3`,
					[user_id, per_page, offset]
				);

				countQuery = query(
					'SELECT posts_count FROM user_stats WHERE user_id = $1',
					[user_id]
				);
			} else {
				postsQuery = query(
					`SELECT p.*, u.username, u.name, u.avatar_url
           FROM posts p
           JOIN users u ON p.user_id = u.id
           ORDER BY p.published_at DESC
           LIMIT $1 OFFSET $2`,
					[per_page, offset]
				);

				countQuery = query(
					'SELECT total_count FROM system_summary WHERE entity = $1',
					['posts']
				);
			}

			const [countResult, postsResult] = await Promise.all([countQuery, postsQuery]);

			const total = user_id
				? countResult.rows[0]?.posts_count || 0
				: countResult.rows[0]?.total_count || 0;

			const totalPages = Math.ceil(total / per_page);
			const hasNextPage = page < totalPages;
			const hasPrevPage = page > 1;

			reply.send({
				data: postsResult.rows,
				meta: {
					total,
					page,
					per_page,
					total_pages: totalPages,
					has_next_page: hasNextPage,
					has_prev_page: hasPrevPage
				}
			});
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const listPostsCursorSchema = z.object({
	cursor: z.coerce.number().int().positive().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(10),
	user_id: z.coerce.number().int().positive().optional()
});

export class ListPostsCursorController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = listPostsCursorSchema.safeParse(request.query);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { cursor, limit, user_id } = data;

		try {
			let postsQuery;

			if (user_id) {
				postsQuery = cursor
					? query(
						`SELECT p.*, u.username, u.name, u.avatar_url
               FROM posts p
               JOIN users u ON p.user_id = u.id
               WHERE p.user_id = $1 AND p.id < $2
               ORDER BY p.id DESC
               LIMIT $3`,
						[user_id, cursor, limit]
					)
					: query(
						`SELECT p.*, u.username, u.name, u.avatar_url
               FROM posts p
               JOIN users u ON p.user_id = u.id
               WHERE p.user_id = $1
               ORDER BY p.id DESC
               LIMIT $2`,
						[user_id, limit]
					);
			} else {
				postsQuery = cursor
					? query(
						`SELECT p.*, u.username, u.name, u.avatar_url
               FROM posts p
               JOIN users u ON p.user_id = u.id
               WHERE p.id < $1
               ORDER BY p.id DESC
               LIMIT $2`,
						[cursor, limit]
					)
					: query(
						`SELECT p.*, u.username, u.name, u.avatar_url
               FROM posts p
               JOIN users u ON p.user_id = u.id
               ORDER BY p.id DESC
               LIMIT $1`,
						[limit]
					);
			}

			const { rows: posts } = await postsQuery;
			const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;
			const hasNextPage = posts.length === limit;

			reply.send({
				data: posts,
				meta: {
					next_cursor: nextCursor,
					has_next_page: hasNextPage
				}
			});
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}
