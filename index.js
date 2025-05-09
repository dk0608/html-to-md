const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

const app = express();
const port = process.env.PORT || 3000;

// すべてのリクエストを文字列として受け取り、最大5MBまで許容
app.use(bodyParser.text({ type: () => true, limit: '5mb' }));

app.post('/convert', (req, res) => {
  const html = req.body;

  console.log('=== RECEIVED HTML PREVIEW ===');
  if (typeof html === 'string') {
    console.log(html.slice(0, 1000));
  } else {
    console.warn('req.body is not a string. Type:', typeof html);
    return res.status(400).json({ error: 'Invalid HTML format received' });
  }

  const $ = cheerio.load(html);

  // ✅ Markdownの改行ルール対応オプションを追加
  const turndown = new TurndownService({
    br: '  \n'  // ← ここがポイント（スペース2つ＋改行）
  });

  console.log('h1.faq-article-title length:', $('h1.faq-article-title').length);
  console.log('div.article-body length:', $('div.article-body').length);

  const title = $('h1.faq-article-title').text().trim();
  const contentHtml = $('div.article-body').html() || '';
  const contentMd = turndown.turndown(contentHtml);

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
