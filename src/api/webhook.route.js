const { parse } = require('url');
const { json, send } = require('micro');
const fetch = require('node-fetch');
const { getIntegrationConfig } = require('../services/mongo-integration-config');

module.exports = async (req, res) => {
  const { query } = parse(req.url, true);
  const { config_id, owner_id } = query;
  let integrationConfig, meta;

  try {
    integrationConfig = await getIntegrationConfig(owner_id);
  } catch (e) {
    return send(res, 500, `${e.message}`);
  }

  const headers = {
    Authorization: `Bearer ${integrationConfig.zeitToken}`
  };
  const changes = await json(req);

  try {
    meta = await fetch(`https://api.zeit.co/v1/integrations/configuration/${config_id}/metadata`, {
      headers
    })
      .then(res => res.json());
  } catch (e) {
    return send(res, 500, `${e.message} – fetch meta`);
  }

  const newEntry = changes && {
    version: changes.sys.version,
    updatedAt: changes.sys.updatedAt,
    publishedAt: changes.sys.publishedAt,
    updatedBy: changes.sys.updatedBy && changes.sys.updatedBy.sys.id,
    publishedVersion: changes.sys.publishedVersion
  };

  try {
    const newMeta = {
      ...meta,
      contentful: changes && (Array.isArray(meta.contentful) ? [newEntry, ...meta.contentful] : [newEntry])
    };

    await fetch(`https://api.zeit.co/v1/integrations/configuration/${config_id}/metadata`, {
      headers,
      method: 'POST',
      body: JSON.stringify(newMeta)
    });
    return send(res, 200, newMeta);
  } catch (e) {
    return send(res, 500, `${e.message} – post meta`);
  }
};
