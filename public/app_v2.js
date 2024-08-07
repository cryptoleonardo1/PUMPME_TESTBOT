const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    // ... (other variable declarations)

    let reps = parseInt(localStorage.getItem('reps')) || 0;
    let muscleMass = parseInt(localStorage.getItem('muscleMass')) || 15240;
    let pump = parseInt(localStorage.getItem('pump')) || 0;
    let energy = parseInt(localStorage.getItem('energy')) || 1000;
    const maxEnergy = 1000;

    tg.ready();

    function updateUI() {
        scoreDisplay.textContent = `Clean Reps: ${reps}`;
        
        muscleMassMeter.style.height = `${Math.min(100, (muscleMass - 15240) / 100)}%`;
        muscleMassValue.textContent = muscleMass;
        
        pumpMeter.style.height = `${(pump / 1000) * 100}%`;
        pumpValue.textContent = `${pump}/1000`;
        
        energyBar.style.width = `${(energy / maxEnergy) * 100}%`;

        // Save values to localStorage
        localStorage.setItem('reps', reps);
        localStorage.setItem('muscleMass', muscleMass);
        localStorage.setItem('pump', pump);
        localStorage.setItem('energy', energy);
    }

    function regenerateEnergy() {
        if (energy < maxEnergy) {
            energy = Math.min(maxEnergy, energy + 1);
            updateUI();
        }
    }

    // Set up energy regeneration
    setInterval(regenerateEnergy, 1000);

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

    topPumpersBtn.addEventListener('click', () => {
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