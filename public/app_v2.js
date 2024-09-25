const tg = window.Telegram.WebApp;

let userId = tg.initDataUnsafe?.user?.id;
let username = tg.initDataUnsafe?.user?.username || 'Anonymous';

// Fallback for testing outside of Telegram
if (!userId) {
  userId = 'test-user-id'; // Replace with a unique identifier for testing
  username = 'TestUser';
}

let gains = 0;
let energy = 1000;
let level = 1;
let gainsPerRep = 1;
let gainsPerDay = 0;
let boostMultiplier = 1;
let activeBoosts = [];

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

const userIdFallback = 'test-user-id'; // Replace with a unique identifier for testing

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
    // Update gains per day display
     if (gainsPerDayDisplay) {
         gainsPerDayDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${(gainsPerDay * boostMultiplier).toFixed(1)}`;
     }
    // Update active boosts display
    updateActiveBoostsDisplay();
}

function saveUserData() {
    const userId = tg.initDataUnsafe?.user?.id || 'test-user-id'; // Ensure userId is defined
    const username = tg.initDataUnsafe?.user?.username || 'Anonymous';

    console.log('Saving user data:', { userId, username, gains, level, activeBoosts });

    fetch('/api/saveUserData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, gains, level, activeBoosts }),
    })
        .then(response => response.json())
        .then(data => console.log('User data saved:', data))
        .catch(error => console.error('Error saving user data:', error));
}

function loadUserData() {
    const userId = tg.initDataUnsafe?.user?.id || userIdFallback;
    if (userId) {
        fetch(`/api/getUserData?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                gains = data.gains || 0;
                level = data.level || 1;
                activeBoosts = data.activeBoosts || [];
                console.log('Loaded user data:', { gains, level, activeBoosts });
                applyLoadedBoosts(); // Apply boosts after loading
                updateUI();
            })
            .catch(error => console.error('Error loading user data:', error));
    }
}

function applyLoadedBoosts() {
    console.log('Applying loaded boosts:', activeBoosts);
    activeBoosts.forEach(boost => {
        const remainingDuration = boost.expirationTime - Date.now();
        if (remainingDuration > 0) {
            if (boost.effect.type === "multiplier") {
                boostMultiplier *= boost.effect.value;

                // Set a timeout to remove the boost effect after the remaining duration
                setTimeout(() => {
                    console.log(`Boost ${boost.name} has expired.`);
                    boostMultiplier /= boost.effect.value;
                    activeBoosts = activeBoosts.filter(b => b !== boost);
                    console.log('After expiring boost, activeBoosts:', activeBoosts);
                    updateUI();
                    saveUserData(); // Save data after boost expires
                }, remainingDuration);

                // Update the UI to reflect the boost
                updateUI();
            }
        } else {
            // Boost has expired
            activeBoosts = activeBoosts.filter(b => b !== boost);
        }
    });
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

        const character = document.getElementById('character');
        if (character) {
            character.style.transform = 'scale(1.1)';
            setTimeout(() => { character.style.transform = 'scale(1)'; }, 100);
        }
    }
}

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

function initializeBoostsPage() {
    console.log("Initializing Boosts page");
    const defaultCategory = 'nutrition';
    const categoryButtons = document.querySelectorAll('#boosts-page .category-btn');
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    const defaultButton = document.querySelector(`#boosts-page .category-btn[data-category="${defaultCategory}"]`);
    if (defaultButton) {
        defaultButton.classList.add('active');
    }
    displayBoosts(defaultCategory);
    setupBoostsCategoryButtons();
    setupBoosts(); 
}

function displayBoosts(category) {
    const boostItems = document.getElementById('boost-items');
    if (boostItems && window.boosts) {
        boostItems.innerHTML = '';  // Clear current boosts
        window.boosts[category].forEach(boost => {
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
        });

        // Now that the boosts have been appended to the DOM, call setupBoosts
        setupBoosts();
    }
}

function setupBoosts() {
    const boostItems = document.querySelectorAll('.boost-item');
    boostItems.forEach(item => {
        item.addEventListener('click', handleBoostActivation);
    });
}

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

