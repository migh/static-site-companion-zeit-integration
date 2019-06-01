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
  }

  // I am sure there is a better way to do this.
  const dashboardSections = [
    step.dashboardDeploy,
    step.dashboardSitePreview,
    step.dashboardContentTypes,
    step.dashboardContent,
    step.dashboardStats
  ];
  if (dashboardSections.includes(action)) {
    let payload = { section: action };

    if (action === step.dashboardContentTypes) {
      client.config(space, accessToken);
      const contentTypes = await client.getContentTypes();
      payload = {
        ...payload,
        ...contentTypes
      };
    }
    
    return uiMap[step.dashboard](payload);
  }

  return uiMap[action || step.view]();
});
