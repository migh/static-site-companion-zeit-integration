const { withUiHook } = require('@zeit/integration-utils');
const contentful = require("contentful");

const uiMap = {
  view: () => `
    <Page>
      <Box display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        <H1>Welcome!</H1>
        <P>Please enter the credentials to access your Contentful data.</P>
        <Box display="flex" marginTop="10px" justifyContent="center">
          <Button action="config">Start</Button>
        </Box>
      </Box>
    </Page>`,
  config: () => `
    <Page>
      <Box display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        <H2>Contentful access credentials</H2>
        <Input name="accessToken" label="Access Token" value="" />
        <Input name="space" label="Space" value="" />
        <Box display="flex" marginTop="10px" justifyContent="center">
          <Button action="deploy">Save</Button>
        </Box>
        <Notice type="warn">Note: This are your credentials, please keep them safe!</Notice>
      </Box>
    </Page>`,
  deploy: () => `
    <Page>
      <Box display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        <H2>Want to deploy your site?</H2>
        <Box display="flex" marginTop="10px" justifyContent="center">
          <Button>Yes</Button>
        </Box>
      </Box>
    </Page>`
};

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  // Get metadata
  const metadata = await zeitClient.getMetadata();
  const { apiKey, spaceId, isNotFirstTime } = metadata;

  // const projects = await zeitClient.fetch('/v1/projects/list', {});

  let action = payload.action;

  if (action === 'view' && isNotFirstTime) {
    action = 'config';
  }

  if (action === 'config') {
    try {
      await zeitClient.setMetadata({
        ...metadata,
        isNotFirstTime: true
      })
    } catch(e) {
      console.error(e);
    }
  }

  if (action === 'deploy') {
    const { accessToken, space } = payload.clientState;
    const client = contentful.createClient({ space, accessToken });
    const test = await client.getContentTypes();
    console.log(test);
  }

  return uiMap[action || 'view']();
});
