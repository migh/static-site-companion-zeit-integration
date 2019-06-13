import axios from 'axios';
import redis from 'redis';
import { stringify } from 'querystring';
import { promisify } from 'util';

import composeUrl from '../utils/compose-url';
import flattenFiles from '../utils/flatten-files';
import constants from './zeit.constants';

const {
	ZEIT_CLIENT_ID,
	ZEIT_CLIENT_SECRET,
	ZEIT_CLIENT_REDIRECT_URI,
	API_URL,
	ENDPOINTS
} = constants;

/* Storage credentials */
const {
  REDIS_URL,
  REDIS_PASSWORD: password
} = process.env;

class ZeitClient {
	// todo: the OAuth token depends on the user, how to initialize automatically?
	constructor() {
		this._ownerId = null;
		this._accessToken = null;
	}

	get ownerId() {
		return this._ownerId;
	}

	async setOwnerId(ownerId) {
		this._ownerId = ownerId;

		// Check if there is an accessToken
		const redisClient = redis.createClient( REDIS_URL, { password } );
		const getAsync = promisify(redisClient.get).bind(redisClient);
		const storedToken = JSON.parse(await getAsync(`token_${ownerId}`));

		console.log(storedToken);
		if (storedToken) {
			this._accessToken = storedToken.access_token;
		}
	}
	
	async request(endpoint, options = { withAuth: true }) {
		const authHeader = {};

		if (options.withAuth && this._accessToken) {
			authHeader['Authorization'] = `Bearer ${this._accessToken}`;
		} else {
			throw new Error('No access token.');
		}

		const response = await axios(composeUrl(API_URL, endpoint), {
			method: options.method || 'GET',
			headers: {
				...(options.headers || {}),
				...authHeader
			}
		});
		
		return response.data;
	}

	async getAccessToken(code) {
		const payload = {
			code,
			client_id: ZEIT_CLIENT_ID,
			client_secret: ZEIT_CLIENT_SECRET,
			redirect_uri: ZEIT_CLIENT_REDIRECT_URI
		};

		return await axios(composeUrl(API_URL, ENDPOINTS.oauth.getAccessToken, { withAuth: false }), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			},
			data: stringify(payload)
		});
	}

	async getProjects() {
		return await this.request(ENDPOINTS.project.list);
	}

	async triggerDeployment(name) {
		// Zeit's API wraps response in deployments key.
		const { deployments } = await this.request(ENDPOINTS.deployment.list);
    // todo: Is the first in list the last or have to be sorted by deployment.created?
    const lastDeployment = deployments.filter(deployment => deployment.name === name)[0];

		console.log(deployments);
		const files = await this.request(ENDPOINTS.deployment.files.replace(':id', lastDeployment.uid));
    const [ srcFiles, outFiles ] = files;
    const buildFiles = flattenFiles(srcFiles);
 
		const deploymentOptions = {
      method: 'POST',
      data: JSON.stringify({
        name,
        version: 2,
        files: buildFiles
      })
		};
		console.log(deploymentOptions);
		// return await this.request(ENDPOINTS.deployment.new, deploymentOptions);
	}
}

const client = new ZeitClient();

export {
  ENDPOINTS,
  client
};