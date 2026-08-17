// Переключение экранов и звуки
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const bgMusic = document.getElementById('bg-music');
const clickSound = document.getElementById('click-sound');

// Игровые элементы
const gameBg = document.getElementById('game-bg');
const charName = document.getElementById('char-name');
const dialogueText = document.getElementById('dialogue-text');
const choicesContainer = document.getElementById('choices-container');
const dialogueBox = document.getElementById('next-step');

// База данных сценария (Сюжет)
const story = {
    start: {
        text: "Вы просыпаетесь в незнакомой комнате. За окном шумит дождь.",
        name: "",
        bg: "images/bg_room.jpg",
        next: "meet_alice"
    },
    meet_alice: {
        text: "Внезапно дверь открывается, и на пороге появляется девушка.",
        name: "",
        bg: "images/bg_room.jpg",
        next: "alice_speak"
    },
    alice_speak: {
        text: "Привет! Почему ты еще не готов? Мы же договаривались встретиться!",
        name: "Алиса",
        bg: "images/bg_room.jpg",
        spriteRight: "images/alice_happy.png",
        next: "first_choice"
    },
    first_choice: {
        text: "Что ей ответить?",
        name: "Выбор",
        bg: "images/bg_room.jpg",
        spriteRight: "images/alice_happy.png",
        choices: [
            { text: "Прости, я совсем забыл. Дай мне 5 минут.", target: "path_good" },
            { text: "Я никуда не поеду в такой ливень.", target: "path_bad" }
        ]
    },
    path_good: {
        text: "Ура! Жду тебя на кухне, поторопись!",
        name: "Алиса",
        bg: "images/bg_room.jpg",
        spriteRight: "images/alice_happy.png",
        next: "end_demo"
    },
    path_bad: {
        text: "Ну и оставайся здесь один! Вечно ты всё портишь...",
        name: "Алиса",
        bg: "images/bg_room.jpg",
        spriteRight: "images/alice_sad.png",
        next: "end_demo"
    },
    end_demo: {
        text: "Спасибо за игру! Демо-версия подошла к концу.",
        name: "Система",
        bg: "images/bg_black.jpg",
        next: "menu" // Возврат в меню
    }
};

let currentStep = 'start';

// Старт игры из меню
document.getElementById('btn-start').addEventListener('click', () => {
    clickSound.play();
    bgMusic.play(); // Включаем музыку
    mainMenu.classList.remove('active');
    gameScreen.classList.add('active');
    renderStep();
});

// Клик по окну диалога для продвижения сюжета
dialogueBox.addEventListener('click', () => {
    const stepData = story[currentStep];
    
    // Если сейчас на экране выбор — клик по тексту не должен работать
    if (stepData.choices) return;

    clickSound.play();

    if (stepData.next === 'menu') {
        // Возврат в меню
        gameScreen.classList.remove('active');
        mainMenu.classList.add('active');
        currentStep = 'start';
    } else {
        currentStep = stepData.next;
        renderStep();
    }
});

// Отрисовка текущего кадра игры
function renderStep() {
    const data = story[currentStep];

    // 1. Меняем текст и имя
    charName.textContent = data.name;
    dialogueText.textContent = data.text;

    // 2. Меняем задний фон
    if (data.bg) {
        gameBg.style.backgroundImage = `url('${data.bg}')`;
    }

    // 3. Управляем спрайтами персонажей
    const rightSprite = document.getElementById('char-right');
    if (data.spriteRight) {
        rightSprite.src = data.spriteRight;
        rightSprite.classList.add('active');
    } else {
        rightSprite.classList.remove('active');
    }

    // 4. Отрезаем клик и выводим выборы, если они есть
    if (data.choices) {
        choicesContainer.innerHTML = ''; // Очищаем старые кнопки
        choicesContainer.classList.remove('hidden');

        data.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Чтобы не срабатывал клик по диалоговому окну
                clickSound.play();
                choicesContainer.classList.add('hidden');
                currentStep = choice.target;
                renderStep();
            });
            choicesContainer.appendChild(button);
        });
    } else {
        choicesContainer.classList.add('hidden');
    }
}
