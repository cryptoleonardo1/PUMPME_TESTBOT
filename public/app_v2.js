// app_v2.js

// Initialize variables
let gains = 0;
let level = 1;
let gainsPerRep = 1;
let gainsPerDay = 0;
let energy = 1000;
let boostMultiplier = 1;
let activeBoosts = [];

const tg = window.Telegram.WebApp;

// User ID fallback for testing
const userIdFallback = 'test-user-id'; // Replace with a unique identifier for testing

// Fitness levels data
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

// Boost effects data
const boostEffects = {
    "Protein Shake": { type: "multiplier", value: 1.5, duration: 3600 }, // Duration in seconds (1 hour)
    "Pre-workout": { type: "multiplier", value: 1.5, duration: 3600 }, 
    "Creatine": { type: "multiplier", value: 1.5, duration: 3600 },
    "BCAA": { type: "multiplier", value: 1.5, duration: 3600 },
    "Coffee": { type: "multiplier", value: 1.5, duration: 3600 },
    "Energy drink": { type: "multiplier", value: 1.5, duration: 3600 },
    "Steak": { type: "multiplier", value: 1.5, duration: 3600 },
    "Eggs": { type: "multiplier", value: 1.5, duration: 3600 },
    "Chicken": { type: "multiplier", value: 1.5, duration: 3600 },
    "Hot-dog": { type: "multiplier", value: 1.5, duration: 3600 },
    "Chest Day": { type: "multiplier", value: 1.5, duration: 3600 },
    "Back Day": { type: "multiplier", value: 1.5, duration: 3600 },
    "Leg Day": { type: "multiplier", value: 1.5, duration: 3600 },
    "Abs Workout": { type: "multiplier", value: 1.5, duration: 3600 },
    "Shoulder Day": { type: "multiplier", value: 1.5, duration: 3600 },
    "Biceps Workout": { type: "multiplier", value: 1.5, duration: 3600 },
    "Triceps Workout": { type: "multiplier", value: 1.5, duration: 3600 },
    "HIIT": { type: "multiplier", value: 1.5, duration: 3600 },
    "Endurance Cardio": { type: "multiplier", value: 1.5, duration: 3600 },
    "Calisthenics": { type: "multiplier", value: 1.5, duration: 3600 },
    "Street Workout": { type: "multiplier", value: 1.5, duration: 3600 },
    "Yoga": { type: "multiplier", value: 1.5, duration: 3600 },
    "Dance Class": { type: "multiplier", value: 1.5, duration: 3600 },
    "Muay Thai": { type: "multiplier", value: 1.5, duration: 3600 },
    "Karate": { type: "multiplier", value: 1.5, duration: 3600 },
    "Swimming": { type: "multiplier", value: 1.5, duration: 3600 },
    "Jogging": { type: "multiplier", value: 1.5, duration: 3600 },
    "Cycling": { type: "multiplier", value: 1.5, duration: 3600 },
    "Sauna": { type: "multiplier", value: 1.5, duration: 3600 },
    "Massage": { type: "multiplier", value: 1.5, duration: 3600 },
    "Ice Bath": { type: "multiplier", value: 1.5, duration: 3600 },
    "Cold Shower": { type: "multiplier", value: 1.5, duration: 3600 },
    "20 Min Nap": { type: "multiplier", value: 1.5, duration: 3600 },
    "7 Hour Sleep": { type: "multiplier", value: 1.5, duration: 3600 },
    "Walk a Dog": { type: "multiplier", value: 1.5, duration: 3600 },
    "Breathing Exercise": { type: "multiplier", value: 1.5, duration: 3600 },
    "Meditation": { type: "multiplier", value: 5, duration: 20 },
};

