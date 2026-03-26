export async function APIfetch(link, method, withAccess = false, body = null) {
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

export function redirectToLogin() {
    window.location.href = '/login/';
}

export function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_data");
    redirectToLogin();
}

export async function refreshAccessToken() {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
        logout();
        return false;
    }

    const { response, data } = await APIfetch("/api/token/refresh/", "POST", false, { refresh });

    if (!response.ok || !data.access) {
        logout();
        return false;
    }

    localStorage.setItem("access", data.access);
    return true;
}