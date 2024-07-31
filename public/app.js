const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const circle = document.getElementById('circle');
    const scoreDisplay = document.getElementById('score');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const backButton = document.getElementById('back-button');
    const app = document.getElementById('app');

    let score = 0;

    console.log('Initializing Telegram Web App');
    tg.ready();

    circle.addEventListener('click', () => {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        console.log('Circle clicked, new score:', score);
        
        const userData = {
            userId: tg.initDataUnsafe?.user?.id || 'anonymous',
            score: 1,
            username: tg.initDataUnsafe?.user?.username || null
        };
        console.log('Sending score update:', userData);
        
        // Send score to server
        fetch('/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Score update response:', data);
        })
        .catch(error => console.error('Error updating score:', error));
    });

    function updateLeaderboard() {
        console.log('Updating leaderboard');
        fetch('/api/leaderboard')
        .then(response => response.json())
        .then(leaderboard => {
            console.log('Received leaderboard data:', leaderboard);
            leaderboardBody.innerHTML = '';
            leaderboard.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.userId}</td>
                    <td>${entry.score}</td>
                    <td>${calculateRewards(entry.score)}</td>
                `;
                leaderboardBody.appendChild(row);
            });
            console.log('Leaderboard updated in DOM');
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
    }

    function calculateRewards(score) {
        // This is a placeholder function. Implement your reward logic here.
        return Math.floor(score / 100) + ' coins';
    }

    leaderboardButton.addEventListener('click', () => {
        console.log('Leaderboard button clicked');
        app.style.display = 'none';
        leaderboardPage.style.display = 'block';
        updateLeaderboard();
    });

    backButton.addEventListener('click', () => {
        console.log('Back button clicked');
        leaderboardPage.style.display = 'none';
        app.style.display = 'flex';
    });

    // Update leaderboard every 30 seconds when visible
    setInterval(() => {
        if (leaderboardPage.style.display !== 'none') {
            updateLeaderboard();
        }
    }, 30000);

    console.log('Expanding Telegram Web App');
    tg.expand();
});