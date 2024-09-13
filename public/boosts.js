window.boosts = {
    nutrition: [
        { name: "Protein Shake", icon: "🥤", description: "Increase muscle growth", price: 50 },
        { name: "Pre-workout", icon: "⚡", description: "Boost energy for workouts", price: 75 },
        { name: "Energy Drink", icon: "🍹", description: "Quick energy boost", price: 30 },
        { name: "Steak", icon: "🥩", description: "High protein meal", price: 100 },
        { name: "Eggs", icon: "🥚", description: "Protein-rich snack", price: 20 },
    ],
    equipment: [
        { name: "Gym Entry", icon: "🏋️", description: "Access to gym facilities", price: 150 },
        { name: "Gym Membership", icon: "💳", description: "Monthly gym access", price: 500 },
        { name: "Dumbbells", icon: "🏋️‍♂️", description: "For home workouts", price: 200 },
    ],
    activities: [
        { name: "Yoga", icon: "🧘", description: "Improve flexibility", price: 80 },
        { name: "Hip-hop Dance", icon: "💃", description: "Cardio workout", price: 100 },
        { name: "Salsa", icon: "💃", description: "Fun cardio exercise", price: 90 },
        { name: "Swimming", icon: "🏊", description: "Full body workout", price: 120 },
        { name: "Sauna", icon: "🧖", description: "Relaxation & recovery", price: 70 },
    ],
    training: [
        { name: "Chest Day", icon: "💪", description: "10x reps for chest", price: 300 },
        { name: "Leg Day", icon: "🦵", description: "10x reps for legs", price: 300 },
        { name: "Back Day", icon: "🏋️‍♀️", description: "10x reps for back", price: 300 },
        { name: "Arm Day", icon: "💪", description: "10x reps for arms", price: 300 },
        { name: "Cardio", icon: "🏃", description: "10x reps for cardio", price: 300 },
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const boostItems = document.getElementById('boost-items');
    const categoryButtons = document.querySelectorAll('.category-btn');

    function displayBoosts(category) {
        if (boostItems) {
            boostItems.innerHTML = '';
            window.boosts[category].forEach(boost => {
                const boostElement = document.createElement('div');
                boostElement.className = 'boost-item';
                boostElement.innerHTML = `
                    <div class="boost-icon">${boost.icon}</div>
                    <div class="boost-name">${boost.name}</div>
                    <div class="boost-description">${boost.description}</div>
                    <div class="boost-price">${boost.price} 💰</div>
                `;
                boostItems.appendChild(boostElement);
            });
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