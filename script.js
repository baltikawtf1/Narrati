1; } }
---

### 3. Файл `script.js`
*(Добавлена полноценная логика открытия превью, редактирования текстовых полей, загрузки изображений в память LocalStorage для аватара и синхронизация)*

```javascript
// ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРОКА (С кастомизацией профиля)
let player = {
    nickname: localStorage.getItem('player_nickname') || "Игрок",
    bio: localStorage.getItem('player_bio') || "Нажмите на карандаш, чтобы добавить описание своего профиля...",
    avatar: localStorage.getItem('player_avatar') || "images/avatar.jpg", // Ссылка или Base64-код картинки
    diamonds: parseInt(localStorage.getItem('diamonds')) || 25,
    energy: parseInt(localStorage.getItem('energy')) || 3,
    completedChapters: parseInt(localStorage.getItem('completedChapters')) || 0,
    stats: { romance: 0, drama: 0 },
    currentStory: null,
    currentStep: 'start'
};

// БАЗЫ ДАННЫХ РАНГОВ И ДОСТИЖЕНИЙ
const rankTitles = [
    { minChapters: 0, title: "НОВИЧОК МИРОВ" },
    { minChapters: 1, title: "СЛЕДОПЫТ СНОВ" },
    { minChapters: 3, title: "ЗВЁЗДНЫЙ СТРАННИК" },
    { minChapters: 5, title: "ВЛАДЫКА НАЯВУ" }
];

const achievementsList = [
    { id: "ch1", title: "Хранитель Знаний", desc: "Пройти 1 главу", req: 1, icon: "🔮" },
    { id: "ch3", title: "Ловец Ритма", desc: "Пройти 3 главы", req: 3, icon: "🎵" },
    { id: "ch5", title: "Путешественник", desc: "Пройти 5 глав", req: 5, icon: "🌌" }
];

// КАТАЛОГ С СЮЖЕТАМИ И ИХ ДАННЫМИ ДЛЯ ПРЕВЬЮ
const storiesDatabase = {
    vampire_story: {
        title: "Клыки и Розы",
        desc: "Загадочный граф делает вам предложение, от которого невозможно отказаться. Сможете ли вы выжить в его замке и разгадать вековые тайны крови?",
        poster: "images/vampire_poster.jpg",
        // Сюжетные шаги
        start: { text: "Вы открываете глаза в старинном замке...", name: "Система", bg: "images/bg_castle.jpg", next: "wardrobe" },
        wardrobe: { text: "Нужно выбрать наряд.", name: "Система", isWardrobe: true, next: "meet_vampire" },
        meet_vampire: { text: "Перед вами появляется граф Влад.", name: "Система", spriteRight: "images/vampire.png", next: "choice1" },
        choice1: {
            text: "Что ответить графу?", name: "Выбор",
            choices: [
                { text: "💎 15: Довериться ему", cost: 15, stat: "romance", target: "good_end" },
                { text: "Проявить осторожность", cost: 0, stat: "drama", target: "bad_end" }
            ]
        },
        good_end: { text: "Влад улыбается. Глава завершена!", name: "Влад", next: "finish_chapter" },
        bad_end: { text: "Влад хмурится. Глава завершена!", name: "Влад", next: "finish_chapter" },
        finish_chapter: { text: "Вы успешно завершили главу!", name: "Система", isEnd: true }
    }
};

// ОБНОВЛЕНИЕ ДАННЫХ ИНТЕРФЕЙСА
function updateUI() {
    document.getElementById('diamond-count').textContent = player.diamonds;
    document.getElementById('energy-count').textContent = player.energy;
    document.getElementById('stat-chapters').textContent = player.completedChapters;
    document.getElementById('stat-romance').textContent = player.stats.romance;
    document.getElementById('stat-drama').textContent = player.stats.drama;

    // Обновление кастомных полей профиля
    document.getElementById('player-nickname').textContent = player.nickname;
    document.getElementById('player-bio').textContent = player.bio;
    document.getElementById('profile-avatar-img').src = player.avatar;

    localStorage.setItem('diamonds', player.diamonds);
    localStorage.setItem('energy', player.energy);
    localStorage.setItem('completedChapters', player.completedChapters);
}

// ЛОГИКА ОКНА ПРЕВЬЮ ИСТОРIИ
function openStoryPreview(storyId) {
    const storyData = storiesDatabase[storyId];
    if (!storyData) return;

    document.getElementById('preview-title').textContent = storyData.title;
    document.getElementById('preview-desc').textContent = storyData.desc;
    document.getElementById('preview-poster').style.backgroundImage = `url('${storyData.poster}')`;
    
    // Настраиваем кнопку "Читать" на запуск именно этой истории
    const startBtn = document.getElementById('start-story-confirm-btn');
    startBtn.onclick = function() {
        launchStory(storyId);
    };

    document.getElementById('story-preview-modal').classList.remove('hidden');
}

function closeStoryPreview() {
    document.getElementById('story-preview-modal').classList.add('hidden');
}

function launchStory(storyId) {
    closeStoryPreview();
    if (player.energy > 0) {
        player.energy--;
        player.currentStory = storyId;
        player.currentStep = 'start';
        updateUI();
        showScreen('game');
        renderGameStep();
    } else {
        alert("Не хватает чашек чая! Дождитесь восстановления.");
    }
}

// РЕДАКТИРОВАНИЕ ПРОФИЛЯ
function editNickname() {
    let newName = prompt("Введите ваш новый никнейм:", player.nickname);
    if (newName && newName.trim() !== "") {
        player.nickname = newName.trim().substring(0, 15); // Ограничение 15 символов
        localStorage.setItem('player_nickname', player.nickname);
        updateUI();
    }
}

function editBio() {
    let newBio = prompt("Расскажите о себе (описание профиля):", player.bio);
    if (newBio !== null) {
        player.bio = newBio.trim() === "" ? "Описание отсутствует..." : newBio.trim().substring(0, 100);
        localStorage.setItem('player_bio', player.bio);
        updateUI();
    }
}

// Загрузка локальной аватарки
function triggerAvatarChange() {
    document.getElementById('avatar-file-input').click();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            player.avatar = e.target.result; // Превращаем картинку в код (Base64)
            localStorage.setItem('player_avatar', player.avatar);
            updateUI();
        };
        reader.readAsDataURL(file);
    }
}

// ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
function showScreen(screenId) {
    const hub = document.getElementById('main-menu');
    const game = document.getElementById('game-screen');
    const profile = document.getElementById('profile-screen');
    const topBar = document.getElementById('global-top-bar');

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    hub.classList.remove('active');
    game.classList.remove('active');
    profile.classList.remove('active');
    topBar.classList.remove('hidden');

    if (screenId === 'hub') {
        hub.classList.add('active');
        document.getElementById('nav-hub-btn').classList.add('active');
    } else if (screenId === 'game') {
        game.classList.add('active');
        topBar.classList.add('hidden'); 
    } else if (screenId === 'profile') {
        profile.classList.add('active');
        document.getElementById('nav-profile-btn').classList.add('active');
        initProfilePage(); 
    }
}

// НАСТРОЙКИ С КНОПКИ В ТАБ-БАРЕ
document.getElementById('nav-settings-btn').addEventListener('click', () => {
    showScreen('profile');
    const carousel = document.querySelector('.profile-carousel');
    const mainPanel = document.querySelector('.main-panel');
    carousel.scrollTo({ left: carousel.clientWidth, behavior: 'smooth' });
    setTimeout(() => {
        mainPanel.scrollTo({ top: mainPanel.scrollHeight, behavior: 'smooth' });
    }, 250);
});

// ИНИЦИАЛИЗАЦИЯ РАНГОВ
function initProfilePage() {
    let ch = player.completedChapters;
    let lvl = Math.floor(ch / 2) + 1;
    document.getElementById('player-level').textContent = lvl;

    let title = rankTitles[0].title;
    for (let i = rankTitles.length - 1; i >= 0; i--) {
        if (ch >= rankTitles[i].minChapters) {
            title = rankTitles[i].title;
            break;
        }
    }
    document.getElementById('player-rank-title').textContent = title;

    const allBox = document.getElementById('all-achievements');
    const miniBox = document.getElementById('mini-achievements-container');
    allBox.innerHTML = ''; miniBox.innerHTML = '';

    achievementsList.forEach(ach => {
        const isUnlocked = ch >= ach.req;
        allBox.innerHTML += `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div style="font-size:1.5rem">${ach.icon}</div>
                <strong>${ach.title}</strong>
                <p style="font-size:0.75rem; color:#8daed6">${ach.desc}</p>
            </div>
        `;
        if (isUnlocked) {
            miniBox.innerHTML += `<span>${ach.icon}</span>`;
        }
    });

    const carousel = document.querySelector('.profile-carousel');
    carousel.scrollLeft = carousel.clientWidth;
}

// ОТРИСОВКА ИГРЫ И ГАРДЕРОБА (БЕЗ ИЗМЕНЕНИЙ)
function renderGameStep() {
    const story = storiesDatabase[player.currentStory];
    const data = story[player.currentStep];

    document.getElementById('char-name').textContent = data.name;
    document.getElementById('dialogue-text').textContent = data.text;
    if (data.bg) document.getElementById('game-bg').style.backgroundImage = `url('${data.bg}')`;

    const rightSprite = document.getElementById('char-right');
    if (data.spriteRight) {
        rightSprite.src = data.spriteRight;
        rightSprite.classList.add('active');
    } else { rightSprite.classList.remove('active'); }

    if (data.isWardrobe) { openWardrobe(); return; }

    const choiceBox = document.getElementById('choices-container');
    if (data.choices) {
        choiceBox.innerHTML = ''; choiceBox.classList.remove('hidden');
        data.choices.forEach(ch => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = ch.text;
            if (ch.cost && player.diamonds < ch.cost) btn.disabled = true;

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (ch.cost) player.diamonds -= ch.cost;
                if (ch.stat) player.stats[ch.stat]++;choiceBox.classList.add('hidden');player.currentStep = ch.target;updateUI();renderGameStep();});choiceBox.appendChild(btn);});} else { choiceBox.classList.add('hidden'); }}function openWardrobe() {const overlay = document.getElementById('wardrobe-screen');const options = document.getElementById('wardrobe-options');overlay.classList.remove('hidden'); options.innerHTML = '';const list = [{ name: "Обычное платье", cost: 0, img: "images/hero_dress_default.png" },{ name: "💎15: Вечерний шелк", cost: 15, img: "images/hero_dress_premium.png" }];list.forEach(item => {const btn = document.createElement('button');btn.className = 'wardrobe-btn';btn.textContent = item.name;btn.addEventListener('click', () => {if (item.cost) player.diamonds -= item.cost;document.getElementById('hero-dress').src = item.img;overlay.classList.add('hidden');player.currentStep = storiesDatabase[player.currentStory][player.currentStep].next;updateUI();renderGameStep();});options.appendChild(btn);});}document.getElementById('next-step').addEventListener('click', () => {const story = storiesDatabase[player.currentStory];const data = story[player.currentStep];if (data.choices || data.isWardrobe) return;if (data.isEnd) {player.completedChapters++;updateUI();showScreen('hub');} else {player.currentStep = data.next;renderGameStep();}});function resetGameProgress() {if (confirm("Сбросить весь прогресс?")) { localStorage.clear(); location.reload(); }}// СТАРТ ПРИЛОЖЕНИЯupdateUI();