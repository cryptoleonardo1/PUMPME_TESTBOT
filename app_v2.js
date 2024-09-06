const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    let gains = 1543999;
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
        gainsPerRepDisplay.textContent = `💪 +${gainsPerRep}`;
        gainsPerDayDisplay.textContent = `💪 +${gainsPerDay}`;
    }

    function pump() {
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

    pumpMeContainer.addEventListener('click', pump);
    character.addEventListener('click', pump);

    // Energy regeneration
    setInterval(() => {
        if (energy < 1000) {
            energy = Math.min(1000, energy + 1);
            updateUI();
        }
    }, 1000);

    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('#app > div');

    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pages.forEach(page => page.style.display = 'none');
            pages[index].style.display = 'block';
        });
    });

    // Initial UI update
    updateUI();

    tg.ready();
    tg.expand();
});