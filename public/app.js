const tg = window.Telegram.WebApp;

const circle = document.getElementById('circle');
const scoreDisplay = document.getElementById('score');
const leaderboardList = document.getElementById('leaderboard-list');

let score = 0;

tg.ready();

circle.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    
    // Send score to server with Telegram data
    fetch('/api/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...tg.initData,
            score: 1
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score updated:', data.totalScore);
    })
    .catch(error => console.error('Error:', error));
});

// ... rest of your app.js code ...

tg.expand();