// Boosts data (integrated from boosts.js)
window.boosts = {
    nutrition: [
        { name: "Protein Shake", icon: "🥤", description: "Boost muscle recovery", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Pre-workout", icon: "⚡", description: "Increase energy for workouts", price: 300, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Creatine", icon: "💊", description: "Enhance strength and muscle mass", price: 400, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "BCAA", icon: "🧪", description: "Support muscle growth and recovery", price: 350, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Coffee", icon: "☕", description: "Quick energy boost", price: 200, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Energy drink", icon: "🥫", description: "Sustained energy boost", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Steak", icon: "🥩", description: "High protein meal", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Eggs", icon: "🥚", description: "Protein-rich snack", price: 200, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Chicken", icon: "🍗", description: "Lean protein source", price: 350, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Hot-dog", icon: "🌭", description: "Quick protein fix", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } }
    ],
    workout: [
        { name: "Chest Day", icon: "🏋️", description: "Focus on chest muscles", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Back Day", icon: "🏋️", description: "Strengthen your back", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Leg Day", icon: "🦵", description: "Build lower body strength", price: 650, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Abs Workout", icon: "🦹‍♂️", description: "Core strength training", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Shoulder Day", icon: "🦾", description: "Develop shoulder muscles", price: 550, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Biceps Workout", icon: "💪", description: "Focus on biceps", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Triceps Workout", icon: "🦾", description: "Strengthen triceps", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "HIIT", icon: "🏃‍♂️", description: "High-intensity interval training", price: 700, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Endurance Cardio", icon: "🏃", description: "Boost cardiovascular endurance", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Calisthenics", icon: "🤸", description: "Bodyweight exercises", price: 550, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Street Workout", icon: "🤸", description: "Outdoor fitness training", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } }
    ],
    activities: [
        { name: "Yoga", icon: "🧘", description: "Improve flexibility and mindfulness", price: 400, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Dance Class", icon: "🕺", description: "Fun cardio workout", price: 450, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Muay Thai", icon: "🥊", description: "Thai boxing training", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Karate", icon: "🥋", description: "Martial arts practice", price: 550, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Swimming", icon: "🏊", description: "Full body workout", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Jogging", icon: "🏃‍♀️", description: "Outdoor cardio session", price: 300, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Cycling", icon: "🚴", description: "Low-impact cardio workout", price: 400, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } }
    ],
    resting: [
        { name: "Sauna", icon: "🧖", description: "Relaxation & recovery", price: 350, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Massage", icon: "🧖", description: "Muscle relaxation therapy", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Ice Bath", icon: "🧊", description: "Reduce inflammation", price: 400, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Cold Shower", icon: "🚿", description: "Boost recovery and alertness", price: 200, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "20 Min Nap", icon: "😴", description: "Quick energy recharge", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "7 Hour Sleep", icon: "🛌", description: "Full night's rest", price: 800, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Walk a Dog", icon: "🐕", description: "Light activity and stress relief", price: 300, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Breathing Exercise", icon: "🧘‍♂️", description: "Improve focus and relaxation", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Meditation", icon: "🧠", description: "Mental relaxation and clarity", price: 350, active: false, effect: { type: "multiplier", value: 5, duration: 20 } }
    ]
};

// Function to update fitness level based on gains
function updateLevel() {
    const currentLevel = fitnessLevels.find(l => gains >= l.minGains && gains <= l.maxGains);
    if (currentLevel && currentLevel.level !== level) {
        level = currentLevel.level;
        gainsPerRep = currentLevel.gainsPerRep;
        gainsPerDay = currentLevel.gainsPerDay;
        console.log(`Leveled up to ${currentLevel.name}!`);
    }
}

// Function to update the UI elements
function updateUI() {
    const energyBar = document.getElementById('energy-bar');
    const energyStatus = document.getElementById('energy-status');
    const levelDisplay = document.getElementById('level-display');
    const gainsDisplay = document.getElementById('gains-value');
    if (gainsDisplay) gainsDisplay.textContent = gains.toLocaleString();
    const gainsPerRepDisplay = document.querySelector('.status-item:nth-child(1) .status-value');
    const gainsPerDayDisplay = document.querySelector('.status-item:nth-child(3) .status-value');

    if (gainsDisplay) gainsDisplay.textContent = gains.toLocaleString();
    if (energyBar) energyBar.style.width = `${(energy / 1000) * 100}%`;
    if (energyStatus) energyStatus.textContent = energy >= 200 ? 'Rested' : 'Tired';
    if (levelDisplay) {
        const currentLevel = fitnessLevels[level - 1];
        levelDisplay.textContent = `${currentLevel.name} (Level ${level})`;
    }
    if (gainsPerRepDisplay) {
        gainsPerRepDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${(gainsPerRep * boostMultiplier).toFixed(1)}`;
    }
    if (gainsPerDayDisplay) {
        gainsPerDayDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${(gainsPerDay * boostMultiplier).toFixed(1)}`;
    }
    // Update active boosts display
    updateActiveBoostsDisplay();
}

// Function to save user data to the server
function saveUserData() {
    const userId = tg.initDataUnsafe?.user?.id || 'test-user-id';
    const username = tg.initDataUnsafe?.user?.username || 'Anonymous';

    // Save boosts data
    const boostsData = window.boosts;

    fetch('/api/saveUserData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, gains, level, boostsData }),
    })
    .then(response => response.json())
    .then(data => console.log('User data saved:', data))
    .catch(error => console.error('Error saving user data:', error));
}

