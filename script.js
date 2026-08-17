document.addEventListener('DOMContentLoaded', () => {
    
    // Функция для создания перьев
    function createFeather() {
        const featherContainer = document.getElementById('feather-container');
        if (!featherContainer) return;

        const feather = document.createElement('img');
        // Используйте путь к вашему изображению пера
        feather.src = 'images/feather.png'; 
        feather.classList.add('feather');
        
        // Случайный размер и позиция
        const scale = Math.random() * 0.5 + 0.3; // от 0.3 до 0.8
        feather.style.transform = `scale(${scale})`;
        feather.style.left = Math.random() * 100 + '%';
        feather.style.bottom = '-100%'; // Начинает снизу за экраном

        // Случайная задержка и длительность анимации
        feather.style.animationDelay = Math.random() * 5 + 's';
        feather.style.animationDuration = Math.random() * 10 + 10 + 's'; // 10-20с

        featherContainer.appendChild(feather);

        // Удаление пера после завершения анимации
        feather.addEventListener('animationend', () => {
            feather.remove();
        });
    }

    // Создаем перья периодически
    setInterval(createFeather, 2000); // Новое перо каждые 2 секунды

});
