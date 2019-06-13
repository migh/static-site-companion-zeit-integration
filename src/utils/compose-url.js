export function composeUrl(rootUrl, endpoint, options = {}) {
  return `${rootUrl}${endpoint}`;
};

export default composeUrl;
