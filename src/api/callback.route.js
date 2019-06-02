import { parse } from 'url';
import { send } from 'micro';
import getAccessToken from '../services/get-access-token';
import { mongoIntegrationConfig } from '../services/mongo-integration-config';

/**
 * Handles the callback to exchange a ZEIT authorization code for a token.
 * With the token it brings the information related to the owner and the
 * installation. We will store it as the basic config for an integration
 * user.
 *
 */
export default async function zeitCallback(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Accept, Content-Type'
    );

    if (req.method === 'OPTIONS') {
        return send(res, 200);
    }

    /**
     * When there is a GET in this endpoint it means there is an authorization
     * code to exchange for a token so we ensure that the data comes in the
     * querystring and finish the token issuance.
     */
    if (req.method === 'GET') {
        const { query }  = parse(req.url, true);
        const { code, next } = query;
        const tokenInfo = await getAccessToken(code);

        if (!tokenInfo) {
            return send(res, 403, 'Error exchanging OAuth code');
        }

        if (!code || !next) {
            return send(res, 403, 'No code or next url found in query');
        }

        const ownerId = tokenInfo.user_id;

        await mongoIntegrationConfig({
            zeitToken: tokenInfo.access_token,
            teamId: tokenInfo.team_id,
            userId: tokenInfo.user_id,
            ownerId
        });

        res.writeHead(302, {
            Location: next
        });
        res.end('Redirecting...');
        return null;
    }

    return send(res, 404, {
        error: {
            message: 'not_found'
        }
    });
}
