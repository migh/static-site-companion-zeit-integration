const step = {
  view: 'view',
  config: 'config',
  deploy: 'deploy',
  stats: 'stats',
  preview: 'preview',
  error: 'error'
};

const uiMap = {
  [step.view]: () => `
    <Page>
      <Box display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        <H1>Welcome!</H1>
        <P>Please enter the credentials to access your Contentful data.</P>
        <Box display="flex" marginTop="10px" justifyContent="center">
          <Button action="config">Start</Button>
        </Box>
      </Box>
    </Page>`,
  [step.config]: () => `
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
  [step.deploy]: () => `
    <Page>
      <Box display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        <H2>Want to deploy your site?</H2>
        <Box display="flex" marginTop="10px" justifyContent="center">
          <Button>Yes</Button>
        </Box>
      </Box>
    </Page>`
};

module.exports = {
  step,
  uiMap
};