// Function to load user data from the server
function loadUserData() {
    const userId = tg.initDataUnsafe?.user?.id || userIdFallback;
    if (userId) {
        fetch(`/api/getUserData?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                gains = data.gains || 0;
                level = data.level || 1;

                // Update window.boosts with the loaded boosts data
                if (data.boostsData && typeof data.boostsData === 'object' && Object.keys(data.boostsData).length > 0) {
                    window.boosts = data.boostsData;

                    // Parse expirationTime back to numbers
                    Object.keys(window.boosts).forEach(category => {
                        window.boosts[category].forEach(boost => {
                            if (boost.expirationTime) {
                                boost.expirationTime = Number(boost.expirationTime);
                            }
                        });
                    });
                } else {
                    // If boostsData is empty, initialize window.boosts
                    if (!window.boosts || Object.keys(window.boosts).length === 0) {
                        window.boosts = getDefaultBoosts();
                    }
                }

                // Apply active boosts
                applyLoadedBoosts();

                updateUI();
            })
            .catch(error => console.error('Error loading user data:', error));
    }
}

// Function to get the default boosts data
function getDefaultBoosts() {
    return {
    nutrition: [
        { name: "Protein Shake", icon: "🥤", description: "Boost muscle recovery", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Pre-workout", icon: "⚡", description: "Increase energy for workouts", price: 300, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Creatine", icon: "💊", description: "Enhance strength and muscle mass", price: 400, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "BCAA", icon: "🧪", description: "Support muscle growth and recovery", price: 350, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Coffee", icon: "☕", description: "Quick energy boost", price: 200, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Energy drink", icon: "🥫", description: "Sustained energy boost", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Steak", icon: "🥩", description: "High protein meal", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Eggs", icon: "🥚", description: "Protein-rich snack", price: 200, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Chicken", icon: "🍗", description: "Lean protein source", price: 350, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Hot-dog", icon: "🌭", description: "Quick protein fix", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } }
    ],
    workout: [
        { name: "Chest Day", icon: "🏋️", description: "Focus on chest muscles", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Back Day", icon: "🏋️", description: "Strengthen your back", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Leg Day", icon: "🦵", description: "Build lower body strength", price: 650, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Abs Workout", icon: "🦹‍♂️", description: "Core strength training", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Shoulder Day", icon: "🦾", description: "Develop shoulder muscles", price: 550, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Biceps Workout", icon: "💪", description: "Focus on biceps", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Triceps Workout", icon: "🦾", description: "Strengthen triceps", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "HIIT", icon: "🏃‍♂️", description: "High-intensity interval training", price: 700, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Endurance Cardio", icon: "🏃", description: "Boost cardiovascular endurance", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Calisthenics", icon: "🤸", description: "Bodyweight exercises", price: 550, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Street Workout", icon: "🤸", description: "Outdoor fitness training", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } }
    ],
    activities: [
        { name: "Yoga", icon: "🧘", description: "Improve flexibility and mindfulness", price: 400, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Dance Class", icon: "🕺", description: "Fun cardio workout", price: 450, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Muay Thai", icon: "🥊", description: "Thai boxing training", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Karate", icon: "🥋", description: "Martial arts practice", price: 550, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Swimming", icon: "🏊", description: "Full body workout", price: 500, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Jogging", icon: "🏃‍♀️", description: "Outdoor cardio session", price: 300, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Cycling", icon: "🚴", description: "Low-impact cardio workout", price: 400, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } }
    ],
    resting: [
        { name: "Sauna", icon: "🧖", description: "Relaxation & recovery", price: 350, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Massage", icon: "🧖", description: "Muscle relaxation therapy", price: 600, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Ice Bath", icon: "🧊", description: "Reduce inflammation", price: 400, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Cold Shower", icon: "🚿", description: "Boost recovery and alertness", price: 200, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "20 Min Nap", icon: "😴", description: "Quick energy recharge", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "7 Hour Sleep", icon: "🛌", description: "Full night's rest", price: 800, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Walk a Dog", icon: "🐕", description: "Light activity and stress relief", price: 300, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Breathing Exercise", icon: "🧘‍♂️", description: "Improve focus and relaxation", price: 250, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Meditation", icon: "🧠", description: "Mental relaxation and clarity", price: 350, active: false, effect: { type: "multiplier", value: 5, duration: 20 } }
    ]
};
}

// Function to apply loaded boosts
function applyLoadedBoosts() {
    const now = Date.now();
    Object.keys(window.boosts).forEach(category => {
        window.boosts[category].forEach(boost => {
            if (boost.active && boost.expirationTime) {
                boost.expirationTime = Number(boost.expirationTime);

                // Debug logs
                console.log(`boost.expirationTime: ${boost.expirationTime} (${typeof boost.expirationTime})`);
                console.log(`now: ${now} (${typeof now})`);

                if (boost.active && boost.expirationTime && !isNaN(boost.expirationTime) && boost.expirationTime > now) {
                    const remainingDuration = boost.expirationTime - now;
                    const boostEffect = boostEffects[boost.name];

                    if (boostEffect && boostEffect.type === "multiplier") {
                        boostMultiplier *= boostEffect.value;

                        // Set a timeout to remove the boost effect after the remaining duration
                        setTimeout(() => {
                            console.log(`Boost ${boost.name} has expired.`);
                            boostMultiplier /= boostEffect.value;
                            boost.active = false;
                            boost.expirationTime = null;

                            updateUI();
                            initializeBoostsPage();
                            updateProfilePage();
                            saveUserData();
                        }, remainingDuration);
                    } else {
                        console.error(`No boost effect found for ${boost.name}`);
                    }
                } else {
                    // Boost has expired or invalid expirationTime
                    boost.active = false;
                    boost.expirationTime = null;
                }
            }
        });
    });
}

// Function to handle pumping action
function pump(e) {
    e.preventDefault();
    e.stopPropagation();
    if (energy > 0) {
        gains += gainsPerRep * boostMultiplier;
        energy = Math.max(0, energy - 1);
        updateLevel();
        updateUI();
        saveUserData();

        const character = document.getElementById('character');
        if (character) {
            character.style.transform = 'scale(1.1)';
            setTimeout(() => { character.style.transform = 'scale(1)'; }, 100);
        }
    }
}

// Function to update the leaderboard
function updateLeaderboard() {
    fetch('/api/leaderboard')
    .then(response => response.json())
    .then(data => {
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (leaderboardBody) {
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
        }
    })
    .catch(error => console.error('Error updating leaderboard:', error));
}

// Function to initialize the Boosts page
function initializeBoostsPage() {
    console.log("Initializing Boosts page");
    const categoryButtons = document.querySelectorAll('#boosts-page .category-btn');

    // Set default category
    let defaultCategory = 'nutrition';
    categoryButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === defaultCategory) {
            btn.classList.add('active');
        }
    });

    displayBoosts(defaultCategory);
    setupBoostsCategoryButtons();
}

// Function to display boosts for a category
function displayBoosts(category) {
    const boostItems = document.getElementById('boost-items');
    if (boostItems && window.boosts && window.boosts[category]) {
        boostItems.innerHTML = ''; // Clear current boosts

        window.boosts[category]
            .filter(boost => !boost.active) // Only include boosts that are not active
            .forEach(boost => {
                const boostElement = document.createElement('div');
                boostElement.className = 'boost-item';
                boostElement.innerHTML = `
                    <div class="boost-icon">${boost.icon}</div>
                    <div class="boost-content">
                        <div class="boost-name">${boost.name}</div>
                        <div class="boost-description">${boost.description}</div>
                    </div>
                    <div class="boost-price">
                        <img src="/public/images/bicep-icon-yellow.png" alt="Price" class="price-icon">
                        ${boost.price}
                    </div>
                `;
                boostItems.appendChild(boostElement); // Add boost to the page

                // Attach click handler
                boostElement.addEventListener('click', handleBoostActivation);
            });
    } else {
        console.error('Boosts data not available for category:', category);
        if (boostItems) {
            boostItems.innerHTML = '<p>No boosts available.</p>';
        }
    }
}

// Function to set up category buttons on the Boosts page
function setupBoostsCategoryButtons() {
    console.log("Setting up boost category buttons");
    const categoryButtons = document.querySelectorAll('#boosts-page .category-btn');
    console.log("Found", categoryButtons.length, "category buttons");

    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Category button clicked:", button.dataset.category);
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayBoosts(button.dataset.category);
        });
    });
}

// Function to handle boost activation
function handleBoostActivation(event) {
    const boostElement = event.currentTarget;
    const boostName = boostElement.querySelector('.boost-name').textContent;
    const boostPrice = parseInt(boostElement.querySelector('.boost-price').textContent);

    const boostEffect = boostEffects[boostName];

    if (!boostEffect) {
        console.error(`No effect data found for boost: ${boostName}`);
        return;
    }

    showBoostPopUp(boostName, boostPrice, boostEffect);
}

// Function to show the boost confirmation popup
function showBoostPopUp(boostName, boostPrice, boostEffect) {
    // Update popup message
    const popupMessage = document.getElementById('boost-popup-message');
    if (popupMessage) {
        popupMessage.textContent = `Activate ${boostName} for ${boostPrice} gains?`;
    } else {
        console.error('Popup message element not found');
    }

    // Show the popup
    const boostPopup = document.getElementById('boost-popup');
    if (boostPopup) {
        boostPopup.style.display = 'flex';
    } else {
        console.error('Boost popup element not found');
        return;
    }

    // Clean up existing event listeners
    const confirmButton = document.getElementById('confirm-boost');
    const closeButton = document.getElementById('close-boost-popup');

    // Check if buttons are found
    if (!confirmButton || !closeButton) {
        console.error('One or more buttons not found in the boost popup');
        return;
    }

    // Remove existing event listeners by cloning the buttons
    confirmButton.replaceWith(confirmButton.cloneNode(true));
    closeButton.replaceWith(closeButton.cloneNode(true));

    // Re-select the buttons after cloning
    const newConfirmButton = document.getElementById('confirm-boost');
    const newCloseButton = document.getElementById('close-boost-popup');

    // Update the button text
    newConfirmButton.textContent = 'Pump Me';

    // Attach event listeners
    newConfirmButton.addEventListener('click', function () {
        confirmBoost(boostName, boostPrice, boostEffect);
    });

    newCloseButton.addEventListener('click', function () {
        closeBoostPopup();
    });
}

// Function to confirm boost activation
function confirmBoost(boostName, boostPrice, boostEffect) {
    console.log('Confirming boost:', { boostName, boostPrice, boostEffect });

    if (gains >= boostPrice) {
        gains -= boostPrice;

        console.log('Applying boost with effect:', boostEffect);
        applyBoostEffect(boostName, boostEffect);  // Apply boost effect
        updateUI();
        closeBoostPopup(); // Close the popup after confirmation
    } else {
        closeBoostPopup();
        showInsufficientGainsMessage(boostName);
    }
}

// Function to close the boost popup
function closeBoostPopup() {
    const boostPopup = document.getElementById('boost-popup');
    if (boostPopup) {
        boostPopup.style.display = 'none';
    }
}

// Function to apply the boost effect
function applyBoostEffect(boostName, boostEffect) {
    if (!boostEffect) {
        console.error(`Boost effect is undefined for boost: ${boostName}`);
        return;
    }

    console.log('Applying boost effect:', { boostName, boostEffect });

    if (boostEffect.type === "multiplier") {
        boostMultiplier *= boostEffect.value;

        const expirationTime = Date.now() + boostEffect.duration * 1000;

        console.log(`Boost ${boostName} activated. Expires at: ${new Date(expirationTime).toISOString()}`);

        // Mark the boost as active in window.boosts
        markBoostAsActive(boostName, expirationTime);

        // Save user data after updating boosts
        saveUserData();

        // Set a timeout to remove the boost effect after its duration
        setTimeout(() => {
            console.log(`Boost ${boostName} expired at ${new Date().toISOString()}`);
            boostMultiplier /= boostEffect.value;
            markBoostAsInactive(boostName);

            updateUI();
            initializeBoostsPage(); // Refresh the Boosts page
            updateProfilePage();    // Refresh the Profile page
            saveUserData(); // Save data after boost expires
        }, boostEffect.duration * 1000);

        // Update the UI to reflect the boost
        updateUI();
        initializeBoostsPage(); // Refresh the Boosts page
        updateProfilePage();    // Refresh the Profile page
    } else {
        console.error(`Unsupported boost effect type: ${boostEffect.type}`);
    }
}

// Helper function to mark a boost as active
function markBoostAsActive(boostName, expirationTime) {
    Object.keys(window.boosts).forEach(category => {
        window.boosts[category].forEach(boost => {
            if (boost.name === boostName) {
                boost.active = true;
                boost.expirationTime = expirationTime;
            }
        });
    });
}

// Helper function to mark a boost as inactive
function markBoostAsInactive(boostName) {
    Object.keys(window.boosts).forEach(category => {
        window.boosts[category].forEach(boost => {
            if (boost.name === boostName) {
                boost.active = false;
                delete boost.expirationTime;
            }
        });
    });
}

// Function to update the display of active boosts
function updateActiveBoostsDisplay() {
    const activeBoostsContainer = document.getElementById('active-boosts-container');
    if (activeBoostsContainer) {
        activeBoostsContainer.innerHTML = '';
        const now = Date.now();

        // Collect all active boosts from window.boosts
        const activeBoostsList = [];
        Object.keys(window.boosts).forEach(category => {
            window.boosts[category].forEach(boost => {
                if (boost.active && boost.expirationTime && !isNaN(boost.expirationTime) && boost.expirationTime > now) {
                    activeBoostsList.push(boost);
                } else if (boost.active) {
                    // Boost has expired
                    boost.active = false;
                    boost.expirationTime = null;
                }
            });
        });

        if (activeBoostsList.length > 0) {
            activeBoostsList.forEach(boost => {
                const remainingTime = Math.ceil((boost.expirationTime - now) / 1000); // in seconds
                const durationString = formatTime(remainingTime); // Format the remaining time

                const boostElement = document.createElement('div');
                boostElement.className = 'active-boost-item';
                boostElement.innerHTML = `
                    <div class="boost-name">${boost.name}</div>
                    <div class="boost-duration">${durationString}</div>
                `;
                activeBoostsContainer.appendChild(boostElement);
            });
        } else {
            activeBoostsContainer.innerHTML = '<p>No active boosts</p>';
        }
    }
}

// Function to format time in hh:mm:ss format
function formatTime(seconds) {
    console.log('Formatting time for:', seconds);

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    let formattedTime;
    if (h > 0) {
        formattedTime = `${h}h ${m}m ${s}s`;
    } else if (m > 0) {
        formattedTime = `${m}m ${s}s`;
    } else {
        formattedTime = `${s}s`;
    }

    console.log('Formatted time:', formattedTime);
    return formattedTime;
}

// Function to show insufficient gains message
function showInsufficientGainsMessage(boostName) {
    const popupContent = `
        <p>You do not have enough Gains to activate "${boostName}".</p>
        <div class="button-container">
            <button onclick="closeTaskPopup()" class="popup-button secondary-button">OK</button>
        </div>
    `;
    showTaskPopup(popupContent);
}

// Function to update the Profile page
function updateProfilePage() {
    const attributes = [
        { name: "Strength", value: 20 },
        { name: "Endurance", value: 18 },
        { name: "Recovery", value: 22 },
        { name: "Technique", value: 15 },
        { name: "Motivation", value: 25 },
        { name: "Charisma", value: 17 },
        { name: "Risk of Injury", value: 25 }
    ];

    const attributesContainer = document.getElementById('attributes-container');
    if (attributesContainer) {
        attributesContainer.innerHTML = '';
        attributes.forEach(attr => {
            const attrElement = document.createElement('div');
            attrElement.className = 'attribute-item';
            attrElement.innerHTML = `
                <div class="attribute-name">${attr.name}</div>
                <div class="attribute-bar-container">
                    <div class="attribute-bar" style="width: ${attr.value}%"></div>
                </div>
                <div class="attribute-value">${attr.value}</div>
            `;
            attributesContainer.appendChild(attrElement);
        });
    }

    const activeBoostsContainer = document.getElementById('active-boosts-container');

    if (activeBoostsContainer) {
        activeBoostsContainer.innerHTML = ''; // Clear the container

        const now = Date.now(); // Get current time in milliseconds

        // Collect all active boosts from window.boosts
        const activeBoostsList = [];
        Object.keys(window.boosts).forEach(category => {
            window.boosts[category].forEach(boost => {
                if (boost.active && boost.expirationTime) {
                    boost.expirationTime = Number(boost.expirationTime);

                    // Debug logs
                    console.log(`boost.expirationTime: ${boost.expirationTime} (${typeof boost.expirationTime})`);
                    console.log(`now: ${now} (${typeof now})`);

                    if (boost.active && boost.expirationTime && !isNaN(boost.expirationTime) && boost.expirationTime > now) {
                        activeBoostsList.push(boost);
                    } else {
                        // Boost has expired or invalid expirationTime
                        boost.active = false;
                        boost.expirationTime = null;
                    }
                }
            });
        });

        if (activeBoostsList.length > 0) {
            activeBoostsList.forEach(boost => {
                const remainingTime = Math.ceil((boost.expirationTime - now) / 1000); // in seconds
                const durationString = formatTime(remainingTime); // Format the remaining time

                const boostElement = document.createElement('div');
                boostElement.className = 'active-boost-item';
                boostElement.innerHTML = `
                    <div class="boost-name">${boost.name}</div>
                    <div class="boost-duration">${durationString}</div>
                `;
                activeBoostsContainer.appendChild(boostElement);
            });
        } else {
            activeBoostsContainer.innerHTML = '<p>No active boosts</p>';
        }
    } else {
        console.error('Active boosts container not found');
    }
}

// Task data (you can customize this according to your needs)
const tasks = [
    { id: 1, name: "Complete 10 push-ups", reward: 100, completed: false },
    { id: 2, name: "Run 5km", reward: 200, completed: false },
    { id: 3, name: "Attend a yoga class", reward: 150, completed: false },
    { id: 4, name: "Drink 2 liters of water", reward: 50, completed: false },
    { id: 5, name: "Sleep 8 hours", reward: 75, completed: false }
];

// Function to initialize the Tasks page
function initializeTasksPage() {
    const taskList = document.getElementById('task-list');
    if (taskList) {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-name">${task.name}</div>
                <div class="task-reward">
                    <img src="/public/images/bicep-icon-yellow.png" alt="Reward" class="reward-icon">
                    ${task.reward}
                </div>
                <button class="task-complete-btn" data-task-id="${task.id}" ${task.completed ? 'disabled' : ''}>
                    ${task.completed ? 'Completed' : 'Complete'}
                </button>
            `;
            taskList.appendChild(taskItem);

            // Attach event listener to the complete button
            const completeBtn = taskItem.querySelector('.task-complete-btn');
            completeBtn.addEventListener('click', handleTaskCompletion);
        });
    }
}

