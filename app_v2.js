import fitnessLevels from './fitnessLevels.js';

const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    let gains = 0;
    let energy = 1000;
    let level = 1;
    let gainsPerRep = 1;
    let gainsPerDay = 10;
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
        e.preventDefault(); // Prevent default touch behavior
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

    // Prevent selection and default behaviors
    function preventDefaultBehavior(e) {
        e.preventDefault();
        return false;
    }

    [pumpMeContainer, character].forEach(element => {
        element.addEventListener('touchstart', pump, { passive: false });
        element.addEventListener('mousedown', pump);
        element.addEventListener('touchmove', preventDefaultBehavior, { passive: false });
        element.addEventListener('touchend', preventDefaultBehavior, { passive: false });
        element.addEventListener('touchcancel', preventDefaultBehavior, { passive: false });
        element.addEventListener('contextmenu', preventDefaultBehavior);
    });

    // Prevent selection on the entire document
    document.addEventListener('selectstart', preventDefaultBehavior);
    document.addEventListener('dragstart', preventDefaultBehavior);

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
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pages.forEach(page => page.style.display = 'none');
            pages[index].style.display = 'flex';
        });
    });

    // Initial UI update
    updateUI();

    tg.ready();
    tg.expand();
});