import { parse } from 'url';
import { send, json } from 'micro';
import { promisify } from 'util';

import redis from 'redis';

import { client, ENDPOINTS } from '../services/zeit';

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
		// const { ...params } = query;

		const redisClient = redis.createClient( REDIS_URL, { password } );

		const getAsync = promisify(redisClient.get).bind(redisClient);

		const storedToken = JSON.parse(await getAsync('token'));

		if (storedToken) {
      const projects = await client.request(ENDPOINTS.project.list, {
        headers: {
          'Authorization': `Bearer ${storedToken['access_token']}`
        }
      });

      send(res, 200, projects);
      return null;
		}
	}

	return send(res, 404, {
		error: {
			message: 'not_found'
		}
	});
}
