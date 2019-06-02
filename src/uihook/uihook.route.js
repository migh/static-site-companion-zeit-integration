const { withUiHook } = require('@zeit/integration-utils');

const { getIntegrationConfig } = require('../services/mongo-integration-config');
const { client } = require('../services/contentful');
const { step, uiMap } = require("./uihook.constants");

const {
  ZEIT_CLIENT_ID
} = process.env;

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  const config = await getIntegrationConfig(payload.user.id);
  let action = payload.action;

  if (!config) {
    action = step.init;
  }

  if (action === step.init) {
    const url = `https://zeit.co/oauth/authorize?client_id=${ZEIT_CLIENT_ID}`;
    return uiMap[action](url);
  }

  // Get metadata
  const metadata = await zeitClient.getMetadata();
  const { deliveryToken, space, managementToken, isFirstTime = true, contentful = [], hasHook } = metadata;

  const credentialsComplete = deliveryToken && space && managementToken;

  if (credentialsComplete) {
    client.config(space, deliveryToken, managementToken);
  }

  if (!hasHook && credentialsComplete) {
    try {
      await client.createHook(space, payload);
      await zeitClient.setMetadata({
        ...metadata,
        hasHook: true
      });
    } catch (e) {
      console.error(e);
      await zeitClient.setMetadata({
        ...metadata,
        hasHook: false
      });
    }
  }


  if (action === step.view && !isFirstTime) {
    action = step.config;
  }

  if (action === step.config ) {
    try {
      await zeitClient.setMetadata({
        ...metadata,
        isFirstTime: false
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
      const { deliveryToken, space, managementToken } = payload.clientState;

      try {
        await zeitClient.setMetadata({
          ...metadata,
          deliveryToken,
          space,
          managementToken
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
    let templatePayload = { section: action };

    if (action === step.dashboardDeploy) {
      const { project } = payload;
      templatePayload = {
        ...templatePayload,
        project
      };
    }

    if(action === step.dashboardContent) {
      const { project } = payload;
      templatePayload = {
        ...templatePayload,
        project
      };
    }

    if (action === step.dashboardContentTypes) {
      const contentTypes = await client.getContentTypes();
      templatePayload = {
        ...templatePayload,
        ...contentTypes
      };
    }

    if(action === step.dashboardStats) {
      templatePayload = {
        ...templatePayload,
        data: contentful
      };
    }

    return uiMap[step.dashboard](templatePayload);
  }

  if (action === step.deploy) {
    console.log('Deploying...');

    // const metadata = await zeitClient.getMetadata();
    // modify envvar deliveryToken & spaceId
    return uiMap[step.dashboard]({ section: step.dashboardDeploy, deployed: true });
  }

  return uiMap[action || step.view]();
});
