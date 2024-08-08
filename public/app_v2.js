console.log('Starting app initialization...');

const tg = window.Telegram.WebApp;
const APP_VERSION = '1.0.3'; // Increment this when you make changes

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    try {
        // Display version
        const versionDisplay = document.getElementById('version-display');
        if (versionDisplay) {
            versionDisplay.textContent = `v${APP_VERSION}`;
        } else {
            console.warn('Version display element not found');
        }

        const characterClickableArea = document.getElementById('character-clickable-area');
        const character = document.getElementById('character');
        const scoreDisplay = document.getElementById('score-display');
        const leaderboardPage = document.getElementById('leaderboard-page');
        const leaderboardBody = document.getElementById('leaderboard-body');
        const backButton = document.getElementById('back-button');
        const topPumpersBtn = document.getElementById('top-pumpers-btn');
        
        const muscleMassMeter = document.querySelector('.muscle-mass .meter-fill');
        const muscleMassValue = document.querySelector('.muscle-mass .meter-value');
        const pumpMeter = document.querySelector('.pump .meter-fill');
        const pumpValue = document.querySelector('.pump .meter-value');
        const energyBar = document.querySelector('.energy-fill');

        if (!characterClickableArea || !character || !scoreDisplay || !leaderboardPage || 
            !leaderboardBody || !backButton || !topPumpersBtn || !muscleMassMeter || 
            !muscleMassValue || !pumpMeter || !pumpValue || !energyBar) {
            throw new Error('One or more required elements not found');
        }

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
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
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
              .catch(error => {
                console.error('Error updating leaderboard:', error);
                leaderboardBody.innerHTML = '<tr><td colspan="4">Failed to load leaderboard. Please try again later.</td></tr>';
              });
          }

        // Update leaderboard every 30 seconds
        setInterval(updateLeaderboard, 30000);

        // Expand the Telegram Web App to full height
        tg.expand();

        // Initial UI update
        updateUI();

        console.log('App initialization complete');
    } catch (error) {
        console.error('Error during app initialization:', error);
        document.body.innerHTML += '<p style="color: red;">Error initializing app: ' + error.message + '</p>';
    }
});

window.addEventListener('load', () => {
    console.log('All resources finished loading!');
});

console.log('Script loaded successfully!');