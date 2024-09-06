const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    let gains = 1547455;
    let energy = 1000;
    let level = 6;
    let gainsPerRep = 12;
    let gainsPerDay = 388;

    const gainsDisplay = document.getElementById('gains-display');
    const energyBar = document.getElementById('energy-bar');
    const energyStatus = document.getElementById('energy-status');
    const levelDisplay = document.getElementById('level-display');
    const gainsPerRepDisplay = document.querySelector('.status-item:nth-child(1) .status-value');
    const statusDisplay = document.querySelector('.status-item:nth-child(2) .status-value');
    const gainsPerDayDisplay = document.querySelector('.status-item:nth-child(3) .status-value');
    const pumpMeContainer = document.getElementById('pump-me-container');
    const character = document.getElementById('character');

    function updateUI() {
        gainsDisplay.textContent = gains.toLocaleString();
        energyBar.style.width = `${(energy / 1000) * 100}%`;
        energyStatus.textContent = energy >= 200 ? 'Rested' : 'Tired';
        levelDisplay.textContent = `Level ${level}/10`;
        gainsPerRepDisplay.innerHTML = `<img src="/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerRep}`;
        gainsPerDayDisplay.innerHTML = `<img src="/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerDay}`;
    }

    function pump(e) {
        e.preventDefault(); // Prevent default behavior
        if (energy > 0) {
            gains += gainsPerRep;
            energy = Math.max(0, energy - 1);
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

    // Prevent text selection on the entire page
    document.body.style.webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';

    // Energy regeneration
    setInterval(() => {
        if (energy < 1000) {
            energy = Math.min(1000, energy + 1);
            updateUI();
        }
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