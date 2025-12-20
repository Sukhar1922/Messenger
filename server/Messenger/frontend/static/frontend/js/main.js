async function APIfetch(link, method, withAccess=false, headers={}, body={}) {
    if (withAccess) {
        const access = localStorage.getItem('access');
        headers["Authorization"] = "Bearer " + access;
    }

    const options = {
        method,
        headers
    };

    if (body && method !== "GET") {
        options.body = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(link, options);

    console.log("API fetch: " + response.status);

    data = await response.json();
    // console.log("API fetch data:", data);

    return response;
}


async function loadUserData() {
    // checking if access token exists
    const access = localStorage.getItem('access');
    if (!access) {
        redirectToLogin();
        return;
    }

    // if access token exists, try to get user data
    try {
        var response = await APIfetch("/api/user/me/", "GET", withAccess=true);

        if (response.status === 401) {
            await refreshAccessToken();
            return await loadUserData();
        };
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        return redirectToLogin();
    }

    // const data = await response.json();
    console.log("User data:", data);
    localStorage.setItem("user_data", JSON.stringify(data));

    console.log("User data loaded " + response.status);
};


function getUserData() {
    // refreshAccessToken();
    loadUserData();
};


async function refreshAccessToken() {
    const refresh = localStorage.getItem('refresh');
    console.log("Refreshing access token with refresh token:", refresh);
    try {
        var response = await APIfetch(
            "/api/token/refresh/", 
            "POST",
            withAccess=false,
            {},
            {"refresh": refresh,},
        );
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        // redirectToLogin();
        return;
    }

    localStorage.setItem("access", data.access);
    return;
};


function redirectToLogin() {
    window.location.href = '/login/';
};


function logout() {

}

getUserData();