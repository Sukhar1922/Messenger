import { greeting_text } from "./ui/greeting_text.js";
import { ChatItem } from "./ui/chatItem.js";


const chatElements = new Map(); // chatId -> HTMLElement
let chatList = null;


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

async function loadChats() {
    const { data } = await APIfetch("/api/chats/", "GET", true);

    chatList.innerHTML = "";

    data.forEach(apiChat => {
        const chat = normalizeChat(apiChat);
        const el = ChatItem(chat);

        chatElements.set(chat.id, el);
        chatList.appendChild(el);
    });
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

async function main() {
    const user = await loadUserData();
    if (!user) return;

    const header = document.querySelector(".header-actions");
    header.appendChild(greeting_text(user.nickname));

    chatList = document.getElementById("chatList");

    await loadChats();
}

main();