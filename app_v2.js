const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 'gym';
    let reps = parseInt(localStorage.getItem('reps')) || 0;
    let muscleMass = parseInt(localStorage.getItem('muscleMass')) || 15240;
    let pump = parseInt(localStorage.getItem('pump')) || 0;
    let energy = parseInt(localStorage.getItem('energy')) || 1000;
    const maxEnergy = 1000;

    tg.ready();

    function updateUI() {
        const scoreDisplay = document.getElementById('score-display');
        const muscleMassMeter = document.querySelector('.muscle-mass .meter-fill');
        const muscleMassValue = document.querySelector('.muscle-mass .meter-value');
        const pumpMeter = document.querySelector('.pump .meter-fill');
        const pumpValue = document.querySelector('.pump .meter-value');
        const energyBar = document.querySelector('.energy-fill');

        if (scoreDisplay) scoreDisplay.textContent = `Clean Reps: ${reps}`;
        
        if (muscleMassMeter) muscleMassMeter.style.height = `${Math.min(100, (muscleMass - 15240) / 100)}%`;
        if (muscleMassValue) muscleMassValue.textContent = muscleMass;
        
        if (pumpMeter) pumpMeter.style.height = `${(pump / 1000) * 100}%`;
        if (pumpValue) pumpValue.textContent = `${pump}/1000`;
        
        if (energyBar) energyBar.style.width = `${(energy / maxEnergy) * 100}%`;

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
                console.log('Clean Reps updated:', data.totalScore);
            })
            .catch(error => console.error('Error:', error));
        }
    }

    function loadPage(pageName) {
        currentPage = pageName;
        fetch(`/${pageName}.html`)
            .then(response => response.text())
            .then(html => {
                document.body.innerHTML = html;
                if (pageName === 'boosts') {
                    loadBoostsData();
                }
                attachEventListeners();
                updateUI();
            })
            .catch(error => console.error('Error loading page:', error));
    }

    function loadBoostsData() {
        const boostItems = document.getElementById('boost-items');
        if (boostItems) {
            displayBoosts('nutrition');
        }
    }

    function attachEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const page = this.id.split('-')[0];
                if (page === 'top') {
                    document.getElementById('leaderboard-page').style.display = 'block';
                    updateLeaderboard();
                } else {
                    loadPage(page);
                }
            });
        });

        document.getElementById('back-button')?.addEventListener('click', () => {
            document.getElementById('leaderboard-page').style.display = 'none';
        });

        const characterClickableArea = document.getElementById('character-clickable-area');
        if (characterClickableArea) {
            characterClickableArea.addEventListener('click', handleCharacterClick);
        }

        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                displayBoosts(button.dataset.category);
            });
        });
    }

    function updateLeaderboard() {
        fetch('/api/leaderboard')
        .then(response => response.json())
        .then(leaderboard => {
            const leaderboardBody = document.getElementById('leaderboard-body');
            if (leaderboardBody) {
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
            }
        })
        .catch(error => console.error('Error:', error));
    }

    const boosts = {
        nutrition: [
            { name: "Protein Shake", icon: "🥤", description: "Increase muscle growth", price: 50 },
            { name: "Pre-workout", icon: "⚡", description: "Boost energy for workouts", price: 75 },
            { name: "Energy Drink", icon: "🍹", description: "Quick energy boost", price: 30 },
            { name: "Steak", icon: "🥩", description: "High protein meal", price: 100 },
            { name: "Eggs", icon: "🥚", description: "Protein-rich snack", price: 20 },
        ],
        equipment: [
            { name: "Gym Entry", icon: "🏋️", description: "Access to gym facilities", price: 150 },
            { name: "Gym Membership", icon: "💳", description: "Monthly gym access", price: 500 },
            { name: "Dumbbells", icon: "🏋️‍♂️", description: "For home workouts", price: 200 },
        ],
        activities: [
            { name: "Yoga", icon: "🧘", description: "Improve flexibility", price: 80 },
            { name: "Hip-hop Dance", icon: "💃", description: "Cardio workout", price: 100 },
            { name: "Salsa", icon: "💃", description: "Fun cardio exercise", price: 90 },
            { name: "Swimming", icon: "🏊", description: "Full body workout", price: 120 },
            { name: "Sauna", icon: "🧖", description: "Relaxation & recovery", price: 70 },
        ],
        training: [
            { name: "Chest Day", icon: "💪", description: "10x reps for chest", price: 300 },
            { name: "Leg Day", icon: "🦵", description: "10x reps for legs", price: 300 },
            { name: "Back Day", icon: "🏋️‍♀️", description: "10x reps for back", price: 300 },
            { name: "Arm Day", icon: "💪", description: "10x reps for arms", price: 300 },
            { name: "Cardio", icon: "🏃", description: "10x reps for cardio", price: 300 },
        ]
    };

    function displayBoosts(category) {
        const boostItems = document.getElementById('boost-items');
        if (boostItems) {
            boostItems.innerHTML = '';
            boosts[category].forEach(boost => {
                const boostElement = document.createElement('div');
                boostElement.className = 'boost-item';
                boostElement.innerHTML = `
                    <div class="boost-icon">${boost.icon}</div>
                    <div class="boost-name">${boost.name}</div>
                    <div class="boost-description">${boost.description}</div>
                    <div class="boost-price">${boost.price} 💰</div>
                `;
                boostItems.appendChild(boostElement);
            });
        }
    }

    setInterval(updateLeaderboard, 30000);

    tg.expand();

    updateUI();
    attachEventListeners();
});