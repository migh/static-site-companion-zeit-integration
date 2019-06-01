const contentful = require("contentful");

class Client {
  constructor() {
    this.__client = null;
  }

  config(space, accessToken) {
    this.__client = contentful.createClient({ space, accessToken });
  }

  async getContentTypes() {
    if (!this.__client) {
      throw new Error('You need to config Contentful client first. Use `client.config(space, accessToken)`')
    }

    const raw = await this.__client.getContentTypes();
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