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
            
            fitnessLevelDisplay.textContent = `Fitness Level ${level}: ${title} 🏋️‍♂️`;
        }

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

    const challenges = [
        { id: 'daily-checkin', title: 'Daily Check-in', description: 'Log in to the app daily', progress: 0, goal: 1, reward: '50 coins', type: 'daily' },
        { id: 'invite-friends', title: 'Invite Friends', description: 'Invite 5 friends to join', progress: 0, goal: 5, reward: '200 coins', type: 'ongoing' },
        { id: 'join-twitter', title: 'Join Twitter', description: 'Follow us on Twitter', progress: 0, goal: 1, reward: '100 coins', type: 'one-time' },
        { id: 'join-telegram', title: 'Join Telegram', description: 'Join our Telegram group', progress: 0, goal: 1, reward: '100 coins', type: 'one-time' },
        { id: 'join-instagram', title: 'Join Instagram', description: 'Follow us on Instagram', progress: 0, goal: 1, reward: '100 coins', type: 'one-time' },
        { id: 'daily-workout', title: 'Daily Workout', description: 'Complete 100 reps daily', progress: 0, goal: 100, reward: '100 coins', type: 'daily' },
    ];
    
    function loadChallenges() {
        const challengesContainer = document.getElementById('challenges-container');
        challengesContainer.innerHTML = '';
    
        challenges.forEach(challenge => {
            const challengeElement = document.createElement('div');
            challengeElement.className = 'challenge-item';
            challengeElement.innerHTML = `
                <div class="challenge-info">
                    <div class="challenge-title">${challenge.title}</div>
                    <div class="challenge-description">${challenge.description}</div>
                    <div class="challenge-progress">Progress: ${challenge.progress}/${challenge.goal}</div>
                </div>
                <div class="challenge-reward">${challenge.reward}</div>
                <button class="challenge-button" onclick="handleChallenge('${challenge.id}')" ${challenge.progress >= challenge.goal ? 'disabled' : ''}>
                    ${challenge.progress >= challenge.goal ? 'Completed' : 'Do it!'}
                </button>
            `;
            challengesContainer.appendChild(challengeElement);
        });
    }
    
    function handleChallenge(challengeId) {
        const challenge = challenges.find(c => c.id === challengeId);
        if (challenge) {
            switch (challenge.type) {
                case 'daily':
                    challenge.progress = Math.min(challenge.goal, challenge.progress + 1);
                    break;
                case 'one-time':
                    challenge.progress = challenge.goal;
                    break;
                case 'ongoing':
                    challenge.progress = Math.min(challenge.goal, challenge.progress + 1);
                    break;
            }
            loadChallenges();
            // Here you would typically update the server with the new progress
            console.log(`Challenge "${challenge.title}" progress updated to ${challenge.progress}`);
        }
    }
    
    function loadPage(pageName) {
        if (pageName === currentPage) return;
        currentPage = pageName;
        if (pageName === 'challenges') {
            loadChallenges();
        }

        // Hide all pages
        document.getElementById('gym-page').style.display = 'none';
        document.getElementById('boosts-page').style.display = 'none';
        document.getElementById('challenges-page').style.display = 'none';
        document.getElementById('leaderboard-page').style.display = 'none';

        // Show the selected page
        document.getElementById(`${pageName}-page`).style.display = 'block';

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${pageName}-btn`).classList.add('active');

        if (pageName === 'boosts') {
            loadBoostsData();
        }

        updateUI();
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
                    loadPage('leaderboard');
                    updateLeaderboard();
                } else {
                    loadPage(page);
                }
            });
        });

        document.getElementById('back-button')?.addEventListener('click', () => {
            loadPage('gym');
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

    // Initial setup
    attachEventListeners();
    loadPage('gym');
});