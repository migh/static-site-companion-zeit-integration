const step = {
  view: 'view',
  config: 'config',
  dashboard: 'dashboard',
  dashboardDeploy: 'dashboard:deploy',
  dashboardSitePreview: 'dashboard:sitePreview',
  dashboardContentTypes: 'dashboard:contentTypes',
  dashboardContent: 'dashboard:content',
  dashboardStats: 'dashboard:stats',
  deploy: 'deploy',
  stats: 'stats',
  preview: 'preview',
  error: 'error'
};

const dashboardMenu = `
<Box display="flex" flexDirection="column" justifyContent="center">
  <Button highlight action="${step.dashboardDeploy}">Deploy</Button>
  <Button secondary action="${step.dashboardSitePreview}">Site Preview</Button>
  <Button secondary action="${step.dashboardContentTypes}">Content Types</Button>
  <Button secondary action="${step.dashboardContent}">Content</Button>
  <Button secondary action="${step.dashboardStats}">Stats</Button>
</Box>`;

const dashboardContentMap = {
  [step.dashboard]: () => `
    <H2>Welcome to vizzz integration dashboard!</H2>
    <P>Here you can see how your Contentful site is going create a deploy or trigger a build.</P>
  `,
  [step.dashboardDeploy]: () => `
    <H2>Deploy</H2>
  `,
  [step.dashboardSitePreview]: () => `
    <H2>Site Preview</H2>
  `,
  [step.dashboardContentTypes]: ({total, types} = { total: 0, types: []}) => `
    <H2>Content Types</H2>
    <P>You currently have ${total} content types.</P>
    <P>${ types.map(type => `<B>${ type.name }</B>`).join('<BR />')}</P>
  `,
  [step.dashboardContent]: () => `
    <H2>Content</H2>
  `,
  [step.dashboardStats]: () => `
    <H2>Stats</H2>
  `
};

const uiMap = {
  [step.view]: () => `
    <Page>
      <Box display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        <H1>Welcome!</H1>
        <P>Please enter the credentials to access your Contentful data.</P>
        <Box display="flex" marginTop="10px" justifyContent="center">
          <Button action="${step.config}">Start</Button>
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
          <Button action="${step.dashboard}" highlight>Continue</Button>
        </Box>
        <Notice type="warn">Note: This are your credentials, please keep them safe!</Notice>
      </Box>
    </Page>`,
  [step.dashboard]: ({ section, ...options } = { section: step.dashboard }) => `
    <Page>
      <Box display="flex" justifyContent="space-between" textAlign="center">
        ${ dashboardMenu }
        <Box display="flex" flexDirection="column" flexGrow="1" justifyContent="top" textAlign="center">
          ${dashboardContentMap[section](options)}
        </Box>
      </Box>
    </Page>`
};

module.exports = {
  step,
  uiMap
};