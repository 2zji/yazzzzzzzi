let dice = [1, 1, 1, 1, 1];
let saved = [];
let rerollCount = 0;
let turn = 0;
let totalScore = 0;
let recorded = {}; // 항목별 점수 기록 여부

const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const diceContainer = document.getElementById('dice-container');
const scoreDisplay = document.getElementById('score');
const turnDisplay = document.getElementById('turnDisplay');
const resultMessage = document.getElementById('resultMessage');

function updateDiceDisplay() {
  diceContainer.innerHTML = '';
  dice.forEach((num, idx) => {
    // num 값이 1~6 범위 내인지 확인하고 아니면 기본값 1로 설정
    if (typeof num !== 'number' || num < 1 || num > 6) {
      console.warn(`잘못된 주사위 값: ${num} (인덱스 ${idx})`);
      num = 1;
    }

    const span = document.createElement('span');
    span.textContent = diceSymbols[num - 1];  // 숫자 1~6을 ⚀~⚅로 변환
    span.className = 'dice';
    span.dataset.index = idx;
    if (saved.includes(idx)) {
      span.style.backgroundColor = 'lightgreen';
    } else {
      span.style.backgroundColor = '';
    }
    span.addEventListener('click', () => toggleSave(idx));
    diceContainer.appendChild(span);
  });
}

async function rollDice() {
  if (rerollCount >= 5) {
    alert('5번까지만 다시 굴릴 수 있어요. 점수를 선택해주세요.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/roll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saved }),
    });

    if (!res.ok) {
      throw new Error(`서버 오류: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('서버에서 받은 주사위:', data.dice);

    // 데이터 정상 검사
    if (!Array.isArray(data.dice) || data.dice.some(n => typeof n !== 'number')) {
      throw new Error('서버에서 받은 주사위 데이터가 올바르지 않습니다.');
    }

    dice = data.dice;
    rerollCount++;
    updateDiceDisplay();
  } catch (error) {
    console.error('주사위 굴리기 중 오류:', error);
    alert('주사위 굴리기 중 오류가 발생했습니다. 콘솔을 확인하세요.');
  }
}


function toggleSave(index) {
  if (saved.includes(index)) {
    saved = saved.filter(i => i !== index);
  } else {
    saved.push(index);
  }
  updateDiceDisplay();
}

async function rollDice() {
  if (rerollCount >= 5) {
    alert('5번까지만 다시 굴릴 수 있어요. 점수를 선택해주세요.');
    return;
  }

  const res = await fetch('http://localhost:3000/api/roll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saved }),
  });

  const data = await res.json();
  dice = data.dice;
  rerollCount++;
  updateDiceDisplay();
}

function calculateScore() {
  const counts = Array(7).fill(0);
  dice.forEach(d => counts[d]++);

  setScore('aces', counts[1] * 1);
  setScore('twos', counts[2] * 2);
  setScore('threes', counts[3] * 3);
  setScore('fours', counts[4] * 4);
  setScore('fives', counts[5] * 5);
  setScore('sixes', counts[6] * 6);

  // Yahtzee
  const yahtzeeScore = counts.includes(5) ? 50 : 0;
  setScore('yahtzee', yahtzeeScore);
}

function setScore(type, value) {
  const td = document.getElementById(`score-${type}`);
  if (recorded[type]) return;
  td.textContent = value;
}

function recordScore(type) {
  const td = document.getElementById(`score-${type}`);
  if (recorded[type]) {
    alert('이미 기록된 항목입니다.');
    return;
  }

  const value = parseInt(td.textContent) || 0;
  recorded[type] = true;
  totalScore += value;
  scoreDisplay.textContent = `점수: ${totalScore}`;
  rerollCount = 0;
  saved = [];
  turn++;
  turnDisplay.textContent = `턴: ${turn} / 13`;

  if (turn >= 13) {
    resultMessage.textContent = `🎉 게임 종료! 총점: ${totalScore}점`;
  } else {
    dice = [1, 1, 1, 1, 1];
    saved = [];
    updateDiceDisplay();
    calculateScore(); // 다음 라운드 예상 점수
  }
}

function submitScore() {
  const nameInput = document.getElementById('playerName');
  const name = nameInput.value.trim();

  if (!name) {
    alert('이름을 입력하세요!');
    return;
  }

  if (turn < 13) {
    alert('게임이 끝난 후에 점수를 저장할 수 있어요!');
    return;
  }

  saveScore(name, totalScore);
}


function resetGame() {
  if (!confirm('정말로 다시 시작할까요? 진행 중인 게임은 사라져요.')) return;

  dice = [1, 1, 1, 1, 1];
  saved = [];
  rerollCount = 0;
  turn = 0;
  totalScore = 0;
  recorded = {};
  resultMessage.textContent = '';
  scoreDisplay.textContent = '점수: 0';
  turnDisplay.textContent = '턴: 0 / 13';

  const cells = document.querySelectorAll('[id^=score-]');
  cells.forEach(td => (td.textContent = '0'));

  updateDiceDisplay();
}

function saveScore(name, totalScore) {
  fetch('http://localhost:3000/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score: totalScore }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ 점수 저장 완료:', data);
    alert(`${name}님의 점수가 저장되었습니다!`);
  })
  .catch(error => {
    console.error('❌ 점수 저장 실패:', error);
    alert('점수 저장 중 오류가 발생했습니다.');
  });
}

function loadRanking() {
  fetch('http://localhost:3000/api/ranking')
    .then(res => res.json())
    .then(ranking => {
      console.log('🏆 점수 랭킹:', ranking);
      displayRanking(ranking); // 화면에 표시하는 함수 호출
    })
    .catch(err => {
      console.error('❌ 랭킹 불러오기 실패:', err);
    });
}

function displayRanking(ranking) {
  const rankingContainer = document.getElementById('ranking-list');
  rankingContainer.innerHTML = '<h3>🏆 랭킹</h3><ol>' +
    ranking.map(entry => `<li>${entry.name}: ${entry.score}점</li>`).join('') +
    '</ol>';
}

updateDiceDisplay();