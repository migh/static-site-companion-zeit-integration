const step = {
  view: 'view',
  config: 'config',
  dashboard: 'dashboard',
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
          <Button action="dashboard" highlight>Continue</Button>
        </Box>
        <Notice type="warn">Note: This are your credentials, please keep them safe!</Notice>
      </Box>
    </Page>`,
  [step.dashboard]: () => `
    <Page>
      <Box display="flex" justifyContent="space-between" textAlign="center">
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Button highlight>Deploy</Button>
          <Button secondary>Site Preview</Button>
          <Button secondary>Content Types</Button>
          <Button secondary>Content</Button>
          <Button secondary>Stats</Button>
        </Box>
        <Box display="flex" justifyContent="center">
          <H2>Some content here!</H2>
        </Box>
      </Box>
    </Page>`
};

module.exports = {
  step,
  uiMap
};