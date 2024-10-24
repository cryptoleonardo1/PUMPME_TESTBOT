// Initialize variables
let gains = 0;
let level = 1;
let gainsPerRep = 1;
let gainsPerDay = 0;
let energy = 1000;
let boostMultiplier = 1;
let activeBoosts = [];

// Initialize Telegram Web Apps SDK
const tg = window.Telegram.WebApp;

// Expand the Telegram Web App interface
tg.expand();
tg.ready();

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
        gainsPerDay: 100
    },
    {
        level: 2,
        name: "Chicken Legs",
        minGains: 10001,
        maxGains: 30000,
        gainsPerRep: 2,
        gainsPerDay: 300
    },
    {
        level: 3,
        name: "Weekend Pumper",
        minGains: 30001,
        maxGains: 100000,
        gainsPerRep: 3,
        gainsPerDay: 1000
    },
    {
        level: 4,
        name: "Iron Pumpling",
        minGains: 100001,
        maxGains: 300000,
        gainsPerRep: 4,
        gainsPerDay: 3000
    },
    {
        level: 5,
        name: "Shredded Sensation",
        minGains: 300001,
        maxGains: 1000000,
        gainsPerRep: 5,
        gainsPerDay: 10000
    },
    {
        level: 6,
        name: "Flex Master",
        minGains: 1000001,
        maxGains: 5000000,
        gainsPerRep: 6,
        gainsPerDay: -10000
    },
    {
        level: 7,
        name: "Gym Boss",
        minGains: 5000001,
        maxGains: 20000000,
        gainsPerRep: 7,
        gainsPerDay: -50000
    },
    {
        level: 8,
        name: "Fitness Phenom",
        minGains: 20000001,
        maxGains: 50000000,
        gainsPerRep: 8,
        gainsPerDay: -200000
    },
    {
        level: 9,
        name: "Olympian Aspirant",
        minGains: 50000001,
        maxGains: 200000000,
        gainsPerRep: 9,
        gainsPerDay: -500000
    },
    {
        level: 10,
        name: "Legendary Lifter",
        minGains: 200000001,
        maxGains: Infinity,
        gainsPerRep: 10,
        gainsPerDay: -2000000
    }
];

// Boost effects data
const boostEffects = {
    "Protein Shake": { type: "multiplier", value: 1.15, duration: 3600 }, // Duration in seconds (1 hour)
    "Pre-workout": { type: "multiplier", value: 1.3, duration: 1800 }, 
    "Creatine": { type: "multiplier", value: 1.05, duration: 10800 },
    "BCAA": { type: "multiplier", value: 1.03, duration: 21600 },
    "Coffee": { type: "multiplier", value: 1.5, duration: 2400 },

    "Energy drink": { type: "multiplier", value: 1.9, duration: 1800 },
    "Steak": { type: "multiplier", value: 1.2, duration: 7200 },
    "Eggs": { type: "multiplier", value: 1.1, duration: 6400 },
    "Chicken": { type: "multiplier", value: 1.15, duration: 7200 },
    "Hot-dog": { type: "multiplier", value: 1.2, duration: 3600 },

    "Chest Day": { type: "multiplier", value: 2.5, duration: 3600 },
    "Back Day": { type: "multiplier", value: 2.7, duration: 3600 },
    "Leg Day": { type: "multiplier", value: 2.9, duration: 3600 },
    "Abs Workout": { type: "multiplier", value: 1.8, duration: 3600 },
    "Shoulder Day": { type: "multiplier", value: 1.9, duration: 3600 },
    "Biceps Workout": { type: "multiplier", value: 2.0, duration: 3600 },
    "Triceps Workout": { type: "multiplier", value: 2.1, duration: 3600 },
    "HIIT": { type: "multiplier", value: 2.7, duration: 3600 },
    "Endurance Cardio": { type: "multiplier", value: 1.9, duration: 3600 },
    "Calisthenics": { type: "multiplier", value: 2.4, duration: 3600 },
    "Street Workout": { type: "multiplier", value: 2.1, duration: 3600 },

    "Yoga": { type: "multiplier", value: 1.6, duration: 3600 },
    "Dance Class": { type: "multiplier", value: 1.8, duration: 3600 },
    "Muay Thai": { type: "multiplier", value: 3.5, duration: 3600 },
    "Karate": { type: "multiplier", value: 1.4, duration: 3600 },
    "Swimming": { type: "multiplier", value: 1.3, duration: 3600 },
    "Jogging": { type: "multiplier", value: 1.5, duration: 3600 },
    "Cycling": { type: "multiplier", value: 1.8, duration: 3600 },

    "Sauna": { type: "multiplier", value: 1.1, duration: 3600 },
    "Massage": { type: "multiplier", value: 1.2, duration: 3600 },
    "Ice Bath": { type: "multiplier", value: 7.5, duration: 300 },
    "Cold Shower": { type: "multiplier", value: 4.5, duration: 600 },
    "20 Min Nap": { type: "multiplier", value: 1.1, duration: 1200 },
    "7 Hour Sleep": { type: "multiplier", value: 1.3, duration: 10800 },
    "Walk a Dog": { type: "multiplier", value: 1.5, duration: 1200 },
    "Breathing Exercise": { type: "multiplier", value: 3.5, duration: 600 },
    "Meditation": { type: "multiplier", value: 2, duration: 1200 },
};