function showBoostPopUp(boostName, boostPrice, boostEffect) {
    // Update popup content
    const popupContent = document.querySelector('#boost-popup p');
    if (popupContent) {
        popupContent.textContent = `Activate ${boostName} for ${boostPrice} gains?`;
    }

    // Show the popup
    document.getElementById('boost-popup').style.display = 'block';

    // Clean up existing event listeners
    const confirmButton = document.getElementById('confirm-boost');
    const closeButton = document.getElementById('cancel-boost');

    confirmButton.replaceWith(confirmButton.cloneNode(true));
    closeButton.replaceWith(closeButton.cloneNode(true));

    // Re-select the buttons after cloning
    const newConfirmButton = document.getElementById('confirm-boost');
    const newCloseButton = document.getElementById('cancel-boost');

    newConfirmButton.addEventListener('click', function () {
        confirmBoost(boostName, boostPrice, boostEffect);
    });

    newCloseButton.addEventListener('click', function () {
        closeBoostPopup();
    });
}

function confirmBoost(boostName, boostPrice, boostEffect) {
    if (gains >= boostPrice) {
        gains -= boostPrice;
        applyBoostEffect(boostName, boostEffect);
        updateUI();
        // Removed saveUserData() from here to prevent duplicate calls
        closeBoostPopup();
        showBoostActivationMessage(boostName);
    } else {
        closeBoostPopup();
        showInsufficientGainsMessage();
    }
}

function showBoostActivationMessage(boostName) {
    const popupContent = `
        <img src="/public/images/max1.png" alt="PUMP ME Character" class="character-image">
        <p>You activated the boost: "${boostName}"!</p>
        <div class="button-container">
            <button onclick="closePopup()" class="popup-button primary-button">OK</button>
        </div>
    `;
    showPopup(popupContent);
}

function closeBoostPopup() {
    document.getElementById('boost-popup').style.display = 'none';
}

function showPopup(content) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content">
            ${content}
        </div>
    `;
    document.body.appendChild(popup);
}

function closePopup() {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
}

function applyBoostEffect(boostName, boostEffect) {
    if (boostEffect.type === "multiplier") {
        boostMultiplier *= boostEffect.value;

        const expirationTime = Date.now() + boostEffect.duration * 1000;
        console.log('Applying boost effect:', boostName, boostEffect);

        // Add boost to activeBoosts array
        activeBoosts.push({
            name: boostName,
            effect: boostEffect,
            expirationTime: expirationTime
        });

        console.log('After adding boost, activeBoosts:', activeBoosts);

        // Save user data after updating activeBoosts
        saveUserData();

        // Set a timeout to remove the boost effect after its duration
        setTimeout(() => {
            console.log(`Boost ${boostName} has expired at ${new Date().toISOString()}`);
            boostMultiplier /= boostEffect.value;
            activeBoosts = activeBoosts.filter(boost => boost.expirationTime !== expirationTime);
            console.log('After expiring boost, activeBoosts:', activeBoosts);
            updateUI();
            saveUserData(); // Save data after boost expires
        }, boostEffect.duration * 1000);

        // Update the UI to reflect the boost
        updateUI();
    }
}

function updateActiveBoostsDisplay() {
    const activeBoostsContainer = document.getElementById('active-boosts-container');
    if (activeBoostsContainer) {
        activeBoostsContainer.innerHTML = '';
        const now = Date.now();

        // Remove expired boosts
        activeBoosts = activeBoosts.filter(boost => boost.expiresAt > now);

        if (activeBoosts.length > 0) {
            activeBoosts.forEach(boost => {
                const timeRemaining = Math.ceil((boost.expiresAt - now) / 1000); // in seconds
                const boostElement = document.createElement('div');
                boostElement.className = 'active-boost-item';
                boostElement.innerHTML = `
                    <div class="boost-name">${boost.name}</div>
                    <div class="boost-duration">${formatTime(timeRemaining)}</div>
                `;
                activeBoostsContainer.appendChild(boostElement);
            });
        } else {
            activeBoostsContainer.innerHTML = '<p>No active boosts</p>';
        }
    }
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}h ${m}m ${s}s`;
    } else if (m > 0) {
        return `${m}m ${s}s`;
    } else {
        return `${s}s`;
    }
}

