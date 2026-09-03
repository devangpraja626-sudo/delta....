/* =========================================
   DELTA FRONTEND JAVASCRIPT
========================================= */


/* ================= API ================= */

const API_URL = "https://delta-admin-qdbu.onrender.com";


/* ================= ELEMENTS ================= */

const authModal = document.getElementById("authModal");
const authChoice = document.getElementById("authChoice");
const registerForm = document.getElementById("registerForm");
const loginFormWrap = document.getElementById("loginFormWrap");

const continueButton =
    document.getElementById("continueButton");

const selectedRole =
    document.getElementById("selectedRole");

const roleText =
    document.getElementById("roleText");

const registerMessage =
    document.getElementById("registerMessage");

const loginMessage =
    document.getElementById("loginMessage");

const menuButton =
    document.getElementById("menuButton");

const nav =
    document.getElementById("nav");



/* ================= ROLE ================= */

let selectedUserRole = null;


function openJoin(role = null) {

    authModal.classList.add("active");
    authModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    showRoles();


    if (role) {

        chooseRole(role);

    }

}


function closeJoin() {

    authModal.classList.remove("active");
    authModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}


function chooseRole(role) {

    selectedUserRole = role;

    selectedRole.innerHTML =
        `Selected role: <strong>${role}</strong>`;

    continueButton.disabled = false;


    document
        .querySelectorAll(".role-select button")
        .forEach(button => {

            button.classList.remove("selected");

            if (button.dataset.role === role) {

                button.classList.add("selected");

            }

        });

}


function showRoles() {

    authChoice.classList.remove("hidden");

    registerForm.classList.add("hidden");

    loginFormWrap.classList.add("hidden");

}


function showRegister() {

    if (!selectedUserRole) {

        return;

    }


    authChoice.classList.add("hidden");

    registerForm.classList.remove("hidden");

    loginFormWrap.classList.add("hidden");


    roleText.textContent =
        `Create your Delta account as a ${selectedUserRole}.`;

}



/* ================= LOGIN ================= */

function showLogin() {

    authChoice.classList.add("hidden");

    registerForm.classList.add("hidden");

    loginFormWrap.classList.remove("hidden");

}



/* ================= MODAL EVENTS ================= */

authModal.addEventListener("click", function (event) {

    if (event.target === authModal) {

        closeJoin();

    }

});


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeJoin();

    }

});



/* ================= TOP LOGIN ================= */

const loginTop =
    document.getElementById("loginTop");


if (loginTop) {

    loginTop.addEventListener("click", function () {

        authModal.classList.add("active");

        authModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        showLogin();

    });

}



/* ================= REGISTER ================= */

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        registerMessage.textContent =
            "Creating your account...";

        registerMessage.className =
            "form-message";


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        if (!selectedUserRole) {

            registerMessage.textContent =
                "Please select a role.";

            return;

        }


        try {
         const response =
           await fetch(
        `${API_URL}/api/auth/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name,
                            email,
                            password,
                            role: selectedUserRole

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Registration failed"
                );

            }


            /* Save authentication */

            localStorage.setItem(
                "deltaToken",
                data.token
            );


            localStorage.setItem(
                "deltaUser",
                JSON.stringify(data.user)
            );


            registerMessage.textContent =
                "Account created successfully. Welcome to Delta.";

            registerMessage.className =
                "form-message success";


            registerForm.reset();


            console.log(
                "Delta user registered:",
                data.user
            );


            /*
                Small delay so user can see
                success message.
            */

            setTimeout(() => {

                closeJoin();

            }, 1500);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            registerMessage.textContent =
                error.message ||
                "Unable to connect to Delta server.";

            registerMessage.className =
                "form-message error";

        }

    }
);



/* ================= LOGIN REQUEST ================= */

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        loginMessage.textContent =
            "Signing you in...";

        loginMessage.className =
            "form-message";


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                .value;


        try {

            const response =
                await fetch(
                    `${API_URL}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email,
                            password

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Login failed"
                );

            }


            localStorage.setItem(
                "deltaToken",
                data.token
            );


            localStorage.setItem(
                "deltaUser",
                JSON.stringify(data.user)
            );


            loginMessage.textContent =
                "Login successful. Welcome back.";

            loginMessage.className =
                "form-message success";


            console.log(
                "Delta user logged in:",
                data.user
            );


            setTimeout(() => {

                closeJoin();

            }, 1200);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            loginMessage.textContent =
                error.message ||
                "Unable to connect to Delta server.";

            loginMessage.className =
                "form-message error";

        }

    }
);



/* ================= HEADER SCROLL ================= */

const header =
    document.querySelector(".header");


window.addEventListener(
    "scroll",
    function () {

        if (!header) return;


        if (window.scrollY > 40) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }
);



/* ================= SMOOTH NAVIGATION ================= */

document
    .querySelectorAll('a[href^="#"]')
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    link.getAttribute("href");


                if (!targetId || targetId === "#") {

                    return;

                }


                const target =
                    document.querySelector(targetId);


                if (target) {

                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });


                    nav.classList.remove("open");

                }

            }
        );

    });



/* ================= MOBILE MENU ================= */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        function () {

            nav.classList.toggle("open");

        }
    );

}



/* ================= MOUSE PARALLAX ================= */

const floatingCards =
    document.querySelectorAll(".floating-card");


document.addEventListener(
    "mousemove",
    function (event) {

        if (window.innerWidth < 900) {

            return;

        }


        const x =
            (event.clientX /
                window.innerWidth) - 0.5;


        const y =
            (event.clientY /
                window.innerHeight) - 0.5;


        floatingCards.forEach(
            function (card, index) {

                const strength =
                    (index + 1) * 5;


                card.style.transform =
                    `translate(${x * strength}px, ${y * strength}px)`;

            }
        );

    }
);



/* ================= CHECK LOGIN ================= */

function getCurrentUser() {

    const user =
        localStorage.getItem("deltaUser");


    if (!user) {

        return null;

    }


    try {

        return JSON.parse(user);

    } catch {

        return null;

    }

}


function getToken() {

    return localStorage.getItem(
        "deltaToken"
    );

}



/* ================= CONSOLE ================= */

console.log(
    "%cDELTA",
    "font-size:32px;font-weight:700;letter-spacing:8px;"
);

console.log(
    "%cPromoting entrepreneurship globally.",
    "font-size:14px;"
);

console.log(
    "API:",
    API_URL
);
