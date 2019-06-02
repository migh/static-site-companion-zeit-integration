const contentful = require("contentful");
const contentfulMgmt = require('contentful-management')

class Client {
  constructor() {
    this.__delivery = null;
    this.__management = null;
  }

  config(space, deliveryToken, managementToken) {
    this.__delivery = contentful.createClient({ space, accessToken: deliveryToken });
    this.__management = contentfulMgmt.createClient({accessToken: managementToken})
  }

  async createHook (spaceId, zeitConfigId) {
    client.getSpace(spaceId)
    .then((space) => space.createWebhook({
      'name': 'My webhook',
      'url': `https://contentful-integration.now.sh/webhook?configId=${zeitConfigId}`,
      'topics': [
        '*.publish'
      ]
    }))
    .then((webhook) => console.log(webhook))
    .catch(console.error)
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