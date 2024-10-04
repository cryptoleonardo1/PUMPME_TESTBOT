// app_v2.js

// Initialize variables
let gains = 0;
let level = 1;
let gainsPerRep = 1;
let gainsPerDay = 0;
let energy = 1000;
let boostMultiplier = 1;
let totalReps = 0; // Initialize at the top of your script
let totalBoostsPurchased = 0;
let totalReferrals = 0;
let activeBoosts = [];
// Boosts object
let boosts = {
    doubleGains: { active: false },
    tripleGains: { active: false }
    // Removed autoClicker
};

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
    "8 Hour Sleep": { type: "multiplier", value: 1.5, duration: 3600 },
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
        { name: "8 Hour Sleep", icon: "🛌", description: "Full night's rest", price: 800, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
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
    const userId = tg.initDataUnsafe?.user?.id || userIdFallback;
    const username = tg.initDataUnsafe?.user?.username || '';
    console.log('Saving user data with userId:', userId, 'and username:', username);
  
    if (userId) {
      fetch('/api/saveUserData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          username: username,
          gains: gains,
          level: level,
          boostsData: boosts,
          tasksData: socialTasks,
          totalReps: totalReps,
          totalBoostsPurchased: totalBoostsPurchased,
          totalReferrals: totalReferrals
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('User data saved successfully:', data);
        })
        .catch(error => console.error('Error saving user data:', error));
    } else {
      console.error('User ID not available');
    }
}