// Boosts data (integrated from boosts.js)
window.boosts = getDefaultBoosts();

// Function to get the default boosts data
function getDefaultBoosts() {
    return {
    nutrition: [
        { name: "Protein Shake", icon: "🥤", description: "Boost muscle recovery", price: 250, active: false, effect: { type: "multiplier", value: 1.15, duration: 3600 } },
        { name: "Pre-workout", icon: "⚡", description: "Increase energy for workouts", price: 300, active: false, effect: { type: "multiplier", value: 1.3, duration: 1800 } },
        { name: "Creatine", icon: "💊", description: "Enhance strength and muscle mass", price: 400, active: false, effect: { type: "multiplier", value: 1.05, duration: 10800 } },
        { name: "BCAA", icon: "🧪", description: "Support muscle growth and recovery", price: 350, active: false, effect: { type: "multiplier",  value: 1.03, duration: 21600 } },
        { name: "Coffee", icon: "☕", description: "Quick energy boost", price: 200, active: false, effect: { type: "multiplier", value: 1.5, duration: 2400 } },
        { name: "Energy drink", icon: "🥫", description: "Sustained energy boost", price: 250, active: false, effect: { type: "multiplier", value: 1.9, duration: 1800 } },
        { name: "Steak", icon: "🥩", description: "High protein meal", price: 500, active: false, effect: { type: "multiplier", value: 1.2, duration: 7200 } },
        { name: "Eggs", icon: "🥚", description: "Protein-rich snack", price: 200, active: false, effect: { type: "multiplier", value: 1.1, duration: 6400 } },
        { name: "Chicken", icon: "🍗", description: "Lean protein source", price: 350, active: false, effect: { type: "multiplier", value: 1.15, duration: 7200 } },
        { name: "Hot-dog", icon: "🌭", description: "Quick protein fix", price: 250, active: false, effect: { type: "multiplier", value: 1.2, duration: 3600 } }
    ],
    workout: [
        { name: "Chest Day", icon: "🏋️", description: "Focus on chest muscles", price: 600, active: false, effect: { type: "multiplier", value: 2.5, duration: 3600 } },
        { name: "Back Day", icon: "🏋️", description: "Strengthen your back", price: 600, active: false, effect: { type: "multiplier", value: 2.7, duration: 3600 } },
        { name: "Leg Day", icon: "🦵", description: "Build lower body strength", price: 650, active: false, effect: { type: "multiplier", value: 2.9, duration: 3600 } },
        { name: "Abs Workout", icon: "🦹‍♂️", description: "Core strength training", price: 500, active: false, effect: { type: "multiplier", value: 1.8, duration: 3600 } },
        { name: "Shoulder Day", icon: "🏋️", description: "Develop shoulder muscles", price: 550, active: false, effect: { type: "multiplier", value: 1.9, duration: 3600 } },
        { name: "Biceps Workout", icon: "💪", description: "Focus on biceps", price: 500, active: false, effect: { type: "multiplier", value: 2.0, duration: 3600 } },
        { name: "Triceps Workout", icon: "🦾", description: "Strengthen triceps", price: 500, active: false, effect: { type: "multiplier", value: 2.1, duration: 3600 } },
        { name: "HIIT", icon: "🏃‍♂️", description: "High-intensity interval training", price: 700, active: false, effect: { type: "multiplier", value: 2.7, duration: 3600 } },
        { name: "Endurance Cardio", icon: "🏃", description: "Boost cardiovascular endurance", price: 600, active: false, effect: { type: "multiplier", value: 1.9, duration: 3600 } },
        { name: "Calisthenics", icon: "🤸", description: "Bodyweight exercises", price: 550, active: false, effect: { type: "multiplier", value: 2.4, duration: 3600 } },
        { name: "Street Workout", icon: "🤸", description: "Outdoor fitness training", price: 500, active: false, effect: { type: "multiplier", value: 2.1, duration: 3600 } }
    ],
    activities: [
        { name: "Yoga", icon: "🧘", description: "Improve flexibility and mindfulness", price: 400, active: false, effect: { type: "multiplier", value: 1.6, duration: 3600 } },
        { name: "Dance Class", icon: "🕺", description: "Fun cardio workout", price: 450, active: false, effect: { type: "multiplier", value: 1.8, duration: 3600 } },
        { name: "Muay Thai", icon: "🥊", description: "Thai boxing training", price: 600, active: false, effect: { type: "multiplier", value: 3.5, duration: 3600 } },
        { name: "Karate", icon: "🥋", description: "Martial arts practice", price: 550, active: false, effect: { type: "multiplier", value: 1.4, duration: 3600 } },
        { name: "Swimming", icon: "🏊", description: "Full body workout", price: 500, active: false, effect: { type: "multiplier", value: 1.3, duration: 3600 } },
        { name: "Jogging", icon: "🏃‍♀️", description: "Outdoor cardio session", price: 300, active: false, effect: { type: "multiplier", value: 1.5, duration: 3600 } },
        { name: "Cycling", icon: "🚴", description: "Low-impact cardio workout", price: 400, active: false, effect: { type: "multiplier", value: 1.8, duration: 3600 } }
    ],
    resting: [
        { name: "Sauna", icon: "🧖", description: "Relaxation & recovery", price: 350, active: false, effect: { type: "multiplier", value: 1.1, duration: 3600 } },
        { name: "Massage", icon: "🧖", description: "Muscle relaxation therapy", price: 600, active: false, effect: { type: "multiplier", value: 1.2, duration: 3600 } },
        { name: "Ice Bath", icon: "🧊", description: "Reduce inflammation", price: 400, active: false, effect: { type: "multiplier", value: 7.5, duration: 300 } },
        { name: "Cold Shower", icon: "🚿", description: "Boost recovery and alertness", price: 200, active: false, effect: { type: "multiplier", value: 4.5, duration: 600 } },
        { name: "20 Min Nap", icon: "😴", description: "Quick energy recharge", price: 250, active: false, effect: { type: "multiplier", value: 1.1, duration: 1200 } },
        { name: "7 Hour Sleep", icon: "🛌", description: "Full night's rest", price: 800, active: false, effect: { type: "multiplier", value: 1.3, duration: 10800 } },
        { name: "Walk a Dog", icon: "🐕", description: "Light activity and stress relief", price: 300, active: false, effect: { type: "multiplier", value: 1.5, duration: 1200 } },
        { name: "Breathing Exercise", icon: "🧘‍♂️", description: "Improve focus and relaxation", price: 250, active: false, effect: { type: "multiplier", value: 3.5, duration: 600 } },
        { name: "Meditation", icon: "🧠", description: "Mental relaxation and clarity", price: 350, active: false, effect: { type: "multiplier", value: 2, duration: 1200 } }
    ]
};
}

