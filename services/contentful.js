const fetch = require("node-fetch");

const KEYS = { 
  api_key: 'CFPAT-3yu9NntBWrk-X9_c3IiH4lsZbFjEH6wMIV2YP3_2RMA',
  space_id: '9ph90fospkte'
};

async function createHook () {
  const { api_key, space_id } = KEYS;
  const url = `https://api.contentful.com/spaces/${space_id}/webhook_definitions`;
  const headers = {
    Authorization: `Bearer ${api_key}`,
    "Content-Type": 'application/vnd.contentful.management.v1+json'
  }
  const body = {
    url: "https://webhook.site/69c46d91-33b5-4706-8bd9-3104d4cbe95b",
    "name": "zeit-vizz-hook",
    "topics": ["*.*"],
    "filters": []
  }
  const response = await fetch(url, { method: 'post', body: JSON.stringify(body), headers });
  console.log(response);
}

createHook();