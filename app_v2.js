import fitnessLevels from './fitnessLevels.js';

const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    let gains = 0;
    let energy = 1000;
    let level = 1;
    let gainsPerRep = 1;
    let gainsPerDay = 10;
    let boostMultiplier = 1; // For future boost implementations

    const gainsDisplay = document.getElementById('gains-display');
    const energyBar = document.getElementById('energy-bar');
    const energyStatus = document.getElementById('energy-status');
    const levelDisplay = document.getElementById('level-display');
    const gainsPerRepDisplay = document.querySelector('.status-item:nth-child(1) .status-value');
    const statusDisplay = document.querySelector('.status-item:nth-child(2) .status-value');
    const gainsPerDayDisplay = document.querySelector('.status-item:nth-child(3) .status-value');
    const pumpMeContainer = document.getElementById('pump-me-container');
    const character = document.getElementById('character');

    function updateLevel() {
        const currentLevel = fitnessLevels.find(l => gains >= l.minGains && gains <= l.maxGains);
        if (currentLevel && currentLevel.level !== level) {
            level = currentLevel.level;
            gainsPerRep = currentLevel.gainsPerRep;
            gainsPerDay = currentLevel.gainsPerDay;
            // You might want to show a level up message here
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

    function pump() {
        if (energy > 0) {
            gains += gainsPerRep * boostMultiplier;
            energy = Math.max(0, energy - 1);
            updateLevel();
            updateUI();

            // Animate character
            character.style.transform = 'scale(1.1)';
            setTimeout(() => {
                character.style.transform = 'scale(1)';
            }, 100);
        }
    }

    // Use touchstart and mousedown events for better mobile compatibility
    pumpMeContainer.addEventListener('touchstart', pump, { passive: false });
    pumpMeContainer.addEventListener('mousedown', pump);

    character.addEventListener('touchstart', pump, { passive: false });
    character.addEventListener('mousedown', pump);

    // Prevent default behavior to stop unwanted effects
    [pumpMeContainer, character].forEach(element => {
        element.addEventListener('touchend', (e) => e.preventDefault());
        element.addEventListener('touchmove', (e) => e.preventDefault());
        element.addEventListener('touchcancel', (e) => e.preventDefault());
        element.addEventListener('contextmenu', (e) => e.preventDefault());
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
        gains += gainsPerDay * boostMultiplier / (24 * 60 * 60); // Divide by seconds in a day for smooth increments
        updateLevel();
        updateUI();
    }, 1000); // Update every second

    // Navigation (keep your existing navigation code here)

    // Prevent text selection on the entire page
    document.body.style.webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';

    // Initial UI update
    updateUI();

    tg.ready();
    tg.expand();
});