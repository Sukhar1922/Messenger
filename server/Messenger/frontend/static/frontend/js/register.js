const form = document.getElementById("registerForm");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const login = document.getElementById("login").value.trim();
    const nickname = document.getElementById("nickname").value.trim();
    const password = document.getElementById("password").value.trim();

    console.log("Submitting login for:", login);
    console.log("Password length:", password.length);


    try {
        const response = await fetch("/api/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login: login,
                password: password,
                nickname: nickname,
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Ошибка ркгистрации");
        }

        const data = await response.json();

        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        window.location.href = "/";

    } catch (err) {
        errorEl.textContent = err.message;
    }
});