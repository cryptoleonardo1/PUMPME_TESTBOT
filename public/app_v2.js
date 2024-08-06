const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    const pumpImage = document.getElementById('pump-image');
    const scoreDisplay = document.getElementById('score-display');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const backButton = document.getElementById('back-button');
    const app = document.getElementById('app');

    let reps = 0;
    let currentSize = 390;
    const maxSize = 500; // Maximum size of the bull image
    const growthRate = 5; // Pixels to grow per tap

    tg.ready();

    pumpImage.addEventListener('click', () => {
        reps++;
        scoreDisplay.textContent = `Clean Reps: ${reps}`;
        
        // Grow the image
        currentSize = Math.min(currentSize + growthRate, maxSize);
        pumpImage.style.width = `${currentSize}px`;
        pumpImage.style.height = `${currentSize}px`;

        // Animate the growth
        pumpImage.style.transform = 'scale(1.1)';
        setTimeout(() => {
            pumpImage.style.transform = 'scale(1)';
        }, 100);
        
        // Send score to server
        fetch('/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: tg.initDataUnsafe?.user?.id || 'anonymous', score: 1, username: tg.initDataUnsafe?.user?.username || 'Anonymous Hero' }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Clean Reps updated:', data.totalScore);
        })
        .catch(error => console.error('Error:', error));
    });

    leaderboardButton.addEventListener('click', () => {
        leaderboardPage.style.display = 'block';
        updateLeaderboard();
    });

    backButton.addEventListener('click', () => {
        leaderboardPage.style.display = 'none';
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

    // Update leaderboard every 30 seconds
    setInterval(updateLeaderboard, 30000);

    // Expand the Telegram Web App to full height
    tg.expand();
});