// Function to load user data from the server
function loadUserData() {
    const userId = tg.initDataUnsafe?.user?.id || userIdFallback;
    console.log('Loading user data for userId:', userId);
  
    if (userId) {
      fetch(`/api/getUserData?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
          console.log('User data loaded from server:', data);
  
          gains = data.gains || 0;
          level = data.level || 1;
          boosts = data.boostsData || boosts;
          socialTasks = data.tasksData || socialTasks;
          totalReps = data.totalReps || 0;
          totalBoostsPurchased = data.totalBoostsPurchased || 0;
          totalReferrals = data.totalReferrals || 0;
                
             
             
             
             /*
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

               // Only update socialTasks if tasksData from server is non-empty
               if (data.tasksData && Object.keys(data.tasksData).length > 0) {
                socialTasks = data.tasksData;
                console.log('Loaded tasksData from server:', socialTasks);
            } else {
                console.log('No tasksData loaded from server, using local socialTasks');
            }

            // Apply active boosts
            applyLoadedBoosts();
            */

            updateUI();
        updateLevel();

        // Check for task completion in case any tasks are immediately completed upon loading
        checkTaskCompletion();
      })
      .catch(error => console.error('Error loading user data:', error));
  } else {
    console.error('User ID not available');
  }
}

/*
// Function to get default social tasks
function getDefaultSocialTasks() {
    return {
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
                completed: false,
                link: "https://pumpme.app/refer"
            },
            {
                id: 'refer-5-friends',
                name: "Refer 5 Friends",
                icon: "refer-friend-icon.png",
                reward: 50000,
                completed: false,
                link: "https://pumpme.app/refer"
            }
        ],
        completed: []
    };
}
*/

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
        { name: "8 Hour Sleep", icon: "🛌", description: "Full night's rest", price: 800, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
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

// Function to handle pumping action (e.g., clicking on the character)
function pump(e) {
    // Increment total reps
    totalReps += 1;

    // Calculate gains per click
    let gainsPerClick = 1; // Base gains per click

    // Apply boosts
    if (boosts.doubleGains?.active) {
        gainsPerClick *= 2;
    }
    if (boosts.tripleGains?.active) {
        gainsPerClick *= 3;
    }
    
    // Perform scale-up animation
    const characterElement = e.target;
    characterElement.classList.add('scale-up');

    // Remove the class after the animation ends to allow it to be triggered again
    characterElement.addEventListener('animationend', () => {
        characterElement.classList.remove('scale-up');
    }, { once: true });

    // Increment gains
    gains += gainsPerClick;

    // Update UI elements
    updateUI();

    // Check for level up
    updateLevel();

    // Check if any tasks are completed
    checkTaskCompletion();

    // Save user data
    saveUserData();
}
 
function animateCharacter() {
    const character = document.getElementById('character');
    if (character) {
        character.classList.add('scale-up');

        // Remove the class after the animation ends to allow it to run again
        character.addEventListener('animationend', () => {
            character.classList.remove('scale-up');
        }, { once: true }); // The { once: true } option ensures the event listener is removed after it runs
    }
}

// Function to update the leaderboard
function updateLeaderboard() {
    fetch('/api/leaderboard')
      .then(response => response.json())
      .then(data => {
        console.log('Leaderboard data received from server:', data); // Add this line
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (leaderboardBody) {
          leaderboardBody.innerHTML = '';
          data.forEach((user) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${user.rank}</td>
              <td>${user.username}</td> <!-- Changed from user.displayName to user.username -->
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

// Function to handle purchasing a boost
function purchaseBoost(boostType) {
    // Define the cost of each boost type
    const boostCosts = {
        doubleGains: 100,   // Cost for Double Gains boost
        tripleGains: 300    // Cost for Triple Gains boost
    };

    // Check if the boostType is valid
    if (!boostCosts[boostType]) {
        console.error(`Invalid boost type: ${boostType}`);
        return;
    }

    const cost = boostCosts[boostType];

    // Check if the user has enough gains
    if (gains >= cost) {
        // Deduct the cost
        gains -= cost;

        // Activate the boost
        boosts[boostType] = { active: true };

        // Increment total boosts purchased
        totalBoostsPurchased += 1;

        // Update UI elements
        updateUI();

        // Check for level up
        updateLevel();

        // Check if any tasks are completed
        checkTaskCompletion();

        // Save user data
        saveUserData();

        // Provide feedback to the user
        alert(`${boostType === 'doubleGains' ? 'Double Gains' : 'Triple Gains'} boost purchased!`);
    } else {
        // Not enough gains
        alert('Not enough gains to purchase this boost.');
    }
}

// Function to handle adding a referral
function addReferral() {
    // Increment total referrals
    totalReferrals += 1;
  
    // Update UI elements if necessary
    updateUI();
  
    // Check if any referral tasks are completed
    checkTaskCompletion();
  
    // Save user data
    saveUserData();
  
    // Optionally, provide feedback to the user
    alert('Referral added successfully!');
  }  

// Tasks Tasks Tasks Tasks Tasks Tasks Tasks
// Function to initialize the Tasks page
function initializeTasksPage() {
    setupTaskCategoryButtons();

    // Set default category to 'socials'
    const defaultCategory = 'socials';
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');

    // Remove 'active' class from all buttons and add to the default one
    categoryButtons.forEach(btn => {
        if (btn.dataset.category === defaultCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    displayTasks(defaultCategory); // Display tasks for the default category
}

// Function to show a popup when a task is completed
function showRewardPopup(reward) {
    const popupContent = `
        <div class="popup-header">
            <button class="popup-close">&times;</button>
        </div>
        <div class="popup-body">
            <h2>Task Completed!</h2>
            <p>You've earned ${reward.toLocaleString()} gains!</p>
            <div class="button-container">
                <button class="popup-button ok-button">OK</button>
            </div>
        </div>
    `;
    showTaskPopup(popupContent);
}

let socialTasks = {
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
            name: "PUMPME.APP on X", 
            icon: "twitter-icon.png", 
            reward: 5000, 
            completed: false, 
            link: "https://twitter.com/Pumpme_me"
        },
        {
            id: 'like-retweet', 
            name: "Like & Retweet on X", 
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
            completed: false,
            condition: () => totalReps >= 50000
        },
        {
            id: 'reps-500k', 
            name: "Complete 500,000 Reps", 
            icon: "reps-icon.png", 
            reward: 500000, 
            completed: false,
            condition: () => totalReps >= 500000
        },
        {
            id: 'level-3', 
            name: "Reach Level 3", 
            icon: "level-icon.png", 
            reward: 300000, 
            completed: false
        },
        {
            id: 'level-7', 
            name: "Reach Level 7", 
            icon: "level-icon.png", 
            reward: 700000, 
            completed: false
        },
        {
            id: 'level-10', 
            name: "Reach Level 10", 
            icon: "level-icon.png", 
            reward: 10000000, 
            completed: false
        },
        {
            id: 'purchase-boosts', 
            name: "Purchase 50 Boosts", 
            icon: "boost-icon.png", 
            reward: 50000, 
            completed: false,
            condition: () => totalBoostsPurchased >= 50
        },
        {
            id: 'purchase-boosts', 
            name: "Purchase 500 Boosts", 
            icon: "boost-icon.png", 
            reward: 5000000, 
            completed: false,
            condition: () => totalBoostsPurchased >= 50
        }
    ],
    referrals: [
        {
            id: 'refer-10-friends', 
            name: "Refer 10 Friends", 
            icon: "refer-friend-icon.png", 
            reward: 10000, 
            completed: false,
            condition: () => totalReferrals >= 10
        },
        {
            id: 'refer-30-friends', 
            name: "Refer 30 Friends", 
            icon: "refer-friend-icon.png", 
            reward: 50000, 
            completed: false,
            condition: () => totalReferrals >= 30
        },
        {
            id: 'refer-50-friends', 
            name: "Refer 50 Friends", 
            icon: "refer-friend-icon.png", 
            reward: 50000, 
            completed: false,
            condition: () => totalReferrals >= 50
        }
    ],
    completed: []
};

function setupTaskCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;

            // Remove 'active' class from all buttons and add to the clicked one
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            displayTasks(category); // Display tasks for the selected category
        });
    });
}

function displayTasks(category) {
    console.log(`Displaying tasks for category: ${category}`);
    console.log('socialTasks:', socialTasks);

    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) {
        console.error("Tasks container not found");
        return;
    }

    tasksContainer.innerHTML = ''; // Clear existing tasks

    if (!socialTasks[category]) {
        console.error(`No tasks found for category: ${category}`);
        tasksContainer.innerHTML = '<p>There are no available tasks.</p>';
        return;
    }

    let tasksToDisplay = socialTasks[category];

    // Exclude completed tasks unless the category is 'completed'
    if (category !== 'completed') {
        tasksToDisplay = tasksToDisplay.filter(task => !task.completed);
    }

    if (tasksToDisplay.length === 0) {
        tasksContainer.innerHTML = '<p>There are no available tasks.</p>';
        return;
    }

    tasksToDisplay.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'social-task';

        // Modify appearance if needed
        if (category === 'completed') {
            taskElement.classList.add('completed-task');
        }

        taskElement.innerHTML = `
            <img src="/public/images/${task.icon}" alt="${task.name}" class="social-task-icon">
            <div class="social-task-content">
                <div class="social-task-name">${task.name}</div>
                <div class="social-task-reward">
                    <img src="/public/images/bicep-icon-yellow.png" alt="Gains" class="gains-icon">
                    +${task.reward.toLocaleString()}
                </div>
            </div>
        `;

        // Make tasks clickable only in 'socials' category
        if (category === 'socials' && !task.completed) {
            taskElement.addEventListener('click', () => handleTaskClick(task));
            taskElement.style.cursor = 'pointer';
        }

        tasksContainer.appendChild(taskElement);
    });
}

function handleTaskClick(task) {
    if (task.completed) return;

    let actionText = 'Complete the task';

    // Customize actionText based on task id if needed
    switch (task.id) {
        case 'instagram':
            actionText = 'Follow Us On Instagram';
            break;
        case 'telegram':
            actionText = 'Join Our Telegram Chat';
            break;
        case 'twitter':
            actionText = 'Follow Us On X';
            break;
        case 'like-retweet':
            actionText = 'Like & Retweet Our Post';
            break;
        default:
            actionText = 'Complete the task';
            break;
    }

    const popupContent = `
        <div class="popup-header">
            <button class="popup-close">&times;</button>
        </div>
        <div class="popup-body">
            <img src="/public/images/max1.png" alt="PUMP ME Character" class="character-image">
            <p>${actionText}</p>
            <div class="button-container">
                <button class="popup-button primary-button" id="pump-me-button">Pump Me</button>
            </div>
        </div>
    `;

    showTaskPopup(popupContent); // Show the task popup

    // Attach event listener to the "Pump Me" button
    const pumpMeButton = document.getElementById('pump-me-button');
    if (pumpMeButton) {
        pumpMeButton.addEventListener('click', () => {
            completeTask(task); // Complete the task when button is clicked
        });
    }
}

function completeTask(task) {
    // Open the desired website if the task has a link
    if (task.link) {
        window.open(task.link, '_blank');
    }

    // Mark the task as completed
    task.completed = true;

    // Add the task's reward to the user's gains
    gains += task.reward;
    updateLevel();
    updateUI();

    // Move the task to the "completed" category
    moveTaskToCompleted(task);

    // Show a reward popup (will update the popup content)
    showRewardPopup(task.reward);

    // Save user data
    saveUserData();
}

function moveTaskToCompleted(task) {
    // Find the category the task is in
    const category = Object.keys(socialTasks).find(cat => {
        return socialTasks[cat].includes(task);
    });
    if (category && category !== 'completed') {
        // Remove the task from its current category
        socialTasks[category] = socialTasks[category].filter(t => t !== task);

        // Add the task to the "completed" category
        socialTasks['completed'].push(task);

        // Save the updated socialTasks data
        saveUserData();

        // Update the tasks display if currently viewing the same category
        const activeCategoryButton = document.querySelector('.task-categories .category-btn.active');
        if (activeCategoryButton && activeCategoryButton.dataset.category === category) {
            displayTasks(category);
        }
    }
}

function checkTaskCompletion() {
    // Check In-Game Tasks
    if (socialTasks.inGame) {
        socialTasks.inGame.forEach(task => {
            if (!task.completed && typeof task.condition === 'function' && task.condition()) {
                completeAutomaticTask(task, 'inGame');
            }
        });
    }

    // Check Referral Tasks
    if (socialTasks.referrals) {
        socialTasks.referrals.forEach(task => {
            if (!task.completed && typeof task.condition === 'function' && task.condition()) {
                completeAutomaticTask(task, 'referrals');
            }
        });
    }

    // Optionally, you can check other categories that have tasks with conditions
}

function completeAutomaticTask(task, category) {
    // Mark the task as completed
    task.completed = true;

    // Add the task's reward to the user's gains
    gains += task.reward;
    updateLevel();
    updateUI();

    // Move the task to the "completed" category
    moveTaskToCompleted(task);

    // Optionally, display a notification to the user
    displayTaskCompletionNotification(task);

    // Save user data
    saveUserData();

    // Update tasks display if the current category is being viewed
    const activeCategoryButton = document.querySelector('.task-categories .category-btn.active');
    if (activeCategoryButton && activeCategoryButton.dataset.category === category) {
        displayTasks(category);
    }
}

function displayTaskCompletionNotification(task) {
    // Use a toast notification or an alert
    alert(`Congratulations! You've completed the task: "${task.name}" and earned ${task.reward.toLocaleString()} gains!`);
}


// Function to show a general popup
function showTaskPopup(content) {
    const taskPopup = document.getElementById('task-popup');
    const taskPopupContent = document.getElementById('task-popup-content');

    if (taskPopup && taskPopupContent) {
        taskPopupContent.innerHTML = content;

        // Attach event listener to close button in the popup content
        const closeButton = taskPopupContent.querySelector('.popup-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeTaskPopup);
        }

        // Attach event listener to "OK" button in the popup content, if present
        const okButton = taskPopupContent.querySelector('.popup-button.ok-button');
        if (okButton) {
            okButton.addEventListener('click', closeTaskPopup);
        }

        taskPopup.style.display = 'block';
    } else {
        console.error('Task popup elements not found');
    }
}

function closeTaskPopup() {
    const taskPopup = document.getElementById('task-popup');
    if (taskPopup) {
        taskPopup.style.display = 'none';
    } else {
        console.error('Task popup element not found');
    }
}

// Function to update fitness level based on gains
function updateLevel() {
    const currentLevel = fitnessLevels.find(l => gains >= l.minGains && gains <= l.maxGains);
    if (currentLevel && currentLevel.level !== level) {
        level = currentLevel.level;
        gainsPerRep = currentLevel.gainsPerRep;
        gainsPerDay = currentLevel.gainsPerDay;
        checkTaskCompletion();
        console.log(`Leveled up to ${currentLevel.name}!`);
    }
    checkTaskCompletion();
}

    // Bicep icon debugging
    const bicepIcon = document.getElementById('bicep-icon');
    if (bicepIcon) {
        bicepIcon.onload = function() {
            console.log('Bicep icon loaded successfully');
        };
        bicepIcon.onerror = function() {
            console.error('Failed to load bicep icon');
            // Fallback to a text representation if the image fails to load
            bicepIcon.style.display = 'none';
            bicepIcon.parentElement.textContent = 'ðŸ’ª';
        };
    } else {
        console.error('Bicep icon element not found');
    }

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Initialize Telegram Web Apps SDK
    const tg = window.Telegram.WebApp;
    tg.expand();

    // --- Event Listeners for Gym Page ---

    // Event listener for the character (pump action)
    const character = document.getElementById('character');
    if (character) {
        character.addEventListener('click', (e) => {
            console.log('Character clicked');
            pump(e); // Existing function to handle pumping action
            animateCharacter(); // Function to perform the scale-up animation
        });
    } else {
        console.error('Character element not found');
    }


    /*
    // Event listeners for boost purchase buttons
    const doubleGainsButton = document.getElementById('double-gains-btn');
    if (doubleGainsButton) {
        doubleGainsButton.addEventListener('click', () => {
            purchaseBoost('doubleGains');
        });
    } else {
        console.error('Double Gains button not found');
    }

    const tripleGainsButton = document.getElementById('triple-gains-btn');
    if (tripleGainsButton) {
        tripleGainsButton.addEventListener('click', () => {
            purchaseBoost('tripleGains');
        });
    } else {
        console.error('Triple Gains button not found');
    }
*/


    /*
    // Event listener for adding a referral (if you have this functionality)
    const addReferralButton = document.getElementById('add-referral-btn');
    if (addReferralButton) {
        addReferralButton.addEventListener('click', () => {
            addReferral();
        });
    } else {
        console.error('Add Referral button not found');
    }
    */

    // Get references to navigation buttons and pages
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    // Function to hide all pages and deactivate all nav buttons
    function hideAllPages() {
        pages.forEach(page => page.style.display = 'none');
        navButtons.forEach(btn => btn.classList.remove('active'));
    }

    // Set up navigation button event listeners
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Nav button clicked:", btn.id);

            // Hide all pages and deactivate all buttons
            hideAllPages();

            // Show the selected page and activate the button
            btn.classList.add('active');
            pages[index].style.display = 'flex';

            // Call initialization functions based on the page
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

    // Load user data and initialize the app
    loadUserData();

    // Set default active page and button (e.g., 'gym')
    const defaultPageIndex = 0; // Index of the default page in the 'pages' NodeList
    hideAllPages();
    navButtons[defaultPageIndex].classList.add('active');
    pages[defaultPageIndex].style.display = 'flex';

    // Initialize the default page if necessary
    if (navButtons[defaultPageIndex].id === 'tasks-btn') {
        initializeTasksPage();
    } else if (navButtons[defaultPageIndex].id === 'boosts-btn') {
        initializeBoostsPage();
    }

    // Expand the Telegram Web App interface
    tg.ready();
    tg.expand();

    // --- Background Music Functionality ---

    // Get the audio element and Music Control button
    const backgroundMusic = document.getElementById('background-music');
    const musicControlButton = document.getElementById('music-control-btn');

    // Ensure the background music doesn't start on app launch
    if (backgroundMusic) {
        backgroundMusic.pause(); // Ensure music is paused
    } else {
        console.error('Background music element not found');
    }

    // Music Control button functionality
    if (musicControlButton) {
        // Set initial state
        let isMusicPlaying = false;

        musicControlButton.addEventListener('click', () => {
            if (backgroundMusic) {
                if (isMusicPlaying) {
                    backgroundMusic.pause();
                    isMusicPlaying = false;
                    musicControlButton.textContent = '📀'; // Music Icon
                    console.log('Background music paused');
                } else {
                    backgroundMusic.play().then(() => {
                        isMusicPlaying = true;
                        musicControlButton.textContent = '⏸️'; // Pause Icon
                        console.log('Background music started');
                    }).catch(error => {
                        console.error('Error playing background music:', error);
                    });
                }
            }
        });
    } else {
        console.error('Music Control button element not found');
    }
});