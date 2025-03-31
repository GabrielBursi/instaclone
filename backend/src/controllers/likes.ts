import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../db';

const likePostSchema = z.object({
	user_id: z.number().int().positive(),
	post_id: z.number().int().positive()
});

export class LikePostController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = likePostSchema.safeParse(request.body);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { user_id, post_id } = data;

		try {
			const { rows: [post] } = await query(
				'SELECT * FROM posts WHERE id = $1',
				[post_id]
			);

			if (!post) {
				return reply.code(404).send({
					error: 'Post não encontrado'
				});
			}

			const { rows: [existingLike] } = await query(
				'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
				[user_id, post_id]
			);

			if (existingLike) {
				return reply.code(400).send({
					error: 'Post já foi curtido por este usuário'
				});
			}

			const { rows: [like] } = await query(`
        INSERT INTO likes(user_id, post_id)
        VALUES ($1, $2)
        RETURNING *
      `, [user_id, post_id]);

			const { rows: [updatedPost] } = await query(
				'SELECT * FROM posts WHERE id = $1',
				[post_id]
			);

			reply.code(201).send({
				like,
				post: updatedPost
			});
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const unlikePostSchema = z.object({
	user_id: z.number().int().positive(),
	post_id: z.number().int().positive()
});

export class UnlikePostController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = unlikePostSchema.safeParse(request.body);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { user_id, post_id } = data;

		try {
			const { rows: [existingLike] } = await query(
				'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
				[user_id, post_id]
			);

			if (!existingLike) {
				return reply.code(404).send({
					error: 'Like não encontrado'
				});
			}

			await query(
				'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
				[user_id, post_id]
			);

			const { rows: [updatedPost] } = await query(
				'SELECT * FROM posts WHERE id = $1',
				[post_id]
			);

			reply.send({ post: updatedPost });
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const getPostLikesSchema = z.object({
	post_id: z.coerce.number().int().positive(),
	page: z.coerce.number().int().min(1).default(1),
	per_page: z.coerce.number().int().min(1).max(50).default(10)
});

export class GetPostLikesController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = getPostLikesSchema.safeParse({
			...request.params,
			...request.query
		});

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { post_id, page, per_page } = data;
		const offset = (page - 1) * per_page;

		try {
			const { rows: [post] } = await query(
				'SELECT * FROM posts WHERE id = $1',
				[post_id]
			);

			if (!post) {
				return reply.code(404).send({
					error: 'Post não encontrado'
				});
			}

			const { rows: likes } = await query(`
        SELECT u.*, us.posts_count, us.followers_count, us.following_count
        FROM likes l
        JOIN users u ON l.user_id = u.id
        JOIN user_stats us ON u.id = us.user_id
        WHERE l.post_id = $1
        ORDER BY l.created_at DESC
        LIMIT $2 OFFSET $3
      `, [post_id, per_page, offset]);

			const { rows: [likeCount] } = await query(
				'SELECT likes_count FROM posts WHERE id = $1',
				[post_id]
			);

			const totalLikes = likeCount?.likes_count || 0;
			const totalPages = Math.ceil(totalLikes / per_page);
			const hasNextPage = page < totalPages;
			const hasPrevPage = page > 1;

			reply.send({
				data: likes,
				meta: {
					total: totalLikes,
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
