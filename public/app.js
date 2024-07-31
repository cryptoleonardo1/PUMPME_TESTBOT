const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    const circle = document.getElementById('circle');
    const scoreDisplay = document.getElementById('score');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const backButton = document.getElementById('back-button');
    const app = document.getElementById('app');

    let score = 0;

    tg.ready();

    circle.addEventListener('click', () => {
        score++;
        scoreDisplay.textContent = `Reps: ${score}`;
        
        // Send score to server
        fetch('/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: tg.initDataUnsafe?.user?.id || 'anonymous', score: 1, username: tg.initDataUnsafe?.user?.username || 'Anonymous' }),
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
            leaderboardBody.innerHTML = '';
            leaderboard.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.userId}</td>
                    <td>${entry.score}</td>
                    <td>${entry.pumping}</td>
                `;
                leaderboardBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
    }

    leaderboardButton.addEventListener('click', () => {
        app.style.display = 'none';
        leaderboardPage.style.display = 'block';
        updateLeaderboard();
    });

    backButton.addEventListener('click', () => {
        leaderboardPage.style.display = 'none';
        app.style.display = 'flex';
    });

    // Update leaderboard every 30 seconds
    setInterval(updateLeaderboard, 30000);

    // Expand the Telegram Web App to full height
    tg.expand();
});