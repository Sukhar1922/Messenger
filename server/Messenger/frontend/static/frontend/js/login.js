const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const login = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();

    console.log("Submitting login for:", login);
    console.log("Password length:", password.length);


    try {
        const response = await fetch("/api/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login: login,
                password: password
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Ошибка авторизации");
        }

        const data = await response.json();

        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        window.location.href = "/";

    } catch (err) {
        errorEl.textContent = err.message;
    }
});