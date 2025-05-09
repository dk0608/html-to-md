const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.text({ type: 'text/html' }));

app.post('/convert', (req, res) => {
  const html = req.body;

  // デバッグログ：受信したHTMLの一部
  console.log('=== RECEIVED HTML PREVIEW ===');
  console.log(html.slice(0, 1000));

  const $ = cheerio.load(html);
  const turndown = new TurndownService();

  // デバッグログ：セレクタマッチ状況
  console.log('h1.faq-article-title length:', $('h1.faq-article-title').length);
  console.log('div.article-body length:', $('div.article-body').length);

  // タイトルと本文抽出
  const title = $('h1.faq-article-title').text().trim();
  const contentHtml = $('div.article-body').html() || '';
  const contentMd = turndown.turndown(contentHtml);

  // 結果返却
  res.json({
    title,
    content: contentMd,
  });
});

app.get('/', (req, res) => {
  res.send('Markdown converter API is running.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
