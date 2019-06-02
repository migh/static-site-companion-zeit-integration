const express = require('express');
const puppeteer = require('puppeteer');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);

const app = express();

const template = content => `
<html lang="en">
  <head>
    <title>TEST</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"> 
  </head>
  <body>
  <img src="${content}" />
  </body>
</html>
`;

app.use('/url-screenshot', async (req, res) => {
    const { url } = req.query;
    const name = `${Date.now()}`;
    const path = `${__dirname}/tmp-screenshots/${name}`;
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await Promise.all(
      [
          page.goto(url),
          page.waitForNavigation({ waitUntil: 'domcontentloaded' })
      ]
    );
    await page.screenshot({
        path,
        type: 'png',
        omitBackground: true,
        encoding: 'base64'
    });
    const base64Img = await readFile(path);
    const src = `data:image/svg+xml;base64,${base64Img}`;

    await unlink(path);

    res.set('Content-Type', 'text/html');
    res.send(template(src));
});

app.listen(3000, () => {
    console.log('Listening @ port 3000');
});
