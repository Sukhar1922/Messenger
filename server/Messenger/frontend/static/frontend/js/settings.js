import { APIfetch, logout } from "./api.js";



// UI элементы
const nicknameInput = document.getElementById('nicknameInput');
const saveNicknameBtn = document.getElementById('saveNicknameBtn');
const nicknameMsg = document.getElementById('nicknameMsg');

const oldPasswordInput = document.getElementById('oldPasswordInput');
const newPasswordInput = document.getElementById('newPasswordInput');
const savePasswordBtn = document.getElementById('savePasswordBtn');
const passwordMsg = document.getElementById('passwordMsg');

const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const saveAvatarBtn = document.getElementById('saveAvatarBtn');
const avatarMsg = document.getElementById('avatarMsg');

const logoutBtn = document.getElementById('logoutBtn');

avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    avatarPreview.style.backgroundImage = `url(${url})`;
});

function showMsg(el, text, isError = false) {
    el.textContent = text;
    el.className = 'settings-msg' + (isError ? ' error' : '');
    setTimeout(() => el.textContent = '', 3000);
}

async function loadMe() {
    const { data } = await APIfetch('/api/user/me/', 'GET', true);
    if (!data) return;

    nicknameInput.value = data.nickname;

    if (data.avatar_url) {
        avatarPreview.style.backgroundImage = `url(${data.avatar_url})`;
    }
}

saveAvatarBtn.addEventListener('click', async () => {
    const file = avatarInput.files[0];
    if (!file) return showMsg(avatarMsg, 'Выберите файл.', true);

    const formData = new FormData();
    formData.append('avatar', file);

    const access = localStorage.getItem('access');
    const response = await fetch('/api/user/me/avatar/', {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + access },
        body: formData
    });

    if (response.ok) showMsg(avatarMsg, 'Аватарка обновлена.');
    else showMsg(avatarMsg, 'Ошибка. Проверьте формат и размер файла.', true);
});

saveNicknameBtn.addEventListener('click', async () => {
    const nickname = nicknameInput.value.trim();
    if (!nickname) return showMsg(nicknameMsg, 'Введите псевдоним.', true);

    const { response } = await APIfetch('/api/user/me/nickname/', 'PUT', true, { nickname });

    if (response.ok) showMsg(nicknameMsg, 'Псевдоним обновлён.');
    else showMsg(nicknameMsg, 'Ошибка.', true);
});

savePasswordBtn.addEventListener('click', async () => {
    const old_password = oldPasswordInput.value;
    const new_password = newPasswordInput.value;

    if (!old_password || !new_password) {
        return showMsg(passwordMsg, 'Заполните оба поля.', true);
    }

    const { response, data } = await APIfetch('/api/user/me/password/', 'PUT', true, { old_password, new_password });

    if (response.ok) {
        showMsg(passwordMsg, 'Пароль изменён.');
        oldPasswordInput.value = '';
        newPasswordInput.value = '';
    } else {
        const detail = data?.old_password?.[0] || 'Ошибка.';
        showMsg(passwordMsg, detail, true);
    }
});

logoutBtn.addEventListener('click', logout);

loadMe();