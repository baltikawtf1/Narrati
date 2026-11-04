 let diamonds = parseInt(localStorage.getItem('narrati_diamonds')) || 45;
document.getElementById('user-diamonds').innerText = diamonds;

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active');
    document.getElementById(`nav-${pageName}`).classList.add('active');
}

function openStoryModal() { document.getElementById('storyModal').classList.add('active'); }
function closeStoryModal() { document.getElementById('storyModal').classList.remove('active'); }

function onTelegramAuth(user) {
    localStorage.setItem('narrati_tg_user', JSON.stringify(user));
    renderProfile(user);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('narrati_tg_user');
    if (savedUser) renderProfile(JSON.parse(savedUser));
});

function renderProfile(user) {
    document.getElementById('profile-name').innerText = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    document.getElementById('profile-status').innerText = user.username ? '@' + user.username : 'ID: ' + user.id;
    document.getElementById('tg-widget-wrap').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';
}

function logout() {
    localStorage.removeItem('narrati_tg_user');
    location.reload();
}
