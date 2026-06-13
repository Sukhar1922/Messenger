export function MessageItem({
    text = "",
    outgoing = false,
    sender = "",
    time = ""
}) {
    const el = document.createElement("div");
    el.className = `message ${outgoing ? "outgoing" : "incoming"}`;

    if (!outgoing && sender) {
        const senderEl = document.createElement("div");
        senderEl.className = "message-sender";
        senderEl.textContent = sender;
        el.appendChild(senderEl);
    }

    const textEl = document.createElement("div");
    textEl.className = "message-text";
    textEl.textContent = text;
    el.appendChild(textEl);

    if (time) {
        const timeEl = document.createElement("div");
        timeEl.className = "message-time";
        timeEl.textContent = time;
        el.appendChild(timeEl);
    }

    return el;
}