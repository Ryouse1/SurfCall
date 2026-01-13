const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルを公開
app.use(express.static(path.join(__dirname, 'public')));

// /fetch?url=... でプロキシDL
app.get('/fetch', async (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) return res.status(400).send("URL が必要です");

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) return res.status(404).send("ファイル取得失敗");

    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1] || 'downloaded_file';

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const buffer = await response.buffer();
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("エラー発生");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
