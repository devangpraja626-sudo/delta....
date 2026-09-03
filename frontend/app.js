/* =========================================
   DELTA FRONTEND
========================================= */

const API_URL =
    "https://delta-admin-qdbu.onrender.com";


/* ================= ELEMENTS ================= */

const authModal =
    document.getElementById("authModal");

const authChoice =
    document.getElementById("authChoice");

const registerForm =
    document.getElementById("registerForm");

const loginFormWrap =
    document.getElementById("loginFormWrap");

const loginForm =
    document.getElementById("loginFormWrap");

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

const landingPage =
    document.getElementById("landingPage");

const dashboardPage =
    document.getElementById("dashboardPage");


let selectedUserRole = null;


/* ================= API HELPER ================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        localStorage.getItem("deltaToken");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

    const data =
        await response.json()
            .catch(() => ({}));

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Something went wrong"
        );
    }

    return data;
}


/* ================= AUTH MODAL ================= */

function openJoin(role = null) {

    authModal.classList.add("active");

    authModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

    showRoles();

    if (role) {
        chooseRole(role);
    }
}


function closeJoin() {

    authModal.classList.remove("active");

    authModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";
}


function chooseRole(role) {

    selectedUserRole = role;

    selectedRole.innerHTML =
        `Selected role: <strong>${role}</strong>`;

    continueButton.disabled = false;

    document
        .querySelectorAll(
            ".role-select button"
        )
        .forEach(button => {

            button.classList.remove(
                "selected"
            );

            if (
                button.dataset.role === role
            ) {

                button.classList.add(
                    "selected"
                );
            }
        });
}


function showRoles() {

    authChoice.classList.remove(
        "hidden"
    );

    registerForm.classList.add(
        "hidden"
    );

    loginFormWrap.classList.add(
        "hidden"
    );
}


function showRegister() {

    if (!selectedUserRole) {
        return;
    }

    authChoice.classList.add(
        "hidden"
    );

    registerForm.classList.remove(
        "hidden"
    );

    loginFormWrap.classList.add(
        "hidden"
    );

    roleText.textContent =
        `Create your Delta account as a ${selectedUserRole}.`;
}


function showLogin() {

    authChoice.classList.add(
        "hidden"
    );

    registerForm.classList.add(
        "hidden"
    );

    loginFormWrap.classList.remove(
        "hidden"
    );
}


/* ================= REGISTER ================= */

registerForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        registerMessage.textContent =
            "Creating your account...";

        registerMessage.className =
            "form-message";

        const name =
            document
                .getElementById("name")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        if (!selectedUserRole) {

            registerMessage.textContent =
                "Please select a role.";

            return;
        }

        try {

            const data =
                await apiRequest(
                    "/api/auth/register",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            name,
                            email,
                            password,
                            role: selectedUserRole
                        })
                    }
                );

            localStorage.setItem(
                "deltaToken",
                data.token
            );

            localStorage.setItem(
                "deltaUser",
                JSON.stringify(data.user)
            );

            registerMessage.textContent =
                "Account created successfully.";

            registerMessage.className =
                "form-message success";

            registerForm.reset();

            setTimeout(() => {

                closeJoin();

                openDashboard();

            }, 700);

        } catch (error) {

            console.error(error);

            registerMessage.textContent =
                error.message;

            registerMessage.className =
                "form-message error";
        }
    }
);


/* ================= LOGIN ================= */

loginForm.addEventListener(
    "submit",
    async event => {

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

            const data =
                await apiRequest(
                    "/api/auth/login",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );

            localStorage.setItem(
                "deltaToken",
                data.token
            );

            localStorage.setItem(
                "deltaUser",
                JSON.stringify(data.user)
            );

            loginMessage.textContent =
                "Login successful.";

            loginMessage.className =
                "form-message success";

            setTimeout(() => {

                closeJoin();

                openDashboard();

            }, 500);

        } catch (error) {

            console.error(error);

            loginMessage.textContent =
                error.message;

            loginMessage.className =
                "form-message error";
        }
    }
);


