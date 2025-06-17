const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 주사위 굴리기 API
app.post('/api/roll', (req, res) => {
    const savedIndexes = req.body.saved || [];
    let currentDice = req.body.dice || [1, 1, 1, 1, 1];

    const newDice = currentDice.map((value, index) => {
        if (savedIndexes.includes(index)) {
            return value; // 저장된 주사위는 그대로 유지
        }
        return Math.floor(Math.random() * 6) + 1; // 1~6 랜덤
    });

    res.json({ dice: newDice });
});

// 점수 저장 API
app.post('/api/score', (req, res) => {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
        return res.status(400).json({ message: '이름과 점수는 필수입니다.' });
    }

    fs.readFile('score.json', 'utf8', (err, data) => {
        let scores = [];
        if (!err && data) {
            try {
                scores = JSON.parse(data);
            } catch (e) {
                scores = [];
            }
        }

        scores.push({ name, score });

        fs.writeFile('score.json', JSON.stringify(scores, null, 2), err => {
            if (err) {
                return res.status(500).json({ message: '점수 저장 실패' });
            }
            res.json({ message: '점수 저장 완료', scores });
        });
    });
});

// 점수 목록 가져오기
app.get('/api/score', (req, res) => {
    fs.readFile('score.json', 'utf8', (err, data) => {
        if (err || !data) {
            return res.json([]);
        }

        try {
            const scores = JSON.parse(data);
            res.json(scores);
        } catch {
            res.json([]);
        }
    });
});

// 점수 랭킹 가져오기 (내림차순 정렬)
app.get('/api/ranking', (req, res) => {
    fs.readFile('score.json', 'utf8', (err, data) => {
        if (err || !data) {
            return res.json([]);
        }

        try {
            const scores = JSON.parse(data);
            const ranked = scores
                .sort((a, b) => b.score - a.score) // 점수 내림차순 정렬
                .slice(0, 10); // 상위 10명만 반환
            res.json(ranked);
        } catch {
            res.json([]);
        }
    });
});


app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