function showInsufficientGainsMessage(boostName) {
    const popupContent = `
        <p>You do not have enough Gains to activate "${boostName}".</p>
        <div class="button-container">
            <button onclick="closePopup()" class="popup-button primary-button">OK</button>
        </div>
    `;
    showPopup(popupContent);
}

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

    console.log('Updating profile page with activeBoosts:', activeBoosts);

    const activeBoostsContainer = document.getElementById('active-boosts-container');
    if (activeBoostsContainer) {
        activeBoostsContainer.innerHTML = '';
        if (activeBoosts.length > 0) {
            activeBoosts.forEach(boost => {
                const remainingTime = boost.expirationTime - Date.now();
                if (remainingTime > 0) {
                    const durationString = formatDuration(remainingTime);

                    const boostElement = document.createElement('div');
                    boostElement.className = 'active-boost-item';
                    boostElement.innerHTML = `
                        <div class="boost-name">${boost.name}</div>
                        <div class="boost-duration">${durationString}</div>
                    `;
                    activeBoostsContainer.appendChild(boostElement);
                }
            });
        } else {
            activeBoostsContainer.innerHTML = '<p>No active boosts</p>';
        }
    }
}

function formatDuration(durationInMillis) {
    const totalSeconds = Math.floor(durationInMillis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let durationString = '';
    if (hours > 0) durationString += `${hours}h `;
    if (minutes > 0) durationString += `${minutes}m `;
    if (seconds > 0 || durationString === '') durationString += `${seconds}s`;

    return durationString.trim();
}

const socialTasks = {
    socials: [
        { id: 'telegram', name: "PUMPME.APP on Telegram", icon: "telegram-icon.png", reward: 5000, completed: false, link: "https://t.me/pumpme_me" },
        { id: 'twitter', name: "PUMPME.APP on X", icon: "twitter-icon.png", reward: 5000, completed: false, link: "https://x.com/Pumpme_me" },
        { id: 'instagram', name: "PUMPME.APP on Insta", icon: "instagram-icon.png", reward: 5000, completed: false, link: "https://www.instagram.com/pumpme.me/" },
        { id: 'twitter-like-retweet', name: "Like & Retweet", icon: "twitter-icon.png", reward: 5000, completed: false, link: "https://x.com/Pumpme_me/status/1799805962976715102?t=YEWsHD_DuNhyrV_Y0GrGDw&s=35" }
    ],
    'in-game': [
        { id: 'reps', name: "Make 50,000 reps", icon: "reps-icon.png", reward: 50000, completed: false, noPopup: true },
        { id: 'reps', name: "Make 500,000 reps", icon: "reps-icon.png", reward: 500000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 3", icon: "level-icon.png", reward: 30000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 7", icon: "level-icon.png", reward: 70000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 10", icon: "level-icon.png", reward: 1000000, completed: false, noPopup: true },
        { id: 'purchase', name: "Purchase 50 Boosts", icon: "boost-icon.png", reward: 5000, completed: false, noPopup: true }
    ],
    referrals: [
        { id: 'refer', name: "Refer a friend", icon: "refer-friend-icon.png", reward: 10000, completed: true, noPopup: true }
    ],
    completed: []
};

function updateTasksPage() {
    console.log("Updating Tasks page");
    initializeTasksPage();
}

function initializeTasksPage() {
    console.log("Initializing Tasks page");
    setupTaskCategoryButtons();

    // Set default active category to "socials"
    const defaultCategory = 'socials';
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    const defaultButton = document.querySelector(`.task-categories .category-btn[data-category="${defaultCategory}"]`);
    if (defaultButton) {
        defaultButton.classList.add('active');
    }
    displayTasks(defaultCategory);
}

function setupTaskCategoryButtons() {
    console.log("Setting up task category buttons");
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');
    console.log("Found", categoryButtons.length, "category buttons");

    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Category button clicked:", button.dataset.category);
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayTasks(button.dataset.category);
        });
    });
}

