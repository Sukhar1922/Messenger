import { APIfetch, logout } from "./api.js";

// UI элементы
const nicknameInput = document.getElementById('nicknameInput');
const saveNicknameBtn = document.getElementById('saveNicknameBtn');
const nicknameMsg = document.getElementById('nicknameMsg');

const oldPasswordInput = document.getElementById('oldPasswordInput');
const newPasswordInput = document.getElementById('newPasswordInput');
const savePasswordBtn = document.getElementById('savePasswordBtn');
const passwordMsg = document.getElementById('passwordMsg');

const logoutBtn = document.getElementById('logoutBtn');

function showMsg(el, text, isError = false) {
    el.textContent = text;
    el.className = 'settings-msg' + (isError ? ' error' : '');
    setTimeout(() => el.textContent = '', 3000);
}

async function loadMe() {
    const { data } = await APIfetch('/api/user/me/', 'GET', true);
    if (data) nicknameInput.value = data.nickname;
}

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