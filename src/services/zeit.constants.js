const {
	ZEIT_CLIENT_ID,
	ZEIT_CLIENT_SECRET,
	ZEIT_CLIENT_REDIRECT_URI
} = process.env;

const API_URL = 'https://api.zeit.co';

const ENDPOINTS = {
  oauth: {
    getAccessToken: '/v2/oauth/access_token'
  },
  project: {
    list: '/v1/projects/list'
  },
  deployment: {
    new: '/v9/now/deployments?forceNew=1',
    list: '/v4/now/deployments',
    files: '/v5/now/deployments/:id/files'
  }
};

export default {
	ZEIT_CLIENT_ID,
	ZEIT_CLIENT_SECRET,
	ZEIT_CLIENT_REDIRECT_URI,
  API_URL,
  ENDPOINTS
};