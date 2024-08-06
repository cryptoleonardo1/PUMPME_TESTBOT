const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    const characterClickableArea = document.getElementById('character-clickable-area');
    const character = document.getElementById('character');
    const scoreDisplay = document.getElementById('score-display');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const backButton = document.getElementById('back-button');
    
    const muscleMassMeter = document.querySelector('.muscle-mass .meter-fill');
    const muscleMassValue = document.querySelector('.muscle-mass .meter-value');
    const pumpMeter = document.querySelector('.pump .meter-fill');
    const pumpValue = document.querySelector('.pump .meter-value');
    const energyBar = document.querySelector('.energy-fill');

    let reps = 0;
    let muscleMass = 15240;
    let pump = 0;
    let energy = 100;

    tg.ready();

    function updateUI() {
        scoreDisplay.textContent = `Clean Reps: ${reps}`;
        
        muscleMassMeter.style.height = `${Math.min(100, (muscleMass - 15240) / 100)}%`;
        muscleMassValue.textContent = muscleMass;
        
        pumpMeter.style.height = `${(pump / 1000) * 100}%`;
        pumpValue.textContent = `${pump}/1000`;
        
        energyBar.style.width = `${energy}%`;
    }

    characterClickableArea.addEventListener('click', () => {
        if (energy > 0) {
            reps++;
            pump = Math.min(1000, pump + 1);
            muscleMass += 10;
            energy = Math.max(0, energy - 1);

            updateUI();
            
            // Animate the character
            character.style.transform = 'scale(1.1)';
            setTimeout(() => {
                character.style.transform = 'scale(1)';
            }, 100);

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
        }
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

    // Initial UI update
    updateUI();
});