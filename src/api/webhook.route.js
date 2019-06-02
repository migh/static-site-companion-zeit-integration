const { parse } = require('url');
const { json, send } = require('micro');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { query } = parse(req.url, true);
  const { config_id } = query;
  const changes = await json(req);
  const meta = await fetch(`https://api.zeit.co/v1/integrations/configuration/${config_id}/metadata`)
    .then(res => res.json());

  const newMeta = { ...meta, contentfulChanges: changes };

  await fetch(`https://api.zeit.co/v1/integrations/configuration/${config_id}/metadata`, {
    body: JSON.stringify(newMeta)
  });

  return send(res, 200, newMeta);
};
