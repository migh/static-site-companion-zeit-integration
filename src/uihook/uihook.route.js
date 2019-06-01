const { withUiHook } = require('@zeit/integration-utils');

const { client } = require('../services/contentful');
const { step, uiMap } = require("./uihook.constants");

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  // Get metadata
  const metadata = await zeitClient.getMetadata();
  const { accessToken, space, isNotFirstTime } = metadata;

  const credentialsComplete = accessToken && space;
  
  let action = payload.action;

  if (action === step.view && isNotFirstTime) {
    action = step.config;
  }

  if (action === step.config ) {
    try {
      await zeitClient.setMetadata({
        ...metadata,
        isNotFirstTime: true
      });

      if (credentialsComplete) {
        action = step.dashboard;
      }
    } catch(e) {
      console.error(e);
    }
  }

  if (action === step.dashboard) {
    if (!credentialsComplete) {
      const { accessToken, space } = payload.clientState;

      try {
        await zeitClient.setMetadata({
          ...metadata,
          accessToken,
          space
        });
      } catch(e) {
        console.error(e);
      }
    }

    client.config(space, accessToken);
    const test = await client.getContentTypes();
    console.log(test);
  }

  return uiMap[action || step.view]();
});
