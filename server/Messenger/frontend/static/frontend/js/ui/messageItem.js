import { h } from "./h.js";

export function MessageItem({ text="", outgoing=false }) {
    return h(`
        <div class="message ${outgoing ? "outgoing" : "incoming"}">
            ${text}
        </div>
    `);
}