/*
icons 
🧪🥤💊☕💪🦾
*/

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


     // if (gainsDisplay) gainsDisplay.textContent = gains.toLocaleString();
   // let floatValue = parseFloat(gainsDisplay.textContent); // Assuming the value is a float in textContent
    // let roundedValue = Math.round(floatValue); // Round the float to the nearest integer
    if (gainsDisplay) {
        //console.log (`Gains Display text.context ${gainsDisplay.textContent}!`)
        //let floatValue = parseFloat(gainsDisplay.textContent); // Assuming the value is a float in textContent
        console.log (`Gains original ${gains}!`)
       // let roundedGains = Math.round(gains); // Round the float to the nearest integer
        
        let floorGains = Math.floor(gains);
        console.log (`Gains FLOOR ${floorGains}!`)
        gainsDisplay.textContent = floorGains.toLocaleString();  // Update the display with the rounded value
        }

    const gainsPerRepDisplay = document.querySelector('.status-item:nth-child(1) .status-value');
    const gainsPerDayDisplay = document.querySelector('.status-item:nth-child(3) .status-value');

    //if (gainsDisplay) gainsDisplay.textContent = gains.toLocaleString();
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
    // Retrieve user ID and username from Telegram Web Apps SDK
    const userId = tg.initDataUnsafe?.user?.id || userIdFallback;
    const username = tg.initDataUnsafe?.user?.username || '';
  
    // Ensure gains, level, boosts, and socialTasks are defined
    if (typeof gains === 'undefined' || typeof level === 'undefined' || typeof boosts === 'undefined' || typeof socialTasks === 'undefined') {
      console.error('One or more required user data variables are undefined');
      return;
    }
  
    console.log('Saving user data with userId:', userId, 'and username:', username);
  
    if (userId) {
      fetch('/api/saveUserData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId.toString(),
          username: username,
          gains: gains,
          level: level,
          boostsData: boosts,
          tasksData: socialTasks,
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('User data saved successfully:', data);
          } else {
            console.error('Error saving user data:', data.error);
          }
        })
        .catch(error => console.error('Error saving user data:', error));
    } else {
      console.error('User ID not available');
    }
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

                    // Ensure each category is an array
                    Object.keys(window.boosts).forEach(category => {
                        if (!Array.isArray(window.boosts[category])) {
                            window.boosts[category] = [];
                        } else {
                            window.boosts[category].forEach(boost => {
                                if (boost.expirationTime) {
                                    boost.expirationTime = Number(boost.expirationTime);
                                }
                            });
                        }
                    });
                } else {
                    // If boostsData is empty, initialize window.boosts
                    window.boosts = getDefaultBoosts();
                }

                // Only update socialTasks if tasksData from server is non-empty
                if (data.tasksData && Object.keys(data.tasksData).length > 0) {
                    socialTasks = data.tasksData;
                    console.log('Loaded tasksData from server:', socialTasks);
                } else {
                    console.log('No tasksData loaded from server, using local socialTasks');
                }

                // Calculate time offset between server and client
                const serverTime = data.serverTime;
                const clientTime = Date.now();
                window.timeOffset = serverTime - clientTime; // Positive if server is ahead
                
                // Apply active boosts
                applyLoadedBoosts();

                updateUI();
            })
            .catch(error => console.error('Error loading user data:', error));
    }
}

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
                name: "Refer 1 Friend",
                icon: "refer-friend-icon.png",
                reward: 30000,
                completed: false,
                link: "https://pumpme.app/refer"
            },
            {
                id: 'refer-5-friends',
                name: "Refer 5 Friends",
                icon: "refer-friend-icon.png",
                reward: 300000,
                completed: false,
                link: "https://pumpme.app/refer"
            },
            {
                id: 'refer-20-friends',
                name: "Refer 20 Friends",
                icon: "refer-friend-icon.png",
                reward: 3000000,
                completed: false,
                link: "https://pumpme.app/refer"
            }
        ],
        completed: []
    };
}

