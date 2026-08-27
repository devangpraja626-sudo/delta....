/* =========================================
   DELTA FRONTEND JAVASCRIPT
========================================= */


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

function selectRole(role) {

    const selectedRole =
        document.getElementById("selectedRole");

    selectedRole.innerHTML =
        `You selected <strong>${role}</strong>. `
        + `Delta registration will be connected to the backend soon.`;

}


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

const visual =
    document.querySelector(".hero-visual");

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