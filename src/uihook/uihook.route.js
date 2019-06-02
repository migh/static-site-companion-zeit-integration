const { withUiHook } = require('@zeit/integration-utils');

const { client } = require('../services/contentful');
const { step, uiMap } = require("./uihook.constants");

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  // Get metadata
  const metadata = await zeitClient.getMetadata();
  const { deliveryToken, space, managementToken, isFirstTime } = metadata;

  const credentialsComplete = deliveryToken && space && managementToken;
  
  if (credentialsComplete) {
    client.config(space, deliveryToken, managementToken);
  }

  if(isFirstTime) {
    const hook = await client.createHook(space, payload.configurationId);
  }

  
  let action = payload.action;

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
      console.log(deliveryToken, space, managementToken);

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
    
    if (action === step.dashboardContentTypes) {
      const contentTypes = await client.getContentTypes();
      templatePayload = {
        ...templatePayload,
        ...contentTypes
      };
    }

    if(action === step.dashboardStats) {
      const data = [{
        publishedAt,
        publishedVersion,
        updatedBy,
      }];
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
