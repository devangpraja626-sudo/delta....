/* =========================================
   DELTA FRONTEND JAVASCRIPT
========================================= */


/* ---------- BACKEND ---------- */

const API_URL = "https://delta-admin-qdbu.onrender.com";


/* ---------- MODAL ---------- */

const joinModal = document.getElementById("joinModal");


function openJoin() {

    joinModal.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeJoin() {

    joinModal.classList.remove("active");

    document.body.style.overflow = "auto";
}


/* ---------- CLOSE ON OUTSIDE CLICK ---------- */

joinModal.addEventListener("click", function (event) {

    if (event.target === joinModal) {

        closeJoin();

    }

});


/* ---------- CLOSE WITH ESCAPE ---------- */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeJoin();

    }

});


/* ---------- ROLE SELECTION ---------- */

let selectedRole = null;


function selectRole(role) {

    selectedRole = role;

    const selectedRoleElement =
        document.getElementById("selectedRole");

    selectedRoleElement.innerHTML =
        `You selected <strong>${role}</strong>.`;

}


/* ---------- REGISTRATION ---------- */

const registerForm =
    document.getElementById("registerForm");


registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("registerMessage");


    if (!selectedRole) {

        message.textContent =
            "Please select Founder, Consultant or Investor.";

        return;
    }


    message.textContent =
        "Creating your account...";


    try {

        const response = await fetch(
            `${API_URL}/api/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    email: email,

                    password: password,

                    role: selectedRole

                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            message.textContent =
                data.message || "Registration failed.";

            return;
        }


        localStorage.setItem(
            "deltaToken",
            data.token
        );


        localStorage.setItem(
            "deltaUser",
            JSON.stringify(data.user)
        );


        message.textContent =
            "Account created successfully! Welcome to Delta 🚀";


        registerForm.reset();

        selectedRole = null;


    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to Delta server.";

    }

});


/* ---------- HEADER SCROLL EFFECT ---------- */

const header =
    document.querySelector(".header");


window.addEventListener("scroll", function () {

    if (window.scrollY > 50) {

        header.style.borderBottomColor = "#333333";

    } else {

        header.style.borderBottomColor = "#1c1c1c";

    }

});


/* ---------- SMOOTH NAVIGATION ---------- */

document
    .querySelectorAll(".navigation a")
    .forEach(function (link) {

        link.addEventListener("click", function () {

            const target =
                document.querySelector(
                    link.getAttribute("href")
                );

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });


/* ---------- MOUSE MOVEMENT EFFECT ---------- */

const icons =
    document.querySelectorAll(".floating-icon");


document.addEventListener("mousemove", function (event) {

    if (window.innerWidth < 950) {

        return;

    }


    const x =
        (event.clientX / window.innerWidth - 0.5);

    const y =
        (event.clientY / window.innerHeight - 0.5);


    icons.forEach(function (icon, index) {

        const strength =
            (index + 1) * 3;


        icon.style.marginLeft =
            `${x * strength}px`;


        icon.style.marginTop =
            `${y * strength}px`;

    });

});


/* ---------- CONSOLE ---------- */

console.log(
    "%cDELTA",
    "font-size:30px;font-weight:bold;"
);


console.log(
    "Promoting entrepreneurship globally."
);