const socialTasks = {
    socials: [
        {
            id: 'telegram', 
            name: "PUMPME.APP on Telegram", 
            icon: "telegram-icon.png", 
            reward: 5000, 
            completed: false, 
            link: "https://t.me/pumpme_me"
        },
        {
            id: 'instagram', 
            name: "PUMPME.APP on Instagram", 
            icon: "instagram-icon.png", 
            reward: 5000, 
            completed: false, 
            link: "https://www.instagram.com/pumpme.me/"
        },
        {
            id: 'twitter', 
            name: "PUMPME.APP on Twitter", 
            icon: "twitter-icon.png", 
            reward: 5000, 
            completed: false, 
            link: "https://twitter.com/Pumpme_me"
        },
        {
            id: 'like-retweet', 
            name: "Like & Retweet on Twitter", 
            icon: "twitter-icon.png", 
            reward: 5000, 
            completed: false, 
            link: "https://twitter.com/Pumpme_me/status/123456789"
        }
    ],
    inGame: [
        {
            id: 'reps-50k', 
            name: "Complete 50,000 Reps", 
            icon: "reps-icon.png", 
            reward: 50000, 
            completed: false
        },
        {
            id: 'reps-500k', 
            name: "Complete 500,000 Reps", 
            icon: "reps-icon.png", 
            reward: 500000, 
            completed: false
        },
        {
            id: 'level-3', 
            name: "Reach Level 3", 
            icon: "level-icon.png", 
            reward: 30000, 
            completed: false
        },
        {
            id: 'level-7', 
            name: "Reach Level 7", 
            icon: "level-icon.png", 
            reward: 70000, 
            completed: false
        },
        {
            id: 'level-10', 
            name: "Reach Level 10", 
            icon: "level-icon.png", 
            reward: 100000, 
            completed: false
        },
        {
            id: 'purchase-boosts', 
            name: "Purchase 50 Boosts", 
            icon: "boost-icon.png", 
            reward: 5000, 
            completed: false
        }
    ],
    referrals: [
        {
            id: 'refer-friend', 
            name: "Refer a Friend", 
            icon: "refer-friend-icon.png", 
            reward: 10000, 
            completed: false
        },
        {
            id: 'refer-5-friends', 
            name: "Refer 5 Friends", 
            icon: "refer-friend-icon.png", 
            reward: 50000, 
            completed: false
        }
    ],
    completed: []
};

function setupTaskCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.dataset.category;
            displayTasks(category); // Display tasks for the clicked category
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupTaskCategoryButtons();
    displayTasks('socials'); // Display the default category tasks (socials)
});

function displayTasks(category) {
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) {
        console.error("Tasks container not found");
        return;
    }

    tasksContainer.innerHTML = ''; // Clear existing tasks

    // Check if the category exists in socialTasks
    if (!socialTasks[category]) {
        console.error(`No tasks found for category: ${category}`);
        tasksContainer.innerHTML = '<p>No tasks available for this category.</p>';
        return;
    }

    // Iterate through the tasks and create task elements
    socialTasks[category].forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'social-task';
        taskElement.innerHTML = `
            <img src="/public/images/${task.icon}" alt="${task.name}" class="social-task-icon">
            <div class="social-task-content">
                <div class="social-task-name">${task.name}</div>
                <div class="social-task-reward">
                    <img src="/public/images/bicep-icon-yellow.png" alt="Gains" class="gains-icon">
                    +${task.reward.toLocaleString()}
                </div>
            </div>
            <div class="social-task-status">
                <img src="/public/images/${task.completed ? 'check-icon.png' : 'chevron-right-icon.png'}" 
                     alt="${task.completed ? 'Completed' : 'Incomplete'}" 
                     class="${task.completed ? 'status-icon' : 'chevron-icon'}">
            </div>
        `;

        // If the task is not completed, make it clickable
        if (!task.completed) {
            taskElement.addEventListener('click', () => handleTaskClick(task));
        }

        tasksContainer.appendChild(taskElement);
    });
}

