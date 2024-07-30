const tg = window.Telegram.WebApp;

const circle = document.getElementById('circle');
const scoreDisplay = document.getElementById('score');
const leaderboardList = document.getElementById('leaderboard-list');

let score = 0;

tg.ready();

circle.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    
    // Send score to server
    fetch('/api/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: tg.initDataUnsafe?.user?.id || 'anonymous', score: 1 }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score updated:', data.totalScore);
    })
    .catch(error => console.error('Error:', error));
});

function updateLeaderboard() {
    fetch('/api/leaderboard')
    .then(response => response.json())
    .then(leaderboard => {
        leaderboardList.innerHTML = '';
        leaderboard.forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. User ${entry.userId}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    })
    .catch(error => console.error('Error:', error));
}

// Update leaderboard every 5 seconds
setInterval(updateLeaderboard, 5000);

// Initial leaderboard update
updateLeaderboard();

// Expand the Telegram Web App to full height
tg.expand();