/* ================= DASHBOARD ================= */

function getCurrentUser() {

    const raw =
        localStorage.getItem(
            "deltaUser"
        );

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}


function openDashboard() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }

    landingPage.classList.add(
        "hidden"
    );

    dashboardPage.classList.remove(
        "hidden"
    );

    document.body.style.overflow = "";

    document.getElementById(
        "dashboardGreeting"
    ).textContent =
        `Welcome, ${user.name}.`;

    document.getElementById(
        "userBadge"
    ).textContent =
        user.role;

    showDashboardSection(
        "dashboard"
    );

    loadDashboard();
}


function closeDashboard() {

    dashboardPage.classList.add(
        "hidden"
    );

    landingPage.classList.remove(
        "hidden"
    );

    window.scrollTo(
        0,
        0
    );
}


function showDashboardSection(
    section
) {

    document
        .querySelectorAll(
            ".dash-section"
        )
        .forEach(element => {

            element.classList.add(
                "hidden"
            );
        });

    const target =
        document.getElementById(
            `section-${section}`
        );

    if (target) {
        target.classList.remove(
            "hidden"
        );
    }

    document
        .querySelectorAll(
            ".side-link"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

            if (
                button.dataset.section ===
                section
            ) {

                button.classList.add(
                    "active"
                );
            }
        });


    if (section === "profile") {
        loadProfile();
    }

    if (section === "pitches") {
        loadMyPitches();
    }

    if (section === "discover") {
        loadDiscover();
    }

    if (section === "connections") {
        loadConnections();
    }
}


/* ================= SIDEBAR ================= */

document
    .querySelectorAll(".side-link")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.section;

                if (section) {
                    showDashboardSection(
                        section
                    );
                }
            }
        );
    });


/* ================= PROFILE ================= */

async function loadProfile() {

    try {

        const data =
            await apiRequest(
                "/api/profiles/me"
            );

        const user =
            data.user;

        const profile =
            data.profile || {};

        document.getElementById(
            "profileName"
        ).value =
            user.name || "";

        document.getElementById(
            "startupName"
        ).value =
            profile.startupName || "";

        document.getElementById(
            "industry"
        ).value =
            profile.industry || "";

        document.getElementById(
            "location"
        ).value =
            profile.location || "";

        document.getElementById(
            "stage"
        ).value =
            profile.stage || "";

        document.getElementById(
            "website"
        ).value =
            profile.website || "";

        document.getElementById(
            "bio"
        ).value =
            profile.bio || "";

        let completed = 0;

        const fields = [
            profile.startupName,
            profile.industry,
            profile.location,
            profile.stage,
            profile.bio
        ];

        fields.forEach(value => {
            if (value) completed++;
        });

        document.getElementById(
            "profileStatus"
        ).textContent =
            `${Math.round(
                completed / fields.length * 100
            )}%`;

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );
    }
}


document
    .getElementById("profileForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const message =
                document.getElementById(
                    "profileMessage"
                );

            try {

                const data =
                    await apiRequest(
                        "/api/profiles/me",
                        {
                            method: "PUT",
                            body: JSON.stringify({

                                startupName:
                                    document.getElementById(
                                        "startupName"
                                    ).value.trim(),

                                industry:
                                    document.getElementById(
                                        "industry"
                                    ).value.trim(),

                                location:
                                    document.getElementById(
                                        "location"
                                    ).value.trim(),

                                stage:
                                    document.getElementById(
                                        "stage"
                                    ).value,

                                website:
                                    document.getElementById(
                                        "website"
                                    ).value.trim(),

                                bio:
                                    document.getElementById(
                                        "bio"
                                    ).value.trim()

                            })
                        }
                    );

                message.textContent =
                    data.message;

                message.className =
                    "form-message success";

                loadProfile();

            } catch (error) {

                message.textContent =
                    error.message;

                message.className =
                    "form-message error";
            }
        }
    );


