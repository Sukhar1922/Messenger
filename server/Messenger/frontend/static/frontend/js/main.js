import { greeting_text } from "./ui/greeting_text.js";
import { ChatItem } from "./ui/chatItem.js";
import { MessageItem } from "./ui/messageItem.js";


const chatElements = new Map();   // chatId -> HTMLElement
const chatCache = new Map();     // chatId -> chat data
let activeChatId = null;

let chatList;
let chatHeader;
let chatContent;


async function APIfetch(link, method, withAccess=false, body=null) {
    const headers = {};

    if (withAccess) {
        const access = localStorage.getItem("access");
        headers["Authorization"] = "Bearer " + access;
    }

    if (body && method !== "GET") {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(link, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    const data = await response.json();
    return { response, data };
}


async function loadUserData() {
    const access = localStorage.getItem("access");
    if (!access) {
        redirectToLogin();
        return null;
    }

    const { response, data } = await APIfetch("/api/user/me/", "GET", true);

    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) return null;

        return await loadUserData();
    }

    localStorage.setItem("user_data", JSON.stringify(data));
    return data;
}


async function refreshAccessToken() {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
        logout();
        return false;
    }

    const { response, data } = await APIfetch(
        "/api/token/refresh/",
        "POST",
        false,
        { refresh }
    );

    if (!response.ok || !data.access) {
        logout();
        return false;
    }

    localStorage.setItem("access", data.access);
    return true;
}


function redirectToLogin() {
    window.location.href = '/login/';
};


function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_data");
    redirectToLogin();
}

function normalizeChat(apiChat) {
    return {
        id: apiChat.id,
        name: apiChat.chat_name,
        lastMessage: "Нет сообщений",
        time: "",
        isPrivate: apiChat.is_private
    };
}

function normalizeMessage(apiMsg, currentUserId) {
    return {
        text: apiMsg.text_content,
        outgoing: apiMsg.user === currentUserId,
        time: apiMsg.writed_at
    };
}

function onIncomingMessage(msg) {
    let el = chatElements.get(msg.chat_id);

    // если чата ещё нет (новый чат)
    if (!el) {
        const chat = {
            id: msg.chat_id,
            name: msg.chat_name,
            lastMessage: msg.text,
            time: msg.time
        };

        el = ChatItem(chat);
        chatElements.set(chat.id, el);
        chatList.prepend(el);
        return;
    }

    el.querySelector(".chat-last").textContent = msg.text;
    el.querySelector(".chat-time").textContent = msg.time;

    chatList.prepend(el);

    el.classList.add("chat-new");
    setTimeout(() => el.classList.remove("chat-new"), 600);
}

async function loadMessages(chatId) {
    const { data } = await APIfetch(
        `/api/chats/${chatId}/messages/`,
        "GET",
        true
    );

    chatContent.innerHTML = "";

    const currentUser = JSON.parse(localStorage.getItem("user_data"));

    data.forEach(apiMsg => {
        const msg = normalizeMessage(apiMsg, currentUser.id);
        chatContent.appendChild(MessageItem(msg));
    });

    chatContent.scrollTop = chatContent.scrollHeight;
}

async function selectChat(chatId) {
    if (activeChatId === chatId) return;

    activeChatId = chatId;

    document
        .querySelectorAll(".chat-item")
        .forEach(el => el.classList.remove("active"));

    chatElements.get(chatId)?.classList.add("active");

    const chat = chatCache.get(chatId);
    chatHeader.querySelector(".chat-title").textContent = chat.name;

    await loadMessages(chatId);
}

async function loadChats() {
    const { data } = await APIfetch("/api/chats/", "GET", true);

    chatList.innerHTML = "";
    chatElements.clear();
    chatCache.clear();

    data.forEach(apiChat => {
        const chat = normalizeChat(apiChat);
        chatCache.set(chat.id, chat);

        const el = ChatItem(chat, selectChat);
        chatElements.set(chat.id, el);
        chatList.appendChild(el);
    });
}

async function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const chatContent = document.getElementById("chatContent");
    const text = messageInput.value.trim();
    if (!text || !activeChatId) return;

    const { data, response } = await APIfetch(
        `/api/chats/${activeChatId}/messages/`,
        "POST",
        true,
        { text_content: text }
    );

    if (!response.ok) return;

    // Добавляем сообщение локально
    const currentUser = JSON.parse(localStorage.getItem("user_data"));
    chatContent.appendChild(MessageItem({
        text: data.text_content,
        outgoing: true
    }));

    chatContent.scrollTop = chatContent.scrollHeight;
    messageInput.value = "";
}

