const { parse } = require('url');
const { json, send } = require('micro');

module.exports = async (req, res) => {
  const { query } = parse(req.url, true);
  const { config_id } = query;
  const body = await json(req);
  return send(res, 200);
};
