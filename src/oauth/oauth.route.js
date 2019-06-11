import { parse } from 'url';
import { send } from 'micro';
import { promisify } from 'util';

import redis from 'redis';

import { client } from '../services/zeit';

const {
  REDIS_URL,
  REDIS_PASSWORD: password
} = process.env;

/**
 * Handles the callback to exchange a ZEIT authorization code for a token.
 */
export default async function zeitOAuthCallback(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Authorization, Accept, Content-Type'
	);

	if (req.method === 'OPTIONS') {
		return send(res, 200);
	}

	if (req.method === 'GET') {
		const { query } = parse(req.url, true);
		const { code, next } = query;

		const redisClient = redis.createClient( REDIS_URL, { password } );
		const setAsync = promisify(redisClient.set).bind(redisClient);

		if (code) {
			let error = null;
			try {
				const tokenResponse = await client.getAccessToken(code);
				const tokenInfo = tokenResponse.data;
				const ownerId = tokenInfo.team_id || tokenInfo.user_id;

				await setAsync(`token_${ownerId}`, JSON.stringify(tokenInfo));
				console.log(`Token stored: token_${ownerId}`);

			} catch(err) {
				error = err;
			}

			const redirectUrl = (!error) ? next : `${next}?error=Authentication%20error`
			res.writeHead(302, {
				Location: next
			});
			res.end('Redirecting...');
			return null;
		}
	}

	return send(res, 404, {
		error: {
			message: 'not_found'
		}
	});
}
