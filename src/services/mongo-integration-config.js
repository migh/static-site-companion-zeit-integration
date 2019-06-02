import mongodb from 'mongodb';

const { MONGO_URI } = process.env;

/**
 * Allows to retrieve a MongoDB collection object to query and upsert
 * new configuration objects.
 */
export async function getConfigsCollection() {
  const client = await mongodb.connect(MONGO_URI, { useNewUrlParser: true });
  const db = await client.db('slack-integration');
  return db.collection('integration-configs');
}

/**
 * Gets an integration configuration object for the given ownerId
 * that includes both ZEIT and Slack tokens along with the configured
 * webhooks.
 */
export async function getIntegrationConfig(ownerId) {
  const collection = await getConfigsCollection();
  const config = await collection.findOne({ ownerId });
  if (!config) {
    console.warn(`No config found for owner ${ownerId}`);
    return null;
  }

  return config;
}

/**
 * Saves a given integration configuration in the database. Later this
 * can be retrieved by ownerId to check for webhooks and to update.
 */
export async function mongoIntegrationConfig(config) {
  const collection = await getConfigsCollection();
  await collection.updateOne(
    { ownerId: config.ownerId },
    { $set: config },
    { upsert: true }
  );
  return config;
}

