export function MessageItem({
    text = "",
    outgoing = false,
    sender = "",
    time = "",
    media = []
}) {
    const el = document.createElement("div");
    el.className = `message ${outgoing ? "outgoing" : "incoming"}`;

    if (!outgoing && sender) {
        const senderEl = document.createElement("div");
        senderEl.className = "message-sender";
        senderEl.textContent = sender;
        el.appendChild(senderEl);
    }

    media.forEach(({ blobUrl, file, file_type }) => {
        if (file_type === "image") {
            const img = document.createElement("img");
            img.src = blobUrl;
            img.className = "message-image";
            img.alt = "изображение";
            el.appendChild(img);
        } else if (file_type === "video") {
            const video = document.createElement("video");
            video.src = blobUrl;
            video.controls = true;
            video.className = "message-video";
            el.appendChild(video);
        } else if (file_type === "audio") {
            const audio = document.createElement("audio");
            audio.src = blobUrl;
            audio.controls = true;
            el.appendChild(audio);
        } else {
            const a = document.createElement("a");
            a.href = blobUrl;
            a.textContent = decodeURIComponent(file.split("/").pop());
            a.className = "message-file";
            a.download = "";
            el.appendChild(a);
        }
    });

    if (text) {
        const textEl = document.createElement("div");
        textEl.className = "message-text";
        textEl.textContent = text;
        el.appendChild(textEl);
    }

    if (time) {
        const timeEl = document.createElement("div");
        timeEl.className = "message-time";
        timeEl.textContent = time;
        el.appendChild(timeEl);
    }

    return el;
}