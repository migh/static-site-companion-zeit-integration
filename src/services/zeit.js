import axios from 'axios';
import { stringify } from 'querystring';

const constants = require('./zeit.constants');
const {
	ZEIT_CLIENT_ID,
	ZEIT_CLIENT_SECRET,
	ZEIT_CLIENT_REDIRECT_URI,
	API_URL,
	ENDPOINTS
} = constants;

class ZeitClient {
	composeUrl(endpoint, options = {}) {
		return `${API_URL}${endpoint}`;
	};
	
	async request(endpoint, options = {}) {
		return axios(this.composeUrl(endpoint), {
			method: options.method || 'GET',
			headers: {
				...(options.headers || {})
			}
		}).then(response => response.data);
	}

	async getAccessToken(code) {
		const payload = {
			code,
			client_id: ZEIT_CLIENT_ID,
			client_secret: ZEIT_CLIENT_SECRET,
			redirect_uri: ZEIT_CLIENT_REDIRECT_URI
		};

		console.log(payload);
		console.error('Err');
		console.error(payload);
		return await axios(this.composeUrl(ENDPOINTS.oauth.getAccessToken), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			},
			data: stringify(payload)
		});
	}
}

const client = new ZeitClient();

export {
  ENDPOINTS,
  client
};