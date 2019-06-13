const { withUiHook } = require('@zeit/integration-utils');

const { client } = require('../services/contentful');
const { ENDPOINTS } = require('../services/zeit');
const { step, uiMap } = require('./uihook.constants');
const flattenFiles = require('../utils/flatten-files').default;

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  console.log(payload);
  // Get metadata
  const metadata = await zeitClient.getMetadata();
  const { deliveryToken, space, managementToken, isFirstTime } = metadata;

  const credentialsComplete = deliveryToken && space && managementToken;
  
  if (credentialsComplete) {
    client.config(space, deliveryToken, managementToken);

    const ownerId = payload.teamId || payload.user.id;

    try {
      // const hook = await client.createHook(space, ownerId);
      console.log(`Webhook for set for ownerId: ${ownerId}`);
    } catch(err) {
      console.error(err);
    }
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
    // const { project } = payload;

    const { deployments } = await (await zeitClient.fetch(ENDPOINTS.deployment.list, {})).json();
    // todo: Is the first in list the last or have to be sorted by deployment.created?
    const lastDeployment = deployments.filter(deployment => deployment.name === 'zeit-contentful-blog')[0];
    const files = await (await zeitClient.fetch(ENDPOINTS.deployment.files.replace(':id', lastDeployment.uid), {})).json();
    const [ srcFiles, outFiles ] = files;
    const buildFiles = flattenFiles(srcFiles);
    console.log(buildFiles);
    // const newDeployment = await zeitClient.fetch(ENDPOINTS.deployment.new, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     name: 'zeit-contentful-blog',
    //     version: 2,
    //     files: buildFiles
    //   })
    // });

    // console.log(await newDeployment.json());

    // modify envvar deliveryToken & spaceId
    return uiMap[step.dashboard]({ section: step.dashboardDeploy, deployed: true });
  }

  return uiMap[action || step.view]();
});
