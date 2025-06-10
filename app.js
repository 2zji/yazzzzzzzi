const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// public 폴더를 정적 파일 경로로 설정
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로로 접속하면 index.html 보여주기
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중`);
});
