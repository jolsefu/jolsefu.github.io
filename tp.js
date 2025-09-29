const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 1121;

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
  filename: (req, file, cb) => cb(null, 'picture' + path.extname(file.originalname)),
});

const uploads = multer({ storage: storage });

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.post('/upload', uploads.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded. :(');
  res.send(`File uploaded successfully! :)\nFilename: ${req.file.filename}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
