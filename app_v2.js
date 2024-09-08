const tg = window.Telegram.WebApp;

const fitnessLevels = [
    {
        level: 1,
        name: "Couch Potato",
        minGains: 0,
        maxGains: 10000,
        gainsPerRep: 1,
        gainsPerDay: 0
    },
    {
        level: 2,
        name: "Weekend Warrior",
        minGains: 10001,
        maxGains: 30000,
        gainsPerRep: 3,
        gainsPerDay: 0
    },
    {
        level: 3,
        name: "Gym Rat",
        minGains: 30001,
        maxGains: 100000,
        gainsPerRep: 7,
        gainsPerDay: 0
    },
    {
        level: 4,
        name: "Iron Pumpling",
        minGains: 100001,
        maxGains: 300000,
        gainsPerRep: 12,
        gainsPerDay: 1200
    },
    {
        level: 5,
        name: "Shredded Sensation",
        minGains: 300001,
        maxGains: 1000000,
        gainsPerRep: 18,
        gainsPerDay: 1800
    },
    {
        level: 6,
        name: "Flex Master",
        minGains: 1000001,
        maxGains: 2500000,
        gainsPerRep: 25,
        gainsPerDay: 2500
    },
    {
        level: 7,
        name: "Strength Sage",
        minGains: 2500001,
        maxGains: 5000000,
        gainsPerRep: 33,
        gainsPerDay: 3300
    },
    {
        level: 8,
        name: "Fitness Phenom",
        minGains: 5000001,
        maxGains: 10000000,
        gainsPerRep: 42,
        gainsPerDay: 4200
    },
    {
        level: 9,
        name: "Olympian Aspirant",
        minGains: 10000001,
        maxGains: 20000000,
        gainsPerRep: 52,
        gainsPerDay: 5200
    },
    {
        level: 10,
        name: "Legendary Lifter",
        minGains: 20000001,
        maxGains: Infinity,
        gainsPerRep: 63,
        gainsPerDay: 6300
    }
];

document.addEventListener('DOMContentLoaded', () => {
    let gains = 0;
    let energy = 1000;
    let level = 1;
    let gainsPerRep = 1;
    let gainsPerDay = 0;
    let boostMultiplier = 1;

    const gainsDisplay = document.getElementById('gains-display');
    const energyBar = document.getElementById('energy-bar');
    const energyStatus = document.getElementById('energy-status');
    const levelDisplay = document.getElementById('level-display');
    const gainsPerRepDisplay = document.querySelector('.status-item:nth-child(1) .status-value');
    const statusDisplay = document.querySelector('.status-item:nth-child(2) .status-value');
    const gainsPerDayDisplay = document.querySelector('.status-item:nth-child(3) .status-value');
    const pumpMeContainer = document.getElementById('pump-me-container');
    const character = document.getElementById('character');
    const characterContainer = document.getElementById('character-container');

    function updateLevel() {
        const currentLevel = fitnessLevels.find(l => gains >= l.minGains && gains <= l.maxGains);
        if (currentLevel && currentLevel.level !== level) {
            level = currentLevel.level;
            gainsPerRep = currentLevel.gainsPerRep;
            gainsPerDay = currentLevel.gainsPerDay;
            console.log(`Leveled up to ${currentLevel.name}!`);
        }
    }

    function updateUI() {
        gainsDisplay.textContent = gains.toLocaleString();
        energyBar.style.width = `${(energy / 1000) * 100}%`;
        energyStatus.textContent = energy >= 200 ? 'Rested' : 'Tired';
        const currentLevel = fitnessLevels[level - 1];
        levelDisplay.textContent = `${currentLevel.name} (Level ${level}/10)`;
        gainsPerRepDisplay.innerHTML = `<img src="/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerRep * boostMultiplier}`;
        gainsPerDayDisplay.innerHTML = `<img src="/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerDay * boostMultiplier}`;
    }

    function saveUserData() {
        const userId = tg.initDataUnsafe?.user?.id;
        const username = tg.initDataUnsafe?.user?.username || 'Anonymous';
        fetch('/api/saveUserData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, username, gains, level }),
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => console.log('User data saved:', data))
        .catch(error => console.error('Error saving user data:', error));
    }

    function loadUserData() {
        const userId = tg.initDataUnsafe?.user?.id;
        fetch(`/api/getUserData?userId=${userId}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            gains = data.gains;
            level = data.level;
            updateUI();
        })
        .catch(error => console.error('Error loading user data:', error));
    }

    function pump(e) {
        e.preventDefault();
        e.stopPropagation();
        if (energy > 0) {
            gains += gainsPerRep * boostMultiplier;
            energy = Math.max(0, energy - 1);
            updateLevel();
            updateUI();
            saveUserData();

            character.style.transform = 'scale(1.1)';
            setTimeout(() => {
                character.style.transform = 'scale(1)';
            }, 100);
        }
    }

    function updateLeaderboard() {
        fetch('/api/leaderboard')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Leaderboard data:', data);
            const leaderboardBody = document.getElementById('leaderboard-body');
            leaderboardBody.innerHTML = '';
            data.forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                    <td>${user.gains.toLocaleString()}</td>
                `;
                leaderboardBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error updating leaderboard:', error);
            const leaderboardBody = document.getElementById('leaderboard-body');
            leaderboardBody.innerHTML = '<tr><td colspan="3">Error loading leaderboard. Please try again later.</td></tr>';
        });
    }
        
    // Call updateLeaderboard when the Top Pumpers page is shown
    document.getElementById('top-pumpers-btn').addEventListener('click', updateLeaderboard);
    
    // Update leaderboard every 30 seconds if on the Top Pumpers page
    setInterval(() => {
        if (document.getElementById('top-pumpers-page').style.display !== 'none') {
            updateLeaderboard();
        }
    }, 30000);
    
    function preventDefaultBehavior(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Prevent selection and default behaviors
    document.body.addEventListener('touchstart', preventDefaultBehavior, { passive: false });
    document.body.addEventListener('touchmove', preventDefaultBehavior, { passive: false });
    document.body.addEventListener('touchend', preventDefaultBehavior, { passive: false });
    document.body.addEventListener('contextmenu', preventDefaultBehavior);
    document.body.addEventListener('selectstart', preventDefaultBehavior);
    document.body.addEventListener('dragstart', preventDefaultBehavior);

    // Make character and PUMP ME clickable
    [pumpMeContainer, character, characterContainer].forEach(element => {
        if (element) {
            element.addEventListener('touchstart', pump, { passive: false });
            element.addEventListener('mousedown', pump);
        }
    });

    // Load user data on startup
    loadUserData();

    // Update leaderboard every 30 seconds
    setInterval(updateLeaderboard, 30000);

    // Initial leaderboard update
    updateLeaderboard();
    
    // Energy regeneration
    setInterval(() => {
        if (energy < 1000) {
            energy = Math.min(1000, energy + 1);
            updateUI();
        }
    }, 1000);

    // Gains per day
    setInterval(() => {
        gains += gainsPerDay * boostMultiplier / (24 * 60 * 60);
        updateLevel();
        updateUI();
    }, 1000);

    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop event from bubbling up
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pages.forEach(page => page.style.display = 'none');
            pages[index].style.display = 'flex';
        });
    });

    // Remove preventDefault from nav buttons
    document.querySelector('nav').addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    document.querySelector('nav').addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
    document.querySelector('nav').addEventListener('touchend', (e) => e.stopPropagation(), { passive: true });

    // Initial UI update
    updateUI();

    tg.ready();
    tg.expand();
});