// Function to handle task completion
function handleTaskCompletion(event) {
    const button = event.currentTarget;
    const taskId = parseInt(button.dataset.taskId);
    const task = tasks.find(t => t.id === taskId);

    if (task && !task.completed) {
        task.completed = true;
        gains += task.reward;
        updateUI();
        saveUserData();
        showRewardPopup(task.reward);

        // Update the button state
        button.textContent = 'Completed';
        button.disabled = true;
    }
}

// Function to show a popup when a task is completed
function showRewardPopup(reward) {
    const popupContent = `
        <h2>Task Completed!</h2>
        <p>You've earned ${reward} gains!</p>
        <div class="button-container">
            <button onclick="closeTaskPopup()" class="popup-button ok-button">OK</button>
        </div>
    `;
    showTaskPopup(popupContent);
}

// Function to show a general popup
function showTaskPopup(content) {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.className = 'task-popup-overlay';

    // Create the popup content container
    const popupContent = document.createElement('div');
    popupContent.className = 'task-popup-content';

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'popup-close task-popup-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = closeTaskPopup;
    popupContent.appendChild(closeButton);

    // Insert the content
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = content;
    popupContent.appendChild(contentContainer);

    // Append the popup content to the overlay
    overlay.appendChild(popupContent);

    // Append the overlay to the body
    document.body.appendChild(overlay);
}

