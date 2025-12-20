import { h } from "./h.js";

export function ChatItem(chat) {
    const el = h(`
        <div class="chat-item" data-chat-id="${chat.id}">
            <div class="chat-avatar"></div>

            <div class="chat-meta">
                <div class="chat-name">${chat.name}</div>
                <div class="chat-last">${chat.lastMessage}</div>
            </div>

            <div class="chat-time">${chat.time}</div>
        </div>
    `);

    return el;
}