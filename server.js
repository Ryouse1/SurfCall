const express = require('express');
const fetch = require('node-fetch');
const archiver = require('archiver');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイル公開
app.use(express.static(path.join(__dirname, 'public')));

// 単一ファイルDL
app.get('/fetch', async (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) return res.status(400).send("URLが必要です");

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) return res.status(404).send("ファイル取得失敗");

    const fileName = fileUrl.split('/').pop() || 'downloaded_file';
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const buffer = await response.buffer();
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("エラー発生");
  }
});

// 複数ファイルDL（ZIP化）
app.get('/fetch-multiple', async (req, res) => {
  const urls = req.query.urls;
  if (!urls) return res.status(400).send("urls パラメータが必要です");

  const urlList = urls.split(',');
  res.setHeader('Content-Disposition', `attachment; filename="files.zip"`);
  res.setHeader('Content-Type', 'application/zip');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);

  for (const fileUrl of urlList) {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) continue;
      const buffer = await response.buffer();
      const fileName = fileUrl.split('/').pop() || 'file';
      archive.append(buffer, { name: fileName });
    } catch (err) {
      console.error(`Error fetching ${fileUrl}:`, err);
    }
  }

  archive.finalize();
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