// Function to close the task popup
function closeTaskPopup() {
    const overlay = document.querySelector('.task-popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Function to update fitness level based on gains
function updateLevel() {
    const currentLevel = fitnessLevels.find(l => gains >= l.minGains && gains <= l.maxGains);
    if (currentLevel && currentLevel.level !== level) {
        level = currentLevel.level;
        gainsPerRep = currentLevel.gainsPerRep;
        gainsPerDay = currentLevel.gainsPerDay;
        console.log(`Leveled up to ${currentLevel.name}!`);
    }
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    // Hide all pages except the gym page on initial load
    pages.forEach(page => {
        if (page.id === 'gym-page') {
            page.style.display = 'flex';
        } else {
            page.style.display = 'none';
        }
    });

    // Ensure the gym button is active on initial load
    const gymButton = document.getElementById('gym-btn');
    if (gymButton) {
        gymButton.classList.add('active');
    }

    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Nav button clicked:", btn.id);
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pages.forEach(page => page.style.display = 'none');
            pages[index].style.display = 'flex';
            if (btn.id === 'boosts-btn') {
                initializeBoostsPage();
            } else if (btn.id === 'top-pumpers-btn') {
                updateLeaderboard();
            } else if (btn.id === 'profile-btn') {
                updateProfilePage();
            } else if (btn.id === 'tasks-btn') {
                initializeTasksPage();
            }
        });
    });

    // Initialize the gym page
    const pumpMeContainer = document.getElementById('pump-me-container');
    const character = document.getElementById('character');
    [pumpMeContainer, character].forEach(element => {
        if (element) {
            element.addEventListener('touchstart', pump, { passive: false });
            element.addEventListener('mousedown', pump);
        }
    });

    setInterval(() => {
        if (energy < 1000) {
            energy = Math.min(1000, energy + 1);
            updateUI();
        }
    }, 1000);

    setInterval(() => {
        gains += gainsPerDay * boostMultiplier / (24 * 60 * 60);
        updateLevel();
        updateUI();
    }, 1000);

    loadUserData();
    updateUI();

    tg.ready();
    tg.expand();
});

// ... (Include other functions like tasks, etc., if needed)
