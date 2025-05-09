app.post('/convert', (req, res) => {
  let html = req.body;

  // 修正：バックスラッシュ入りならJSON文字列として処理
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
