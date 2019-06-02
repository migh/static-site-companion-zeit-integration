const { parse } = require('url');
const { json, send } = require('micro');
const fetch = require('node-fetch');

function getAuthToken(ownerId) {
  // read integration data from mongo using ownerId
}

module.exports = async (req, res) => {
  const { query } = parse(req.url, true);
  const { config_id, owner_id } = query;

  const headers = {
    Authorization: `Bearer ${zeit_token}`
  };
  const changes = await json(req);

  const meta = await fetch(`https://api.zeit.co/v1/integrations/configuration/${config_id}/metadata`, {
    headers
  })
    .then(res => res.json());

  const newMeta = { ...meta, contentfulChanges: changes };

  await fetch(`https://api.zeit.co/v1/integrations/configuration/${config_id}/metadata`, {
    headers,
    method: 'POST',
    body: JSON.stringify(newMeta)
  });

  return send(res, 200, newMeta);
};
