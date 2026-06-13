import { h } from "./h.js";

export function ChatItem(chat, onClick) {
    const el = document.createElement("div");
    el.className = "chat-item";
    el.dataset.chatId = chat.id; // безопасно через dataset

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    if (chat.avatarUrl) {
        const url = new URL(chat.avatarUrl, location.origin);
        if (url.protocol === "http:" || url.protocol === "https:") {
            avatar.style.backgroundImage = `url('${CSS.escape(url.href)}')`;
            avatar.style.backgroundSize = "cover";
            avatar.style.backgroundPosition = "center";
        }
    }

    const meta = document.createElement("div");
    meta.className = "chat-meta";

    const name = document.createElement("div");
    name.className = "chat-name";
    name.textContent = chat.name; // textContent — безопасно

    const last = document.createElement("div");
    last.className = "chat-last";
    last.textContent = chat.lastMessage; // textContent — безопасно

    meta.append(name, last);

    const time = document.createElement("div");
    time.className = "chat-time";
    time.textContent = chat.time;

    el.append(avatar, meta, time);
    el.addEventListener("click", () => onClick(chat.id));

    return el;
}