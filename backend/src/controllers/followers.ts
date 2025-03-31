import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../db';

const followUserSchema = z.object({
	follower_id: z.number().int().positive(),
	following_id: z.number().int().positive()
});

export class FollowUserController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = followUserSchema.safeParse(request.body);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { follower_id, following_id } = data;

		if (follower_id === following_id) {
			return reply.code(400).send({
				error: 'Não é possível seguir a si mesmo'
			});
		}

		try {
			const { rows: [existingRelation] } = await query(
				'SELECT * FROM followers WHERE follower_id = $1 AND following_id = $2',
				[follower_id, following_id]
			);

			if (existingRelation) {
				return reply.code(400).send({
					error: 'Já está seguindo este usuário'
				});
			}

			const { rows: [relation] } = await query(`
        INSERT INTO followers(follower_id, following_id)
        VALUES ($1, $2)
        RETURNING *
      `, [follower_id, following_id]);

			reply.code(201).send({ relation });
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const unfollowUserSchema = z.object({
	follower_id: z.number().int().positive(),
	following_id: z.number().int().positive()
});

export class UnfollowUserController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = unfollowUserSchema.safeParse(request.body);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { follower_id, following_id } = data;

		try {
			await query(
				'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
				[follower_id, following_id]
			);

			reply.code(204).send();
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const getFollowersSchema = z.object({
	user_id: z.coerce.number().int().positive(),
	page: z.coerce.number().int().min(1).default(1),
	per_page: z.coerce.number().int().min(1).max(50).default(10)
});

export class GetFollowersController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = getFollowersSchema.safeParse({
			...request.params,
			...request.query
		});

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { user_id, page, per_page } = data;
		const offset = (page - 1) * per_page;

		try {
			const { rows: [user] } = await query(
				'SELECT * FROM users WHERE id = $1',
				[user_id]
			);

			if (!user) {
				return reply.code(404).send({
					error: 'Usuário não encontrado'
				});
			}

			const { rows: followers } = await query(`
        SELECT u.*, us.posts_count, us.followers_count, us.following_count
        FROM followers f
        JOIN users u ON f.follower_id = u.id
        JOIN user_stats us ON u.id = us.user_id
        WHERE f.following_id = $1
        ORDER BY f.created_at DESC
        LIMIT $2 OFFSET $3
      `, [user_id, per_page, offset]);

			const { rows: [stats] } = await query(
				'SELECT followers_count FROM user_stats WHERE user_id = $1',
				[user_id]
			);

			const totalFollowers = stats?.followers_count || 0;
			const totalPages = Math.ceil(totalFollowers / per_page);
			const hasNextPage = page < totalPages;
			const hasPrevPage = page > 1;

			reply.send({
				data: followers,
				meta: {
					total: totalFollowers,
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

const getFollowingSchema = z.object({
	user_id: z.coerce.number().int().positive(),
	page: z.coerce.number().int().min(1).default(1),
	per_page: z.coerce.number().int().min(1).max(50).default(10)
});

export class GetFollowingController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = getFollowingSchema.safeParse({
			...request.params,
			...request.query
		});

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { user_id, page, per_page } = data;
		const offset = (page - 1) * per_page;

		try {
			const { rows: [user] } = await query(
				'SELECT * FROM users WHERE id = $1',
				[user_id]
			);

			if (!user) {
				return reply.code(404).send({
					error: 'Usuário não encontrado'
				});
			}

			const { rows: following } = await query(`
        SELECT u.*, us.posts_count, us.followers_count, us.following_count
        FROM followers f
        JOIN users u ON f.following_id = u.id
        JOIN user_stats us ON u.id = us.user_id
        WHERE f.follower_id = $1
        ORDER BY f.created_at DESC
        LIMIT $2 OFFSET $3
      `, [user_id, per_page, offset]);

			const { rows: [stats] } = await query(
				'SELECT following_count FROM user_stats WHERE user_id = $1',
				[user_id]
			);

			const totalFollowing = stats?.following_count || 0;
			const totalPages = Math.ceil(totalFollowing / per_page);
			const hasNextPage = page < totalPages;
			const hasPrevPage = page > 1;

			reply.send({
				data: following,
				meta: {
					total: totalFollowing,
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
