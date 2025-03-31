import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { query } from '../db';

const createUserSchema = z.object({
	username: z.string().min(3).max(50),
	name: z.string().min(1).max(100),
	email: z.string().email(),
	bio: z.string().optional(),
	avatar_url: z.string().url().optional()
});

export class CreateUserController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = createUserSchema.safeParse(request.body);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { username, name, email, bio, avatar_url } = data;

		try {
			const { rows: [user] } = await query(`
        INSERT INTO users(username, name, email, bio, avatar_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [username, name, email, bio, avatar_url]);

			reply.code(201).send({ user });
		} catch (error) {
			console.log(error);

			if (error.code === '23505') {
				return reply.code(400).send({
					error: 'Username ou email já existem'
				});
			}

			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const getUserSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export class GetUserController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = getUserSchema.safeParse(request.params);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { id } = data;

		try {
			const { rows: [user] } = await query(`
        SELECT u.*, us.posts_count, us.followers_count, us.following_count
        FROM users u
        JOIN user_stats us ON u.id = us.user_id
        WHERE u.id = $1
      `, [id]);

			if (!user) {
				return reply.code(404).send({ error: 'Usuário não encontrado' });
			}

			reply.send({ user });
		} catch (error) {
			console.log(error);
			reply.code(500).send({ error: 'Erro interno do servidor' });
		}
	}
}

const listUsersSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	per_page: z.coerce.number().int().min(1).max(50).default(10),
	search: z.string().optional()
});

export class ListUsersController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = listUsersSchema.safeParse(request.query);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { page, per_page, search } = data;
		const offset = (page - 1) * per_page;

		try {
			let usersQuery;
			let countQuery;

			if (search) {
				const searchPattern = `%${search}%`;

				usersQuery = query(`
          SELECT u.*, us.posts_count, us.followers_count, us.following_count
          FROM users u
          JOIN user_stats us ON u.id = us.user_id
          WHERE u.username ILIKE $1 OR u.name ILIKE $1
          ORDER BY u.id
          LIMIT $2 OFFSET $3
        `, [searchPattern, per_page, offset]);

				countQuery = query(`
          SELECT COUNT(*) as total
          FROM users
          WHERE username ILIKE $1 OR name ILIKE $1
        `, [searchPattern]);
			} else {
				usersQuery = query(`
          SELECT u.*, us.posts_count, us.followers_count, us.following_count
          FROM users u
          JOIN user_stats us ON u.id = us.user_id
          ORDER BY u.id
          LIMIT $1 OFFSET $2
        `, [per_page, offset]);

				countQuery = query(
					'SELECT total_count FROM system_summary WHERE entity = $1',
					['users']
				);
			}

			const [countResult, usersResult] = await Promise.all([countQuery, usersQuery]);

			const total = search
				? parseInt(countResult.rows[0]?.total || '0')
				: countResult.rows[0]?.total_count || 0;

			const totalPages = Math.ceil(total / per_page);
			const hasNextPage = page < totalPages;
			const hasPrevPage = page > 1;

			reply.send({
				data: usersResult.rows,
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

const listUsersCursorSchema = z.object({
	cursor: z.coerce.number().int().positive().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(10),
	search: z.string().optional()
});

export class ListUsersCursorController {
	static async handler(request: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = listUsersCursorSchema.safeParse(request.query);

		if (!success) {
			return reply.code(400).send({
				error: error.issues,
			});
		}

		const { cursor, limit, search } = data;

		try {
			let usersQuery;

			if (search) {
				const searchPattern = `%${search}%`;

				usersQuery = cursor
					? query(`
              SELECT u.*, us.posts_count, us.followers_count, us.following_count
              FROM users u
              JOIN user_stats us ON u.id = us.user_id
              WHERE (u.username ILIKE $1 OR u.name ILIKE $1) AND u.id > $2
              ORDER BY u.id
              LIMIT $3
            `, [searchPattern, cursor, limit])
					: query(`
              SELECT u.*, us.posts_count, us.followers_count, us.following_count
              FROM users u
              JOIN user_stats us ON u.id = us.user_id
              WHERE u.username ILIKE $1 OR u.name ILIKE $1
              ORDER BY u.id
              LIMIT $2
            `, [searchPattern, limit]);
			} else {
				usersQuery = cursor
					? query(`
              SELECT u.*, us.posts_count, us.followers_count, us.following_count
              FROM users u
              JOIN user_stats us ON u.id = us.user_id
              WHERE u.id > $1
              ORDER BY u.id
              LIMIT $2
            `, [cursor, limit])
					: query(`
              SELECT u.*, us.posts_count, us.followers_count, us.following_count
              FROM users u
              JOIN user_stats us ON u.id = us.user_id
              ORDER BY u.id
              LIMIT $1
            `, [limit]);
			}

			const { rows: users } = await usersQuery;
			const nextCursor = users.length > 0 ? users[users.length - 1].id : null;
			const hasNextPage = users.length === limit;

			reply.send({
				data: users,
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
