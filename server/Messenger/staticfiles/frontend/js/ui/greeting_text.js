import { h } from "./h.js";

export function greeting_text(txt) {
    // console.log("greeting_text:", txt);

    if (txt == "") {
        return h(`<div class="header-actions-text" id="greeting">
            Добро пожаловать!
        </div>`);
    }
    
    return h(`<div class="header-actions-text" id="greeting">
        Добро пожаловать, ${txt}!
    </div>`);
}
