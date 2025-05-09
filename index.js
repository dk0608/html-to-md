const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.text({ type: 'text/html' }));

app.post('/convert', (req, res) => {
  let html = req.body;

  // バックスラッシュ入りのエスケープ文字列ならJSON.parseでアンエスケープ
  if (typeof html === 'string' && html.includes('\\"')) {
    try {
      html = JSON.parse(`"${html}"`);
    } catch (e) {
      console.warn("HTML parse failed, using raw body");
    }
  }

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

app.get('/', (req, res) => {
  res.send('Markdown converter API is running.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
