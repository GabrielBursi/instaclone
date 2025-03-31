import { Pool, PoolClient, QueryResultRow } from 'pg';

let pool: Pool;

function getPool() {
	if (!pool) {
		pool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});
	}

	return pool;
}

export async function query<TData extends QueryResultRow = Record<string, unknown>>(query: string, values?: unknown[]) {
	const pool = getPool();
	const client = await pool.connect();

	try {
		const { rows, rowCount } = await client.query<TData>(query, values);

		return { rows, rowCount };
	} finally {
		client.release();
	}
}

export async function transaction(callback: (tx: PoolClient) => Promise<void>) {
	const pool = getPool();
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		await callback(client);

		await client.query('COMMIT');
	} catch (error) {
		await client.query('ROLLBACK');

		throw error;
	}
}
