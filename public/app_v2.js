const tg = window.Telegram.WebApp;
const APP_VERSION = '1.0.1'; // Increment this when you make changes

document.addEventListener('DOMContentLoaded', () => {
    // Check and update version
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion !== APP_VERSION) {
        // Clear all localStorage data
        localStorage.clear();
        // Set the new version
        localStorage.setItem('appVersion', APP_VERSION);
        // Reload the page to ensure clean state
        window.location.reload(true);
    }

    // Display version
    const versionDisplay = document.getElementById('version-display');
    versionDisplay.textContent = `v${APP_VERSION}`;

    const characterClickableArea = document.getElementById('character-clickable-area');
    const character = document.getElementById('character');
    const scoreDisplay = document.getElementById('score-display');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const backButton = document.getElementById('back-button');
    const topPumpersBtn = document.getElementById('top-pumpers-btn');
    
    const muscleMassMeter = document.querySelector('.muscle-mass .meter-fill');
    const muscleMassValue = document.querySelector('.muscle-mass .meter-value');
    const pumpMeter = document.querySelector('.pump .meter-fill');
    const pumpValue = document.querySelector('.pump .meter-value');
    const energyBar = document.querySelector('.energy-fill');

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

        // Save values to localStorage
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

    // Set up energy regeneration
    setInterval(regenerateEnergy, 1000);

    characterClickableArea.addEventListener('click', () => {
        if (energy > 0) {
            reps++;
            pump = Math.min(1000, pump + 1);
            muscleMass += 10;
            energy = Math.max(0, energy - 1);

            updateUI();
            
            // Animate the character
            character