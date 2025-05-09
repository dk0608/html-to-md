const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

const app = express();
const port = process.env.PORT || 3000;

// text/html のみを明示的に許可
app.use(bodyParser.text({ type: 'text/html' }));

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
  const turndown = new TurndownService();

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
