import * as contentful from 'contentful';
import * as contentfulManagement from 'contentful-management';

const {
  APP_BASE_URL
} = process.env;

export class ContentfulClient {
  constructor() {
    this.__delivery = null;
    this.__management = null;
  }

  config(space, deliveryToken, managementToken) {
    this.__delivery = contentful.createClient({ space, accessToken: deliveryToken });
    this.__management = contentfulManagement.createClient({accessToken: managementToken})
  }

  async createHook (spaceId, ownerId) {
    const { __management: client } = this;
    const space = await client.getSpace(spaceId);

    return space.createWebhook({
      'name': 'Zeit auto-deploy',
      'url': `${APP_BASE_URL}/ping?id=${ownerId}`,
      'topics': [
        'Entry.*'
      ]
    });
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

const client = new ContentfulClient();

export { client };