//Refer Friend Page
function navigateToPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
    });

    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
    } else {
        console.error(`Page with ID ${pageId} not found`);
    }
}

function initializeReferPage() {
    console.log('Initializing Refer page');

    // Retrieve user data
    const user = tg.initDataUnsafe.user;
    let telegramUserId;

    if (user && user.id) {
        telegramUserId = user.id.toString();
    } else {
        console.error('User data not available');
        telegramUserId = userIdFallback; // Use fallback ID
    }

    // Fetch My Fitness Crew data from the server
    fetch(`/api/myFitnessCrew?userId=${telegramUserId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                displayMyFitnessCrew(data);
            } else {
                console.error('Invalid data received for My Fitness Crew:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching My Fitness Crew data:', error);
        });
}

function displayMyFitnessCrew(crewData) {
    const fitnessCrewContainer = document.getElementById('fitness-crew-container');

    if (!fitnessCrewContainer) {
        console.error('Fitness Crew container not found');
        return;
    }

    // Clear existing content
    fitnessCrewContainer.innerHTML = '';

    if (crewData.length === 0) {
        fitnessCrewContainer.innerHTML = '<p>You have not invited any friends yet.</p>';
        return;
    }

    // Create the leaderboard table
    const table = document.createElement('table');
    table.classList.add('leaderboard-table');

    // Create the table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    ['Rank', 'Username', 'Gains'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');

    crewData.forEach(member => {
        const row = document.createElement('tr');

        const rankCell = document.createElement('td');
        rankCell.textContent = member.rank;
        row.appendChild(rankCell);

        const usernameCell = document.createElement('td');
        usernameCell.textContent = member.username;
        row.appendChild(usernameCell);

        const gainsCell = document.createElement('td');
        gainsCell.textContent = member.gains;
        row.appendChild(gainsCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    fitnessCrewContainer.appendChild(table);
}

function displayInvitationMessage(message) {
    const invitationMessageContainer = document.getElementById('invitation-message-container');
    const invitationMessageTextarea = document.getElementById('invitation-message-textarea');

    if (invitationMessageContainer && invitationMessageTextarea) {
        invitationMessageTextarea.value = message;
        invitationMessageContainer.classList.remove('hidden');
    } else {
        console.error('Invitation message elements not found');
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

        const categoryBoosts = window.boosts[category];

        if (!Array.isArray(categoryBoosts)) {
            console.error(`Boosts in category ${category} are not an array:`, categoryBoosts);
            return;
        }

        categoryBoosts
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


// Function to apply loaded boosts
function applyLoadedBoosts() {
    const now = Date.now() + (window.timeOffset || 0);
    Object.keys(window.boosts).forEach(category => {
        const categoryBoosts = window.boosts[category];
        if (!Array.isArray(categoryBoosts)) {
            console.error(`Boosts in category ${category} are not an array:`, categoryBoosts);
            return;
        }
        categoryBoosts.forEach(boost => {
            if (boost.active && boost.expirationTime) {
                boost.expirationTime = Number(boost.expirationTime);

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
        // Apply boost effect
        markBoostAsActive(boostName, expirationTime);
        recalculateBoostMultiplier(); // Recalculate boostMultiplier
        updateUI();
        closeBoostPopup();
        saveUserData();
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
            markBoostAsInactive(boostName);
            recalculateBoostMultiplier(); // Recalculate boostMultiplier
            updateUI();
            initializeBoostsPage();
            updateProfilePage();
            saveUserData();
        }, remainingDuration);

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
        const categoryBoosts = window.boosts[category];

        if (!Array.isArray(categoryBoosts)) {
            console.error(`Boosts in category ${category} are not an array:`, categoryBoosts);
            return;
        }

        categoryBoosts.forEach(boost => {
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
        const categoryBoosts = window.boosts[category];

        if (!Array.isArray(categoryBoosts)) {
            console.error(`Boosts in category ${category} are not an array:`, categoryBoosts);
            return;
        }

        categoryBoosts.forEach(boost => {
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
        { name: "Recovery", value: 22 },
        { name: "Charisma", value: 17 },
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

        const now = Date.now() + (window.timeOffset || 0); // Get current time in milliseconds

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
            name: "Refer 1 Friend", 
            icon: "refer-friend-icon.png", 
            reward: 30000, 
            completed: false
        },
        {
            id: 'refer-5-friends', 
            name: "Refer 5 Friends", 
            icon: "refer-friend-icon.png", 
            reward: 300000, 
            completed: false
        },
        {
            id: 'refer-20-friends', 
            name: "Refer 20 Friends", 
            icon: "refer-friend-icon.png", 
            reward: 3000000, 
            completed: false
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

    // Exclude completed tasks for categories other than 'completed'
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

        // Make tasks clickable only if in 'socials' category
        if (category === 'socials') {
            taskElement.addEventListener('click', () => handleTaskClick(task));
            taskElement.style.cursor = 'pointer'; // Optional: Change cursor to pointer
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
        <img src="/public/images/max1.png" alt="PUMP ME Character" class="character-image">
        <p>${actionText}</p>
        <div class="button-container">
            <button class="popup-button primary-button" id="pump-me-button">Pump Me</button>
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

    // Close the task popup
    closeTaskPopup();

    // Show a reward popup
    showRewardPopup(task.reward);

    // Save user data (ensure this is called)
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
        if (!socialTasks['completed']) {
            socialTasks['completed'] = [];
        }
        socialTasks['completed'].push(task);

        // Save the updated socialTasks data
        saveUserData();

        // Update the tasks display
        displayTasks(category);
    }
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

    // the visibilitychange event listener 
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            recalculateBoostMultiplier();
            updateUI();
        }
    });

    // Define the function to recalculate boostMultiplier
    function recalculateBoostMultiplier() {
        boostMultiplier = 1;
        const now = Date.now() + (window.timeOffset || 0);
        Object.keys(window.boosts).forEach(category => {
            window.boosts[category].forEach(boost => {
                if (boost.active && boost.expirationTime > now) {
                    const boostEffect = boostEffects[boost.name];
                    if (boostEffect && boostEffect.type === "multiplier") {
                        boostMultiplier *= boostEffect.value;
                    }
                } else {
                    // If the boost has expired, mark it as inactive
                    boost.active = false;
                    boost.expirationTime = null;
                }
            });
        });
        // Optionally save user data if boosts have expired
        saveUserData();
    }

    // Update active boosts display every second
    setInterval(() => {
        updateActiveBoostsDisplay();
    }, 1000); // Update every 1000 milliseconds (1 second)

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
                        musicControlButton.textContent = '🔇'; // Pause Icon
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

    // --- Event Listeners for Gym Page ---

    // Event listener for the character
    const character = document.getElementById('character');
    if (character) {
        character.addEventListener('click', (e) => {
            // Handle character click
            console.log('Character clicked');
            pump(e); // Call your existing pump function
        });
    } else {
        console.error('Character element not found');
    }

    // --- Referral Functionality ---

    // Event listener for the fight-control-btn to navigate to the Refer page
    const fightControlBtn = document.getElementById('fight-control-btn');
    if (fightControlBtn) {
        fightControlBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Fight control button clicked');

            // Hide all pages and deactivate all nav buttons
            hideAllPages();
            navButtons.forEach(btn => btn.classList.remove('active'));

            // Show the Refer page
            const referPage = document.getElementById('refer-page');
            if (referPage) {
                referPage.style.display = 'flex';
            } else {
                console.error('Refer page not found');
            }

            // Initialize the Refer page if needed
            initializeReferPage();
        });
    } else {
        console.error('Fight control button not found');
    }

    // Event listener for the Invite Friends button on the Refer page
const inviteFriendsBtn = document.getElementById('invite-friends-btn');
if (inviteFriendsBtn) {
    inviteFriendsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Invite Friends button clicked');

        // Retrieve user data
        const user = tg.initDataUnsafe.user;

        if (user && user.id) {
            const telegramUserId = user.id;
            const botUsername = 'pumpmetestbot'; // Replace with your bot's username

            // Update the invitation link to use 'start' parameter
            const invitationLink = `https://t.me/${botUsername}?start=ref_${telegramUserId}`;
            console.log('Invitation Link:', invitationLink);

            // Invitation message
            const invitationMessage = `Hello, my friend! Join my Fitness Crew in Pump Me App!`;

            // Construct the share URL
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(invitationLink)}&text=${encodeURIComponent(invitationMessage)}`;

            // Open Telegram's share interface
            tg.openTelegramLink(shareUrl);
        } else {
            console.error('User data not available');
            alert('Unable to retrieve your Telegram ID.');
        }
    });
} else {
    console.error('Invite Friends button not found');
}

    // Function to initialize the Refer page
    function initializeReferPage() {
        console.log('Initializing Refer page');

        // Retrieve the user's Telegram ID
        const user = tg.initDataUnsafe.user;

        if (user && user.id) {
            const telegramUserId = user.id;

            // Fetch the friend list
            fetch(`/api/getFriendList?userId=${telegramUserId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Friend list data:', data);
                    displayFriendList(data);
                })
                .catch(error => {
                    console.error('Error fetching friend list:', error);
                });
        } else {
            console.error('User data not available');
        }
    }

    // Function to display the friend list
    function displayFriendList(friends) {
        const friendListContainer = document.getElementById('friend-list-container');

        if (!friendListContainer) {
            console.error('Friend list container not found');
            return;
        }

        // Clear existing content
        friendListContainer.innerHTML = '';

        if (!friends || friends.length === 0) {
            friendListContainer.innerHTML = '<p>You have no friends in your Fitness Crew yet. Invite friends to join!</p>';
            return;
        }

        // Create the table
        const table = document.createElement('table');
        table.classList.add('leaderboard-table');

        // Create table header
        const headerRow = document.createElement('tr');
        ['Rank', 'Username', 'Gains'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create table rows
        friends.forEach(friend => {
            const row = document.createElement('tr');

            const rankCell = document.createElement('td');
            rankCell.textContent = friend.rank;
            row.appendChild(rankCell);

            const usernameCell = document.createElement('td');
            usernameCell.textContent = friend.username;
            row.appendChild(usernameCell);

            const gainsCell = document.createElement('td');
            gainsCell.textContent = friend.gains;
            row.appendChild(gainsCell);

            table.appendChild(row);
        });

        friendListContainer.appendChild(table);
    }
});
