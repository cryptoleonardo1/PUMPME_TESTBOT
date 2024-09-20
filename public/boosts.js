window.boosts = {
    nutrition: [
        { name: "Protein Shake", icon: "🥤", description: "Increase muscle growth", price: 500 },
        { name: "Pre-workout", icon: "⚡", description: "Boost energy for workouts", price: 750 },
        { name: "Energy Drink", icon: "🍹", description: "Quick energy boost", price: 300 },
        { name: "Steak", icon: "🥩", description: "High protein meal", price: 1000 },
        { name: "Eggs", icon: "🥚", description: "Protein-rich snack", price: 200 },
    ],
    equipment: [
        { name: "Gym Entry", icon: "💳", description: "Access to gym facilities", price: 1500 },
        { name: "Gym Membership", icon: "💳", description: "Monthly gym access", price: 20000 },
        { name: "Dumbbells", icon: "🏋️‍♂️", description: "For home workouts", price: 10000 },
    ],
    activities: [
        { name: "Yoga", icon: "🧘", description: "Improve flexibility", price: 800 },
        { name: "Hip-hop Dance", icon: "💃", description: "Cardio workout", price: 1000 },
        { name: "Salsa", icon: "💃", description: "Fun cardio exercise", price: 900 },
        { name: "Swimming", icon: "🏊", description: "Full body workout", price: 1200 },
        { name: "Sauna", icon: "🧖", description: "Relaxation & recovery", price: 2000 },
    ],
    training: [
        { name: "Chest Day", icon: "🏋️", description: "10x reps for chest", price: 1000 },
        { name: "Leg Day", icon: "🦵", description: "10x reps for legs", price: 1000 },
        { name: "Back Day", icon: "🏋️‍♀️", description: "10x reps for back", price: 1000 },
        { name: "Arm Day", icon: "💪", description: "10x reps for arms", price: 1000 },
        { name: "Cardio", icon: "🏃", description: "10x reps for cardio", price: 1000 },
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