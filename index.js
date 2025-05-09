const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

const app = express();
const port = process.env.PORT || 3000;

// HTML（text/html）をプレーンテキストとして受け取る
app.use(bodyParser.text({ type: 'text/html' }));

// /convert に HTML をPOSTすると、タイトルと本文をMarkdownで返す
app.post('/convert', (req, res) => {
  const html = req.body;

  const $ = cheerio.load(html);
  const turndown = new TurndownService();

  const title = $('#article-title').text().trim();
  const contentHtml = $('#article-content').html() || '';
  const contentMd = turndown.turndown(contentHtml);

  res.json({
    title,
    content: contentMd,
  });
});

// 動作確認用のトップページ
app.get('/', (req, res) => {
  res.send('Markdown converter API is running.');
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
