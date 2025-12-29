import { h } from "./h.js";

export function MessageItem({
    text = "",
    outgoing = false,
    sender = "",
    time = ""
}) {
    return h(`
        <div class="message ${outgoing ? "outgoing" : "incoming"}">
            ${!outgoing && sender ? `<div class="message-sender">${sender}</div>` : ""}
            <div class="message-text">${text}</div>
            ${time ? `<div class="message-time">${time}</div>` : ""}
        </div>
    `);
}