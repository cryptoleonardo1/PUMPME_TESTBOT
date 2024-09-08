const tg = window.Telegram.WebApp;

const fitnessLevels = [
    {
        level: 1,
        name: "Couch Potato",
        minGains: 0,
        maxGains: 10000,
        gainsPerRep: 1,
        gainsPerDay: 10
    },
    {
        level: 2,
        name: "Weekend Warrior",
        minGains: 10001,
        maxGains: 30000,
        gainsPerRep: 3,
        gainsPerDay: 300
    },
    {
        level: 3,
        name: "Gym Rat",
        minGains: 30001,
        maxGains: 100000,
        gainsPerRep: 7,
        gainsPerDay: 700
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
    let gains = 1547455;
    let energy = 1000;
    let level = 6;
    let gainsPerRep = 12;
    let gainsPerDay = 388;
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

    function pump(e) {
        e.preventDefault();
        e.stopPropagation();
        if (energy > 0) {
            gains += gainsPerRep * boostMultiplier;
            energy = Math.max(0, energy - 1);
            updateLevel();
            updateUI();

            character.style.transform = 'scale(1.1)';
            setTimeout(() => {
                character.style.transform = 'scale(1)';
            }, 100);
        }
    }

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