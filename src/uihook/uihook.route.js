const { withUiHook } = require('@zeit/integration-utils');
const contentful = require("contentful");

const { step, uiMap } = require("./uihook.constants");

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  // Get metadata
  const metadata = await zeitClient.getMetadata();
  const { accessToken, space, isNotFirstTime } = metadata;

  // const projects = await zeitClient.fetch('/v1/projects/list', {});
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
        action = step.deploy;
      }
    } catch(e) {
      console.error(e);
    }
  }

  if (action === step.deploy) {
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

    const client = contentful.createClient({ space, accessToken });
    const test = await client.getContentTypes();
    console.log(test);
  }

  return uiMap[action || step.view]();
});
