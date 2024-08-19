document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 'gym';
    let reps = parseInt(localStorage.getItem('reps')) || 0;
    let muscleMass = parseInt(localStorage.getItem('muscleMass')) || 15240;
    let pump = parseInt(localStorage.getItem('pump')) || 0;
    let energy = parseInt(localStorage.getItem('energy')) || 1000;
    const maxEnergy = 1000;

    const tg = window.Telegram.WebApp;
    tg.ready();

    function updateUI() {
        const cleanRepsDisplay = document.getElementById('clean-reps-display');
        const cleanRepsFill = document.querySelector('.clean-reps-fill');
        const muscleMassMeter = document.querySelector('.muscle-mass .meter-fill');
        const muscleMassValue = document.querySelector('.muscle-mass .meter-value');
        const energyMeter = document.querySelector('.energy .meter-fill');
        const energyValue = document.querySelector('.energy .meter-value');
    
        if (cleanRepsDisplay) cleanRepsDisplay.textContent = `Clean Reps: ${reps}`;
        if (cleanRepsFill) {
            const maxWidth = 100; // You can adjust this value based on your desired max Clean Reps
            const fillWidth = Math.min((reps / maxWidth) * 100, 100);
            cleanRepsFill.style.width = `${fillWidth}%`;
        }
        
        if (muscleMassMeter) muscleMassMeter.style.height = `${Math.min(100, (muscleMass - 15240) / 100)}%`;
        if (muscleMassValue) muscleMassValue.textContent = muscleMass;
        
        if (energyMeter) energyMeter.style.height = `${(energy / maxEnergy) * 100}%`;
        if (energyValue) energyValue.textContent = `${energy}/${maxEnergy}`;
    
        // Update Fitness Level display
        const fitnessLevelDisplay = document.querySelector('.fitness-level');
        if (fitnessLevelDisplay) {
            let level = 1;
            let title = "Novice Lifter";
            
            if (reps >= 1000) {
                level = 5;
                title = "Legendary Pumper";
            } else if (reps >= 500) {
                level = 4;
                title = "Elite Muscle";
            } else if (reps >= 100) {
                level = 3;
                title = "Buff Beginner";
            } else if (reps >= 50) {
                level = 2;
                title = "Gym Enthusiast";
            }
            
            fitnessLevelDisplay.textContent = `Rank ${level}: ${title} 🐂`;
        }
    
        localStorage.setItem('reps', reps);
        localStorage.setItem('muscleMass', muscleMass);
        localStorage.setItem('pump', pump);
        localStorage.setItem('energy', energy);
    }
    
    function handleCharacterClick(event) {
        if (energy > 0) {
            reps++;
            pump = Math.min(1000, pump + 1);
            muscleMass += 10;
            energy = Math.max(0, energy - 1);
    
            updateUI();
            
            const character = document.getElementById('character');
            if (character) {
                character.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    character.style.transform = 'scale(1)';
                }, 100);
            }
    
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
                console.log('Pump Points updated:', data.totalScore);
            })
            .catch(error => console.error('Error:', error));
        }
    }

    function loadPage(pageName) {
        if (pageName === currentPage) return;
        currentPage = pageName;

        // Hide all pages
        document.getElementById('gym-page').style.display = 'none';
        document.getElementById('boosts-page').style.display = 'none';
        document.getElementById('challenges-page').style.display = 'none';
        document.getElementById('leaderboard-page').style.display = 'none';

        // Show the selected page
        const selectedPage = document.getElementById(`${pageName}-page`);
        if (selectedPage) {
            selectedPage.style.display = 'block';
        }

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`${pageName}-btn`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        if (pageName === 'boosts') {
            loadBoostsData();
        } else if (pageName === 'challenges') {
            loadChallenges();
        } else if (pageName === 'leaderboard') {
            updateLeaderboard();
        }

        updateUI();
    }

    function loadBoostsData() {
        // Implement boost loading logic here
    }

    function loadChallenges() {
        // Implement challenge loading logic here
    }

    function updateLeaderboard() {
        fetch('/api/leaderboard')
        .then(response => response.json())
        .then(leaderboard => {
            const leaderboardBody = document.getElementById('leaderboard-body');
            if (leaderboardBody) {
                leaderboardBody.innerHTML = '';
                
                const rewards = [
                    "Gym membership", "Dumbbells", "Gym entry",
                    "Protein Shake", "Protein Shake", "Protein Shake",
                    "Protein Shake", "Protein Shake", "Protein Shake",
                    "Protein Shake"
                ];
    
                for (let i = 0; i < 10; i++) {
                    const entry = leaderboard[i] || { userId: '---', score: '---' };
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${i + 1}</td>
                        <td>${entry.userId}</td>
                        <td>${entry.score}</td>
                        <td>${rewards[i]}</td>
                    `;
                    leaderboardBody.appendChild(row);
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Attach event listeners
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.id.split('-')[0];
            loadPage(page === 'top-pumpers' ? 'leaderboard' : page);
        });
    });

    const characterClickableArea = document.getElementById('character-clickable-area');
    if (characterClickableArea) {
        characterClickableArea.addEventListener('click', handleCharacterClick);
    }

    // Initial setup
    loadPage('gym');
    tg.expand();
});