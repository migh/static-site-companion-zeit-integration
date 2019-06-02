const contentful = require("contentful");
const contentfulMgmt = require('contentful-management');
const {
  HOOK_URL
} = process.env;

class Client {
  constructor() {
    this.__delivery = null;
    this.__management = null;
  }

  config(space, deliveryToken, managementToken) {
    this.__delivery = contentful.createClient({ space, accessToken: deliveryToken });
    this.__management = contentfulMgmt.createClient({ accessToken: managementToken })
  }

  async createHook (spaceId, uiHookPayload) {
    const space = await this.__management.getSpace(spaceId);
    try {
      const webhook = await space.createWebhook({
        'name': `zeit-now-hook-${uiHookPayload.integrationId}-${uiHookPayload.configurationId}`,
        'url': `${HOOK_URL}/webhook?config_id=${uiHookPayload.configurationId}&owner_id=${uiHookPayload.user.id}`,
        'topics': [
          '*.publish'
        ]
      });
      console.info(`Hook created!`, webhook.name);
    } catch (e) {
      console.error(e);
    }
  }

  async getContentTypes() {
    if (!this.__delivery) {
      throw new Error('You need to config Contentful client first. Use `client.config(space, accessToken)`')
    }

    const raw = await this.__delivery.getContentTypes();
    return {
      total: raw.total,
      types: raw.items.map(type => ({
        name: type.name,
        description: type.description,
        fields: type.fields.map(field => ({
          name: field.name,
          type: field.type
        }))
      }))
    };
  }
}

module.exports = {
  client: new Client()
};
