let diceValues = [1, 1, 1, 1, 1];
const diceUnicode = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

let turn = 0;       // 턴 시작 전 0으로 초기화
const maxTurn = 13;


function rollDice() {
  if (turn >= maxTurn) {
    alert("게임이 이미 종료되었습니다!");
    return;
  }

  turn++;  // 주사위 굴릴 때 턴 1 증가
  for (let i = 0; i < 5; i++) {
    diceValues[i] = Math.floor(Math.random() * 6) + 1;
  }
  updateDiceDisplay();

  if (turn > maxTurn) {
    endGame();
  } else {
    document.getElementById("turnDisplay").textContent = `턴: ${turn} / ${maxTurn}`;
  }
}


function updateDiceDisplay() {
    const diceEls = document.querySelectorAll('.dice');
    for (let i = 0; i < 5; i++) {
        diceEls[i].textContent = diceUnicode[diceValues[i] - 1];
    }
}

function calculateScore() {
    const counts = {};
    for (let num of diceValues) {
        counts[num] = (counts[num] || 0) + 1;
    }

    let score = 0;
    let categoryScore = 0; // Aces~Sixes 점수 총합

    // 야추 (같은 눈 5개)
    if (Object.values(counts).includes(5)) {
        score = 50;
    }
    // 4개 같은 눈
    else if (Object.values(counts).includes(4)) {
        score = 10;
    }
    // 3개 같은 눈
    else if (Object.values(counts).includes(3)) {
        score = 5;
    }

    // 추가: 각 숫자별 개수 * 눈 값을 합산 (Aces ~ Sixes)
    for (let num = 1; num <= 6; num++) {
        if (counts[num]) {
            categoryScore += num * counts[num];
        }
    }

    document.getElementById("score").textContent =
        `점수: ${score}점 (총합: ${categoryScore}점)`;
}


function resetGame() {
    diceValues = [1, 1, 1, 1, 1];
    updateDiceDisplay();
    document.getElementById("score").textContent = "점수: 0";
}


// 전역으로 점수 저장용 객체
const scores = {
    aces: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
};

function calculateUpperScore(category) {
    // category에 맞는 숫자를 추출해 점수 계산
    const targetNum = {
        aces: 1,
        twos: 2,
        threes: 3,
        fours: 4,
        fives: 5,
        sixes: 6,
    }[category];

    let sum = 0;
    for (let val of diceValues) {
        if (val === targetNum) sum += val;
    }
    return sum;
}

function recordScore(category) {
  if (scores[category] !== null) {
    alert("이미 점수를 기록했습니다!");
    return;
  }
  const score = calculateUpperScore(category);
  scores[category] = score;
  document.getElementById(`score-${category}`).textContent = score;

  const btn = document.querySelector(`button[onclick="recordScore('${category}')"]`);
  if (btn) btn.remove();

  // 턴 변화는 rollDice에서 처리하므로 여기서는 없음
}

function endGame() {
  // 총 점수 계산
  let totalScore = 0;
  for (let key in scores) {
    if (scores[key]) totalScore += scores[key];
  }

  // 알림창 띄우기
  alert(`게임 끝! 총 점수는 ${totalScore}점 입니다.`);

  // UI에 결과 메시지 영역이 있다면 그곳에 결과 출력 가능
  const resultEl = document.getElementById("resultMessage");
  if (resultEl) {
    resultEl.textContent = `게임 끝! 총 점수는 ${totalScore}점 입니다.`;
  }

  // 게임 초기화나 재시작 버튼 활성화 등 추가 가능
}




// 시작 시 주사위 표시
updateDiceDisplay();
