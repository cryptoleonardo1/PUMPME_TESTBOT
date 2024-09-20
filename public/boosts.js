window.boosts = {
    nutrition: [
        { name: "Protein Shake", icon: "🥤", description: "Boost muscle recovery", price: 250 },
        { name: "Pre-workout", icon: "⚡", description: "Increase energy for workouts", price: 300 },
        { name: "Creatine", icon: "💊", description: "Enhance strength and muscle mass", price: 400 },
        { name: "BCAA", icon: "🧪", description: "Support muscle growth and recovery", price: 350 },
        { name: "Coffee", icon: "☕", description: "Quick energy boost", price: 200 },
        { name: "Energy drink", icon: "🥫", description: "Sustained energy boost", price: 250 },
        { name: "Steak", icon: "🥩", description: "High protein meal", price: 500 },
        { name: "Eggs", icon: "🥚", description: "Protein-rich snack", price: 200 },
        { name: "Chicken", icon: "🍗", description: "Lean protein source", price: 350 },
        { name: "Hot-dog", icon: "🌭", description: "Quick protein fix", price: 250 }
    ],
    workout: [
        { name: "Chest Day", icon: "🏋️", description: "Focus on chest muscles", price: 600 },
        { name: "Back Day", icon: "🏋️", description: "Strengthen your back", price: 600 },
        { name: "Leg Day", icon: "🦵", description: "Build lower body strength", price: 650 },
        { name: "Abs Workout", icon: "🦂", description: "Core strength training", price: 500 },
        { name: "Shoulder Day", icon: "🦾", description: "Develop shoulder muscles", price: 550 },
        { name: "Biceps Workout", icon: "💪", description: "Focus on biceps", price: 500 },
        { name: "Triceps Workout", icon: "🦾", description: "Strengthen triceps", price: 500 },
        { name: "HIIT", icon: "🏃‍♂️", description: "High-intensity interval training", price: 700 },
        { name: "Endurance Cardio", icon: "🏃", description: "Boost cardiovascular endurance", price: 600 },
        { name: "Calisthenics", icon: "🤸", description: "Bodyweight exercises", price: 550 },
        { name: "Street Workout", icon: "🏞️", description: "Outdoor fitness training", price: 500 }
    ],
    activities: [
        { name: "Yoga", icon: "🧘", description: "Improve flexibility and mindfulness", price: 400 },
        { name: "Dance Class", icon: "💃", description: "Fun cardio workout", price: 450 },
        { name: "Muay Thai", icon: "🥊", description: "Thai boxing training", price: 600 },
        { name: "Karate", icon: "🥋", description: "Martial arts practice", price: 550 },
        { name: "Swimming", icon: "🏊", description: "Full body workout", price: 500 },
        { name: "Jogging", icon: "🏃‍♀️", description: "Outdoor cardio session", price: 300 },
        { name: "Cycling", icon: "🚴", description: "Low-impact cardio workout", price: 400 }
    ],
    resting: [
        { name: "Sauna", icon: "🧖", description: "Relaxation & recovery", price: 350 },
        { name: "Massage", icon: "💆", description: "Muscle relaxation therapy", price: 600 },
        { name: "Ice Bath", icon: "🧊", description: "Reduce inflammation", price: 400 },
        { name: "Cold Shower", icon: "🚿", description: "Boost recovery and alertness", price: 200 },
        { name: "20 Min Nap", icon: "😴", description: "Quick energy recharge", price: 250 },
        { name: "7 Hour Sleep", icon: "🛌", description: "Full night's rest", price: 800 },
        { name: "Walk a Dog", icon: "🐕", description: "Light activity and stress relief", price: 300 },
        { name: "Breathing Exercise", icon: "🧘‍♂️", description: "Improve focus and relaxation", price: 250 },
        { name: "Meditation", icon: "🧠", description: "Mental relaxation and clarity", price: 350 }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const boostItems = document.getElementById('boost-items');
    const categoryButtons = document.querySelectorAll('.category-btn');

    function displayBoosts(category) {
        console.log("Displaying boosts for category:", category);
        if (boostItems) {
            boostItems.innerHTML = '';
            window.boosts[category].forEach(boost => {
                console.log("Creating boost item:", boost.name);
                const boostElement = document.createElement('div');
                boostElement.className = 'boost-item';
                boostElement.innerHTML = `
                    <div class="boost-icon">${boost.icon}</div>
                    <div class="boost-name">${boost.name}</div>
                    <div class="boost-description">${boost.description}</div>
                    <div class="boost-price">
                        <span class="flex-icon"></span>
                        <span>${boost.price}</span>
                    </div>
                `;
                boostItems.appendChild(boostElement);
            });
            console.log("Finished creating boost items");
        } else {
            console.error("boostItems element not found");
        }
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayBoosts(button.dataset.category);
        });
    });

    // Initially display nutrition boosts
    displayBoosts('nutrition');
});