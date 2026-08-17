 let player = {
    diamonds: parseInt(localStorage.getItem('diamonds')) || 25,
    energy: parseInt(localStorage.getItem('energy')) || 3,
    completedChapters: parseInt(localStorage.getItem('completedChapters')) || 0, // новое
    stats: { romance: 0, drama: 0 },
    currentStory: null,
    currentStep: 'start'
};
let player = {
    diamonds: parseInt(localStorage.getItem('diamonds')) || 25,
    energy: parseInt(localStorage.getItem('energy')) || 3,
    stats: { romance: 0, drama: 0 },
    currentStory: null,
    currentStep: 'start'
};

// Обновление интерфейса валюты
function updateResourceUI() {
    document.getElementById('diamond-count').textContent = player.diamonds;
    document.getElementById('energy-count').textContent = player.energy;
    localStorage.setItem('diamonds', player.diamonds);
}

// БАЗА ДАННЫХ ИСТОРIЙ (Пример структуры)
const storiesDatabase = {
    vampire_story: {
        start: {
            text: "Вечер обещал быть скучным, пока вы не заметили странный блеск в окне.",
            name: "Вы",
            bg: "images/bg/mansion.jpg",
            next: "wardrobe_choice"
        },
        wardrobe_choice: {
            text: "Нужно срочно переодеться перед выходом!",
            name: "Система",
            bg: "images/bg/room.jpg",
            isWardrobe: true, // Сигнал коду открыть гардероб
            next: "party_arrival"
        },
        party_arrival: {
            text: "На вечеринке к вам подходит загадочный граф.",
            name: "Влад",
            bg: "images/bg/ballroom.jpg",
            spriteRight: "images/vampire_normal.png",
            next: "diamond_choice"
        },
        diamond_choice: {
            text: "Он предлагает вам бокал странного багрового напитка. Что сделаете?",
            name: "Выбор",
            choices: [
                { 
                    text: "💎 15: Принять бокал и кокетливо улыбнуться", 
                    cost: 15, 
                    stat: "romance", 
                    target: "drink_wine",
                    textAfter: "Вы привлекли его внимание!"
                },
                { 
                    text: "Отказаться и уйти (Бесплатно)", 
                    cost: 0, 
                    stat: "drama", 
                    target: "leave_party" 
                }
            ]
        },
        drink_wine: {
            text: "Вкус потрясающий. Граф шепчет: 'У вас отличный вкус...'",
            name: "Влад",
            spriteRight: "images/vampire_smile.png",
            next: "end_demo"
        },
        leave_party: {
            text: "Вы уходите, чувствуя на себе его тяжелый, разочарованный взгляд.",
            name: "Система",
            next: "end_demo"
        },
        end_demo: { text: "Продолжение следует...", name: "Конец 1 серии", next: "menu" }
    }
};

// Запуск истории из меню
document.querySelectorAll('.story-card').forEach(card => {
    card.querySelector('.play-btn').addEventListener('click', () => {
        const storyKey = card.getAttribute('data-story');
        if (player.energy > 0) {
            player.energy -= 1;
            player.currentStory = storyKey;
            player.currentStep = 'start';
            updateResourceUI();
            document.getElementById('main-menu').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            renderGameStep();
        } else {
            alert("Не хватает чашек чая! Подождите восстановления.");
        }
    });
});

// Отрисовка кадра игры
function renderGameStep() {
    const story = storiesDatabase[player.currentStory];
    const data = story[player.currentStep];

    document.getElementById('char-name').textContent = data.name;
    document.getElementById('dialogue-text').textContent = data.text;
    if (data.bg) document.getElementById('game-bg').style.backgroundImage = `url('${data.bg}')`;

    // Спрайт собеседника
    const rightSprite = document.getElementById('char-right');
    if (data.spriteRight) {
        rightSprite.src = data.spriteRight;
        rightSprite.classList.add('active');
    } else { rightSprite.classList.remove('active'); }

    // Проверка на вызов гардероба
    if (data.isWardrobe) {
        openWardrobe();
        return;
    }

    // Обработка выборов в стиле КР
    const choicesContainer = document.getElementById('choices-container');
    if (data.choices) {
        choicesContainer.innerHTML = '';
        choicesContainer.classList.remove('hidden');

        data.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;

            // Если выбор платный и не хватает алмазов — делаем кнопку серой
            if (choice.cost && player.diamonds < choice.cost) {
                btn.classList.add('locked');
                btn.disabled = true;
            }

            btn.addEventListener('click', () => {
                choicesContainer.classList.add('hidden');
                
                // Списываем алмазы
                if (choice.cost) {
                    player.diamonds -= choice.cost;
                    updateResourceUI();
                }

                // Начисляем статы (Романтика / Драма)
                if (choice.stat) {
                    player.stats[choice.stat] += 1;
                    showStatPopup(choice.stat);
                }

                player.currentStep = choice.target;
                renderGameStep();
            });
            choicesContainer.appendChild(btn);
        });
    } else {
        choicesContainer.classList.add('hidden');
    }
}

// Система гардероба
function openWardrobe() {
    const wardrobe = document.getElementById('wardrobe-screen');
    const optionsContainer = document.getElementById('wardrobe-options');
    wardrobe.classList.remove('hidden');
    optionsContainer.innerHTML = '';

    const clothes = [
        { name: "Скромное платье", img: "dress_default.png", cost: 0 },
        { name: "💎 20: Вечерний шелк", img: "dress_premium.png", cost: 20 }
    ];

    clothes.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'wardrobe-btn';
        btn.textContent = item.name;
        if (player.diamonds < item.cost) btn.disabled = true;

        btn.addEventListener('click', () => {
            player.diamonds -= item.cost;
            updateResourceUI();
            document.getElementById('hero-dress').src = `images/hero/${item.img}`;
            wardrobe.classList.add('hidden');
            
            // Идем дальше по сюжету
            const story = storiesDatabase[player.currentStory];
            player.currentStep = story[player.currentStep].next;
            renderGameStep();
        });
        optionsContainer.appendChild(btn);
    });
}

// Всплывашка "+1 Романтика"
function showStatPopup(statName) {
    const popup = document.getElementById('stats-indicator');
    document.getElementById('stat-icon').textContent = statName === 'romance' ? '❤️' : '👁️';
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 2000);
}

// Клик для продолжения (если нет выборов)
document.getElementById('next-step').addEventListener('click', () => {
    const story = storiesDatabase[player.currentStory];
    const data = story[player.currentStep];
    if (data.choices || data.isWardrobe) return;

    if (data.next === 'menu') {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('main-menu').classList.add('active');
        updateResourceUI();
    } else {
        player.currentStep = data.next;
        renderGameStep();
    }
});

// Инициализация при старте страницы
updateResourceUI();