/* ================= CREATE PITCH ================= */

document
    .getElementById("pitchForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const message =
                document.getElementById(
                    "pitchMessage"
                );

            try {

                const data =
                    await apiRequest(
                        "/api/pitches",
                        {
                            method: "POST",
                            body: JSON.stringify({

                                title:
                                    document.getElementById(
                                        "pitchTitle"
                                    ).value.trim(),

                                description:
                                    document.getElementById(
                                        "pitchDescription"
                                    ).value.trim(),

                                industry:
                                    document.getElementById(
                                        "pitchIndustry"
                                    ).value.trim(),

                                stage:
                                    document.getElementById(
                                        "pitchStage"
                                    ).value,

                                fundingRequired:
                                    document.getElementById(
                                        "fundingRequired"
                                    ).value.trim(),

                                website:
                                    document.getElementById(
                                        "pitchWebsite"
                                    ).value.trim(),

                                status:
                                    document.getElementById(
                                        "pitchStatus"
                                    ).value

                            })
                        }
                    );

                message.textContent =
                    data.message;

                message.className =
                    "form-message success";

                document
                    .getElementById(
                        "pitchForm"
                    )
                    .reset();

                loadMyPitches();

            } catch (error) {

                message.textContent =
                    error.message;

                message.className =
                    "form-message error";
            }
        }
    );


/* ================= MY PITCHES ================= */

