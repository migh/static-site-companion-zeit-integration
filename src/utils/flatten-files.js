export function flattenFiles(files, prefix = '') {
  const results = [];
  files.children.forEach( item => {
      if (item.type === 'file') {
          results.push({
              file: prefix + '/' + item.name,
              sha: item.uid,
              size: parseInt(Math.random() * 100000) % 8000
          })
      }
      if (item.type === 'directory' || item.type === 'dir') {
          results.push(...flattenFiles(item, prefix + '/' + item.name));
      }
  });

  return results;
}

export default flattenFiles;