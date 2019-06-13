import { parse } from 'url';
import { send, json } from 'micro';

import { client } from '../services/zeit';

/**
 * Handles incoming webhooks to the app.
 */
export default async function incomingWebhook(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Authorization, Accept, Content-Type'
	);

	if (req.method === 'OPTIONS') {
		return send(res, 200);
	}

	if (req.method === 'POST') {
		const { query } = parse(req.url, true);
		const { id: ownerId } = query;

		await client.setOwnerId(ownerId);

		try {
			const newDeployment = await client.triggerDeployment('zeit-contentful-blog');
			send(res, 200, newDeployment);
		} catch(err) {
			console.log(err);
			send(res, 403);
		} finally {
			return null;	
		}
	}

	return send(res, 404, {
		error: {
			message: 'not_found'
		}
	});
}