async function createChat() {
    // получаем список пользователей
    const { data: users } = await APIfetch("/api/users/", "GET", true);

    if (!users.length) {
        alert("Нет доступных пользователей");
        return;
    }

    // простой выбор через prompt (потом заменишь на нормальный UI)
    const input = prompt(
        "Выберите пользователей (ID через запятую):\n" +
        users.map(u => `${u.id}: ${u.nickname}`).join("\n")
    );

    if (!input) return;

    const userIds = input
        .split(",")
        .map(id => Number(id.trim()))
        .filter(Boolean);

    if (!userIds.length) return;

    let body = {
        users: userIds,
        chat_name: "private_chat"
    };

    // если больше одного собеседника — просим название
    if (userIds.length > 1) {
        const name = prompt("Введите название чата:");
        if (!name) return;
        body.chat_name = name;
    }

    const { data, response } = await APIfetch(
        "/api/chats/",
        "POST",
        true,
        body
    );

    if (!response.ok) {
        console.error("Ошибка создания чата", data);
        return;
    }

    // обновляем список и сразу открываем чат
    await loadChats();
    selectChat(data.id);
}

const createChatModal = document.getElementById("createChatModal");
const modalOverlay = document.getElementById("modalOverlay");
const cancelCreateChatBtn = document.getElementById("cancelCreateChatBtn");
const confirmCreateChatBtn = document.getElementById("confirmCreateChatBtn");

const userSearchInputModal = document.getElementById("userSearchInputModal");
const userSearchResultsModal = document.getElementById("userSearchResultsModal");
const chatNameInputModal = document.getElementById("chatNameInputModal");
const isPrivateInputModal = document.getElementById("isPrivateInputModal");

function openCreateChatModal() {
    createChatModal.classList.remove("hidden");
}

function closeCreateChatModal() {
    createChatModal.classList.add("hidden");
    userSearchInputModal.value = "";
    userSearchResultsModal.innerHTML = "";
    chatNameInputModal.value = "";
    isPrivateInputModal.checked = true;
}

// обработчики кнопок
document.getElementById("newChatBtn").addEventListener("click", openCreateChatModal);
modalOverlay.addEventListener("click", closeCreateChatModal);
cancelCreateChatBtn.addEventListener("click", closeCreateChatModal);

// создание чата
confirmCreateChatBtn.addEventListener("click", async () => {
    const selectedUserIds = Array.from(userSearchResultsModal.querySelectorAll("input[type=checkbox]:checked"))
        .map(cb => Number(cb.value));

    if (!selectedUserIds.length) {
        alert("Выберите хотя бы одного пользователя");
        return;
    }

    let chatName = chatNameInputModal.value.trim();
    if (!chatName) {
        chatName = selectedUserIds.length === 1 ? "private_chat" : "";
    }

    const body = {
        users: selectedUserIds,
        chat_name: chatName,
        is_private: isPrivateInputModal.checked
    };

    const { data, response } = await APIfetch("/api/chats/", "POST", true, body);

    if (!response.ok) {
        console.error("Ошибка создания чата", data);
        return;
    }

    closeCreateChatModal();
    await loadChats();
    selectChat(data.id);
});

userSearchInputModal.addEventListener("input", async () => {
    const q = userSearchInputModal.value.trim();
    const { data: users } = await APIfetch(`/api/user/search/?q=${encodeURIComponent(q)}`, "GET", true);

    userSearchResultsModal.innerHTML = "";

    users.forEach(u => {
        const div = document.createElement("div");
        div.innerHTML = `
            <label>
                <input type="checkbox" value="${u.id}">
                ${u.nickname}
            </label>
        `;
        userSearchResultsModal.appendChild(div);
    });
});

async function main() {
    const user = await loadUserData();
    if (!user) return;

    const header = document.querySelector(".header-actions");
    header.appendChild(greeting_text(user.nickname));

    chatList = document.getElementById("chatList");
    chatHeader = document.getElementById("chatHeader");
    chatContent = document.getElementById("chatContent");

    document
        .getElementById("sendBtn")
        .addEventListener("click", sendMessage);

    await loadChats();
}

main();