import { greeting_text } from "./ui/greeting_text.js";


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


// function getUserData() {
//     // refreshAccessToken();
//     loadUserData();

//     var user = localStorage.getItem("user_data");
//     if (user) {
//         user = JSON.parse(user);
//     }
// };


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

async function main() {
    const user = await loadUserData();
    if (!user) return;

    const header = document.querySelector(".header-actions");
    header.appendChild(greeting_text(user.nickname));
}

main();