function displayTasks(category) {
    console.log("Displaying tasks for category:", category);
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) {
        console.error("Tasks container not found");
        return;
    }

    tasksContainer.innerHTML = ''; // Clear existing tasks

    if (category === 'completed') {
        // Display the title for the Completed sub-page
        tasksContainer.innerHTML = '<h2>Completed Tasks</h2><p>No completed tasks yet.</p>';
        return;
    }

    if (!socialTasks[category] || !Array.isArray(socialTasks[category])) {
        console.error("Invalid category or tasks not found for category:", category);
        tasksContainer.innerHTML = '<p>No tasks available for this category.</p>';
        return;
    }

    socialTasks[category].forEach(task => {
        if (!task || typeof task !== 'object') {
            console.error("Invalid task object:", task);
            return;
        }

        const taskElement = document.createElement('div');
        taskElement.className = 'social-task';
        taskElement.innerHTML = `
            <img src="/public/images/${task.icon || 'default-icon.png'}" alt="${task.name || 'Task'}" class="social-task-icon">
            <div class="social-task-content">
                <div class="social-task-name">${task.name || 'Unnamed Task'}</div>
                <div class="social-task-reward">
                    <img src="/public/images/bicep-icon-yellow.png" alt="Gains" class="gains-icon">
                    +${(task.reward || 0).toLocaleString()}
                </div>
            </div>
            <div class="social-task-status">
                <img src="/public/images/${task.completed ? 'check-icon.png' : 'chevron-right-icon.png'}" 
                     alt="${task.completed ? 'Completed' : 'Incomplete'}" 
                     class="${task.completed ? 'status-icon' : 'chevron-icon'}">
            </div>
        `;
        tasksContainer.appendChild(taskElement);

        if (!task.noPopup) {
            taskElement.addEventListener('click', () => handleTaskClick(task));
        }
    });
}

function handleTaskClick(task) {
    if (task.completed) return;

    let platformName;
    let actionText;
    switch(task.id) {
        case 'instagram':
            platformName = 'Instagram';
            actionText = 'Follow us on Instagram';
            break;
        case 'telegram':
            platformName = 'Telegram';
            actionText = 'Join our Telegram channel';
            break;
        case 'twitter':
            platformName = 'X';
            actionText = 'Follow us on X';
            break;
        case 'twitter-like-retweet':
            platformName = 'X';
            actionText = 'Like & Retweet our post on X';
            break;
        default:
            platformName = task.id;
            actionText = 'Complete the task';
    }

    const popupContent = `
        <img src="/public/images/max1.png" alt="PUMP ME Character" class="character-image">
        <p>${actionText}:</p>
        <div class="button-container">
            <a href="${task.link}" target="_blank" class="popup-button primary-button">PUMP ME on ${platformName}</a>
            <button onclick="completeTask('${task.id}')" class="popup-button secondary-button">Done</button>
        </div>
    `;

    showPopup(popupContent);
}

/*
function completeTask(taskId) {
    const category = Object.keys(socialTasks).find(key => 
        socialTasks[key].some(task => task.id === taskId)
    );
    
    if (!category) {
        console.error('Task category not found');
        return;
    }

    const task = socialTasks[category].find(t => t.id === taskId);
    if (task && !task.completed) {
        task.completed = true;
        gains += task.reward;
        updateUI();
        closePopup();
        showRewardPopup(task.reward);
        updateSocialPage(); // Refresh the social page to show updated task status
    }
}
*/

function showPopup(content) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content">
            ${content}
        </div>
    `;
    document.body.appendChild(popup);
}

function closePopup() {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
}

function showRewardPopup(reward) {
    const rewardPopupContent = `
        <h2>Task Completed!</h2>
        <p>You've earned ${reward.toLocaleString()} gains!</p>
        <button onclick="closePopup()" class="popup-button ok-button">OK</button>
    `;
    showPopup(rewardPopupContent);
}

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
            bicepIcon.parentElement.textContent = '💪';
        };
    } else {
        console.error('Bicep icon element not found');
    }

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