async function loadMyPitches() {

    const container =
        document.getElementById(
            "myPitches"
        );

    container.innerHTML =
        "<p>Loading pitches...</p>";

    try {

        const data =
            await apiRequest(
                "/api/pitches/my"
            );

        document.getElementById(
            "pitchCount"
        ).textContent =
            data.pitches.length;

        if (!data.pitches.length) {

            container.innerHTML = `
                <div class="content-card">
                    <h3>No pitches yet.</h3>
                    <p>Create your first startup pitch.</p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            data.pitches
                .map(pitch => `

                    <div class="content-card">

                        <span class="small-label">
                            ${pitch.status}
                        </span>

                        <h3>
                            ${escapeHTML(
                                pitch.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                pitch.description
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                pitch.industry || ""
                            )}
                        </p>

                    </div>

                `)
                .join("");

    } catch (error) {

        container.innerHTML =
            `<p>${error.message}</p>`;
    }
}


/* ================= DISCOVER ================= */

async function loadDiscover() {

    const role =
        document.getElementById(
            "discoverRole"
        ).value;

    const container =
        document.getElementById(
            "discoverUsers"
        );

    container.innerHTML =
        "<p>Discovering people...</p>";

    try {

        const endpoint =
            role
                ? `/api/connections/discover?role=${encodeURIComponent(role)}`
                : "/api/connections/discover";

        const data =
            await apiRequest(
                endpoint
            );

        if (!data.users.length) {

            container.innerHTML =
                "<p>No people found.</p>";

            return;
        }

        container.innerHTML =
            data.users
                .map(user => `

                    <div class="content-card">

                        <span class="small-label">
                            ${escapeHTML(user.role)}
                        </span>

                        <h3>
                            ${escapeHTML(user.name)}
                        </h3>

                        <p>
                            ${escapeHTML(user.email)}
                        </p>

                        <div class="card-actions">

                            <button
                                class="button button-light"
                                onclick="connectUser('${user._id}')"
                            >
                                Connect →
                            </button>

                        </div>

                    </div>

                `)
                .join("");

    } catch (error) {

        container.innerHTML =
            `<p>${error.message}</p>`;
    }
}


document
    .getElementById("discoverRole")
    .addEventListener(
        "change",
        loadDiscover
    );


/* ================= CONNECT ================= */

async function connectUser(userId) {

    try {

        const data =
            await apiRequest(
                `/api/connections/request/${userId}`,
                {
                    method: "POST"
                }
            );

        alert(
            data.message
        );

        loadDiscover();

    } catch (error) {

        alert(
            error.message
        );
    }
}


/* ================= CONNECTIONS ================= */

async function loadConnections() {

    const container =
        document.getElementById(
            "connectionsList"
        );

    container.innerHTML =
        "<p>Loading connections...</p>";

    try {

        const data =
            await apiRequest(
                "/api/connections"
            );

        const connections =
            data.connections;

        document.getElementById(
            "connectionCount"
        ).textContent =
            connections.filter(
                connection =>
                    connection.status ===
                    "accepted"
            ).length;

        if (!connections.length) {

            container.innerHTML = `
                <div class="content-card">
                    <h3>Your network starts here.</h3>
                    <p>
                        Discover founders, investors
                        and consultants.
                    </p>
                </div>
            `;

            return;
        }

        const currentUser =
            getCurrentUser();

        container.innerHTML =
            connections
                .map(connection => {

                    const other =
                        connection.sender._id ===
                        currentUser.id
                            ? connection.receiver
                            : connection.sender;

                    let actions = "";

                    if (
                        connection.status ===
                        "pending" &&
                        connection.receiver._id ===
                        currentUser.id
                    ) {

                        actions = `

                            <div class="card-actions">

                                <button
                                    class="button button-light"
                                    onclick="acceptConnection('${connection._id}')"
                                >
                                    Accept
                                </button>

                                <button
                                    class="button"
                                    onclick="rejectConnection('${connection._id}')"
                                >
                                    Reject
                                </button>

                            </div>

                        `;
                    }

                    return `

                        <div class="content-card">

                            <span class="small-label">
                                ${connection.status}
                            </span>

                            <h3>
                                ${escapeHTML(
                                    other.name
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    other.role
                                )}
                            </p>

                            ${actions}

                        </div>

                    `;

                })
                .join("");

    } catch (error) {

        container.innerHTML =
            `<p>${error.message}</p>`;
    }
}


/* ================= ACCEPT ================= */

async function acceptConnection(id) {

    try {

        const data =
            await apiRequest(
                `/api/connections/${id}/accept`,
                {
                    method: "PUT"
                }
            );

        alert(
            data.message
        );

        loadConnections();

    } catch (error) {

        alert(
            error.message
        );
    }
}


/* ================= REJECT ================= */

async function rejectConnection(id) {

    try {

        const data =
            await apiRequest(
                `/api/connections/${id}/reject`,
                {
                    method: "PUT"
                }
            );

        alert(
            data.message
        );

        loadConnections();

    } catch (error) {

        alert(
            error.message
        );
    }
}


/* ================= DASHBOARD LOAD ================= */

async function loadDashboard() {

    await loadProfile();

    await loadMyPitches();

    await loadConnections();
}


/* ================= LOGOUT ================= */

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "deltaToken"
            );

            localStorage.removeItem(
                "deltaUser"
            );

            closeDashboard();

        }
    );


/* ================= TOP LOGIN ================= */

document
    .getElementById("loginTop")
    .addEventListener(
        "click",
        () => {

            openJoin();

            showLogin();

        }
    );


/* ================= MODAL ================= */

authModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            authModal
        ) {

            closeJoin();

        }
    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeJoin();

        }
    }
);


/* ================= SECURITY ================= */

function escapeHTML(value) {

    return String(
        value || ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ================= AUTO LOGIN ================= */

if (
    localStorage.getItem(
        "deltaToken"
    ) &&
    getCurrentUser()
) {

    openDashboard();

}


/* ================= CONSOLE ================= */

console.log(
    "%cDELTA",
    "font-size:32px;font-weight:700;letter-spacing:8px;"
);

console.log(
    "API:",
    API_URL
);