const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('character');
    const scoreDisplay = document.getElementById('score-display');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const backButton = document.getElementById('back-button');
    const app = document.getElementById('app');
    
    const muscleMassMeter = document.querySelector('.muscle-mass .meter-fill');
    const pumpMeter = document.querySelector('.pump .meter-fill');
    const energyBar = document.querySelector('.energy-fill');

    let reps = 0;
    let currentSize = 300;
    const maxSize = 400;
    const growthRate = 5;

    tg.ready();

    character.addEventListener('click', () => {
        reps++;
        scoreDisplay.textContent = `Clean Reps: ${reps}`;
        
        // Grow the image
        currentSize = Math.min(currentSize + growthRate, maxSize);
        character.style.width = `${currentSize}px`;
        character.style.height = `${currentSize}px`;

        // Animate the growth
        character.style.transform = 'scale(1.1)';
        setTimeout(() => {
            character.style.transform = 'scale(1)';
        }, 100);
        
        // Change image on tap
        character.src = '/images/bull_lifting.png';
        setTimeout(() => {
            character.src = '/images/bull_default.png';
        }, 200);

        updateMeters();
        
        // Send score to server
        fetch('/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                userId: tg.initDataUnsafe?.user?.id || 'anonymous', 
                score: 1, 
                username: tg.initDataUnsafe?.user?.username || 'Anonymous Hero' 
            }),
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

    function updateMeters() {
        const pumpValue = Math.min(100, reps);
        pumpMeter.style.height = `${pumpValue}%`;
        pumpMeter.nextElementSibling.textContent = `${pumpValue}/100`;
        
        const muscleMassValue = 15240 + reps * 10;
        muscleMassMeter.style.height = `${Math.min(100, (muscleMassValue - 15240) / 100)}%`;
        muscleMassMeter.nextElementSibling.textContent = muscleMassValue;
        
        const energyValue = Math.max(0, 65 - reps / 2);
        energyBar.style.width = `${energyValue}%`;
        energyBar.nextElementSibling.textContent = `${Math.round(energyValue)}%`;
    }

    // Update leaderboard every 30 seconds
    setInterval(updateLeaderboard, 30000);

    // Expand the Telegram Web App to full height
    tg.expand();
});