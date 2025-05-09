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
  const turndown = new TurndownService({
    br: '  \n'  // Markdown改行対応
  });

  console.log('h1.faq-article-title length:', $('h1.faq-article-title').length);
  console.log('div.article-body length:', $('div.article-body').length);

  const title = $('h1.faq-article-title').text().trim();
  const contentHtml = $('div.article-body').html() || '';
  let contentMd = turndown.turndown(contentHtml);

  // Markdown整形処理
  contentMd = contentMd
    .replace(/\\n/g, '\n') // \n → 改行
    .replace(/\\\[/g, '[').replace(/\\\]/g, ']') // バックスラッシュ除去
    .replace(/(#+ .+)\n(?!\n)/g, '$1\n\n') // 見出し後に空行
    .replace(/([^\n])\n([^\n])/g, '$1  \n$2') // 通常行を段落風に
    .replace(/^\* /gm, '- ') // リスト記号を整形
    .replace(/\n{3,}/g, '\n\n'); // 改行の連続を整理

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
