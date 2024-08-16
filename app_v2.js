const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    const characterClickableArea = document.getElementById('character-clickable-area');
    const character = document.getElementById('character');
    const scoreDisplay = document.getElementById('score-display');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const backButton = document.getElementById('back-button');
    
    const muscleMassMeter = document.querySelector('.muscle-mass .meter-fill');
    const muscleMassValue = document.querySelector('.muscle-mass .meter-value');
    const pumpMeter = document.querySelector('.pump .meter-fill');
    const pumpValue = document.querySelector('.pump .meter-value');
    const energyBar = document.querySelector('.energy-fill');

    const gymBtn = document.getElementById('gym-btn');
    const boostsBtn = document.getElementById('boosts-btn');
    const challengesBtn = document.getElementById('challenges-btn');
    const topPumpersBtn = document.getElementById('top-pumpers-btn');

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

    setInterval(regenerateEnergy, 1000);

    function handleCharacterClick(event) {
        if (energy > 0) {
            reps++;
            pump = Math.min(1000, pump + 1);
            muscleMass += 10;
            energy = Math.max(0, energy - 1);

            updateUI();
            
            character.style.transform = 'scale(1.1)';
            setTimeout(() => {
                character.style.transform = 'scale(1)';
            }, 100);

            const feedbackEl = document.createElement('div');
            feedbackEl.className = 'tap-plus-one';
            feedbackEl.textContent = '+1';
            feedbackEl.style.left = (event.clientX - 15) + 'px';
            feedbackEl.style.top = (event.clientY - 15) + 'px';
            document.body.appendChild(feedbackEl);
            
            setTimeout(() => {
                feedbackEl.remove();
            }, 1000);

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
    }

    function loadPage(pageName) {
        fetch(`/${pageName}.html`)
            .then(response => response.text())
            .then(html => {
                document.body.innerHTML = html;
                attachEventListeners();
            })
            .catch(error => console.error('Error loading page:', error));
    }

    function attachEventListeners() {
        document.getElementById('gym-btn')?.addEventListener('click', () => loadPage('index'));
        document.getElementById('boosts-btn')?.addEventListener('click', () => loadPage('boosts'));
        document.getElementById('top-pumpers-btn')?.addEventListener('click', () => {
            document.getElementById('leaderboard-page').style.display = 'block';
            updateLeaderboard();
        });
        document.getElementById('back-button')?.addEventListener('click', () => {
            document.getElementById('leaderboard-page').style.display = 'none';
        });

        const characterClickableArea = document.getElementById('character-clickable-area');
        if (characterClickableArea) {
            characterClickableArea.addEventListener('click', handleCharacterClick);
        }
    }

    gymBtn?.addEventListener('click', () => loadPage('index'));
    boostsBtn?.addEventListener('click', () => loadPage('boosts'));
    topPumpersBtn?.addEventListener('click', () => {
        leaderboardPage.style.display = 'block';
        updateLeaderboard();
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

    setInterval(updateLeaderboard, 30000);

    tg.expand();

    updateUI();
    attachEventListeners();
});