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
const continueButton = document.getElementById("continueButton");

const selectedRole = document.getElementById("selectedRole");
const roleText = document.getElementById("roleText");

const registerMessage = document.getElementById("registerMessage");
const loginMessage = document.getElementById("loginMessage");

const landingPage = document.getElementById("landingPage");
const dashboardPage = document.getElementById("dashboardPage");

let selectedUserRole = null;


/* =========================================
   API HELPER
   ========================================= */

async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem("deltaToken");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    let data;

    try {
        data = await response.json();
    } catch {
        data = {
            success: false,
            message: "Invalid server response"
        };
    }

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}


/* =========================================
   AUTH MODAL
   ========================================= */

function openJoin(role = null) {

    if (!authModal) return;

    authModal.classList.add("active");
    authModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    showRoles();

    if (role) {
        chooseRole(role);
    }
}


function closeJoin() {

    if (!authModal) return;

    authModal.classList.remove("active");
    authModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}


function showRoles() {

    if (authChoice) authChoice.classList.remove("hidden");
    if (registerForm) registerForm.classList.add("hidden");
    if (loginFormWrap) loginFormWrap.classList.add("hidden");
}


function showRegister() {

    if (authChoice) authChoice.classList.add("hidden");
    if (registerForm) registerForm.classList.remove("hidden");
    if (loginFormWrap) loginFormWrap.classList.add("hidden");

    if (registerMessage) {
        registerMessage.textContent = "";
    }
}


function showLogin() {

    if (authChoice) authChoice.classList.add("hidden");
    if (registerForm) registerForm.classList.add("hidden");
    if (loginFormWrap) loginFormWrap.classList.remove("hidden");

    if (loginMessage) {
        loginMessage.textContent = "";
    }
}


function chooseRole(role) {

    selectedUserRole = role;

    if (selectedRole) {
        selectedRole.value = role;
    }

    if (roleText) {
        roleText.textContent = role;
    }

    if (continueButton) {
        continueButton.disabled = false;
    }

    document.querySelectorAll(".role-select button").forEach(button => {

        button.classList.remove("selected");

        const buttonRole =
            button.dataset.role ||
            button.getAttribute("data-role");

        if (buttonRole === role) {
            button.classList.add("selected");
        }
    });
}


/* =========================================
   AUTH BUTTONS
   ========================================= */

document.querySelectorAll("[data-role]").forEach(button => {

    button.addEventListener("click", function () {

        const role = this.dataset.role;

        if (role) {
            chooseRole(role);
        }

    });

});


if (continueButton) {

    continueButton.addEventListener("click", function () {

        if (!selectedUserRole) {
            return;
        }

        showRegister();

    });

}


/* =========================================
   REGISTER
   ========================================= */

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName")?.value.trim();

        const email =
            document.getElementById("registerEmail")?.value.trim();

        const password =
            document.getElementById("registerPassword")?.value;

        const role =
            selectedUserRole ||
            document.getElementById("selectedRole")?.value;

        if (!name || !email || !password || !role) {

            if (registerMessage) {
                registerMessage.textContent =
                    "Please fill all fields.";
            }

            return;
        }

        if (registerMessage) {
            registerMessage.textContent = "Creating your account...";
        }

        try {

            const data = await apiRequest("/api/auth/register", {

                method: "POST",

                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role
                })

            });


            if (!data.success) {
                throw new Error(
                    data.message || "Registration failed"
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


            if (registerMessage) {

                registerMessage.textContent =
                    "Account created successfully.";

            }


            setTimeout(() => {

                closeJoin();
                openDashboard();

            }, 500);


        } catch (error) {

            if (registerMessage) {

                registerMessage.textContent =
                    error.message;

            }

        }

    });

}


/* =========================================
   LOGIN
   ========================================= */

if (loginFormWrap) {

    loginFormWrap.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail")?.value.trim();

        const password =
            document.getElementById("loginPassword")?.value;


        if (!email || !password) {

            if (loginMessage) {
                loginMessage.textContent =
                    "Please enter email and password.";
            }

            return;
        }


        if (loginMessage) {
            loginMessage.textContent =
                "Logging in...";
        }


        try {

            const data = await apiRequest("/api/auth/login", {

                method: "POST",

                body: JSON.stringify({
                    email,
                    password
                })

            });


            if (!data.success) {
                throw new Error(
                    data.message || "Login failed"
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


            if (loginMessage) {

                loginMessage.textContent =
                    "Login successful.";

            }


            setTimeout(() => {

                closeJoin();
                openDashboard();

            }, 400);


        } catch (error) {

            if (loginMessage) {

                loginMessage.textContent =
                    error.message;

            }

        }

    });

}


/* =========================================
   CURRENT USER
   ========================================= */

function getCurrentUser() {

    const raw =
        localStorage.getItem("deltaUser");

    if (!raw) {
        return null;
    }

    try {

        return JSON.parse(raw);

    } catch {

        return null;

    }

}


/* =========================================
   OPEN DASHBOARD
   ========================================= */

function openDashboard() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }


    if (landingPage) {
        landingPage.classList.add("hidden");
    }


    if (dashboardPage) {
        dashboardPage.classList.remove("hidden");
    }


    document.body.style.overflow = "";


    const greeting =
        document.getElementById("dashboardGreeting");

    const badge =
        document.getElementById("userBadge");


    if (greeting) {

        greeting.textContent =
            `Welcome, ${user.name}.`;

    }


    if (badge) {

        badge.textContent =
            user.role;

    }


    showDashboardSection("dashboard");

    loadDashboard();

}


/* =========================================
   DASHBOARD SECTIONS
   ========================================= */

function showDashboardSection(section) {

    document.querySelectorAll(".dash-section").forEach(item => {

        item.classList.add("hidden");

    });


    const target =
        document.getElementById(
            `section-${section}`
        );


    if (target) {

        target.classList.remove("hidden");

    }


    document.querySelectorAll(".side-link").forEach(link => {

        link.classList.remove("active");

        if (
            link.dataset.section === section
        ) {

            link.classList.add("active");

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


/* =========================================
   SIDEBAR NAVIGATION
   ========================================= */

document.querySelectorAll(".side-link").forEach(link => {

    link.addEventListener("click", function (event) {

        event.preventDefault();

        const section =
            this.dataset.section;

        if (section) {

            showDashboardSection(section);

        }

    });

});


/* =========================================
   DASHBOARD OVERVIEW
   ========================================= */

async function loadDashboard() {

    try {

        await Promise.all([
            loadProfile(),
            loadMyPitches(),
            loadConnections()
        ]);

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


/* =========================================
   PROFILE
   ========================================= */

async function loadProfile() {

    try {

        const data =
            await apiRequest("/api/profiles/me");


        const user =
            data.user || getCurrentUser();

        const profile =
            data.profile || {};


        const profileName =
            document.getElementById("profileName");

        const startupName =
            document.getElementById("startupName");

        const industry =
            document.getElementById("industry");

        const location =
            document.getElementById("location");

        const stage =
            document.getElementById("stage");

        const website =
            document.getElementById("website");

        const bio =
            document.getElementById("bio");


        if (profileName) {
            profileName.value =
                user?.name || "";
        }

        if (startupName) {
            startupName.value =
                profile.startupName || "";
        }

        if (industry) {
            industry.value =
                profile.industry || "";
        }

        if (location) {
            location.value =
                profile.location || "";
        }

        if (stage) {
            stage.value =
                profile.stage || "";
        }

        if (website) {
            website.value =
                profile.website || "";
        }

        if (bio) {
            bio.value =
                profile.bio || "";
        }


        let completed = 0;

        const requiredFields = [
            profile.startupName,
            profile.industry,
            profile.location,
            profile.stage,
            profile.bio
        ];


        requiredFields.forEach(field => {

            if (
                field &&
                String(field).trim() !== ""
            ) {

                completed++;

            }

        });


        const percentage =
            Math.round(
                (completed / requiredFields.length) * 100
            );


        const profileStatus =
            document.getElementById("profileStatus");


        if (profileStatus) {

            profileStatus.textContent =
                `${percentage}%`;

        }


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

    }

}


/* =========================================
   UPDATE PROFILE
   ========================================= */

const profileForm =
    document.getElementById("profileForm");


if (profileForm) {

    profileForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const profileMessage =
            document.getElementById("profileMessage");


        const body = {

            startupName:
                document.getElementById("startupName")?.value.trim() || "",

            industry:
                document.getElementById("industry")?.value.trim() || "",

            location:
                document.getElementById("location")?.value.trim() || "",

            stage:
                document.getElementById("stage")?.value.trim() || "",

            website:
                document.getElementById("website")?.value.trim() || "",

            bio:
                document.getElementById("bio")?.value.trim() || ""

        };


        if (profileMessage) {

            profileMessage.textContent =
                "Saving profile...";

        }


        try {

            await apiRequest("/api/profiles/me", {

                method: "PUT",

                body: JSON.stringify(body)

            });


            if (profileMessage) {

                profileMessage.textContent =
                    "Profile updated successfully.";

            }


            await loadProfile();


        } catch (error) {

            if (profileMessage) {

                profileMessage.textContent =
                    error.message;

            }

        }

    });

}


/* =========================================
   CREATE PITCH
   ========================================= */

const pitchForm =
    document.getElementById("pitchForm");


if (pitchForm) {

    pitchForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const pitchMessage =
            document.getElementById("pitchMessage");


        const body = {

            title:
                document.getElementById("pitchTitle")?.value.trim() || "",

            description:
                document.getElementById("pitchDescription")?.value.trim() || "",

            industry:
                document.getElementById("pitchIndustry")?.value.trim() || "",

            stage:
                document.getElementById("pitchStage")?.value.trim() || "",

            fundingRequired:
                document.getElementById("fundingRequired")?.value || 0,

            website:
                document.getElementById("pitchWebsite")?.value.trim() || "",

            status:
                document.getElementById("pitchStatus")?.value || "Draft"

        };


        if (!body.title || !body.description) {

            if (pitchMessage) {

                pitchMessage.textContent =
                    "Title and description are required.";

            }

            return;

        }


        if (pitchMessage) {

            pitchMessage.textContent =
                "Creating pitch...";

        }


        try {

            const data =
                await apiRequest("/api/pitches", {

                    method: "POST",

                    body: JSON.stringify(body)

                });


            if (!data.success) {

                throw new Error(
                    data.message || "Pitch creation failed"
                );

            }


            if (pitchMessage) {

                pitchMessage.textContent =
                    "Pitch created successfully.";

            }


            pitchForm.reset();

            await loadMyPitches();


        } catch (error) {

            if (pitchMessage) {

                pitchMessage.textContent =
                    error.message;

            }

        }

    });

}


/* =========================================
   MY PITCHES
   ========================================= */

async function loadMyPitches() {

    const container =
        document.getElementById("myPitches");


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>Loading pitches...</p>";


    try {

        const data =
            await apiRequest("/api/pitches/my");


        const pitches =
            data.pitches || [];


        const pitchCount =
            document.getElementById("pitchCount");


        if (pitchCount) {

            pitchCount.textContent =
                pitches.length;

        }


        if (pitches.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No pitches yet</h3>
                    <p>Create your first startup pitch.</p>
                </div>
            `;

            return;

        }


        container.innerHTML =
            pitches.map(pitch => `

                <div class="pitch-card">

                    <div class="pitch-card-top">

                        <span class="status-badge">
                            ${escapeHTML(pitch.status || "Draft")}
                        </span>

                    </div>

                    <h3>
                        ${escapeHTML(pitch.title || "Untitled Pitch")}
                    </h3>

                    <p>
                        ${escapeHTML(
                            pitch.description || ""
                        )}
                    </p>

                    <div class="pitch-meta">

                        <span>
                            ${escapeHTML(
                                pitch.industry || "—"
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                pitch.stage || "—"
                            )}
                        </span>

                    </div>

                </div>

            `).join("");


    } catch (error) {

        container.innerHTML = `
            <p class="error-message">
                ${escapeHTML(error.message)}
            </p>
        `;

    }

}


/* =========================================
   DISCOVER
   ========================================= */

async function loadDiscover() {

    const container =
        document.getElementById("discoverUsers");


    if (!container) {
        return;
    }


    const roleSelect =
        document.getElementById("discoverRole");


    const role =
        roleSelect?.value || "";


    container.innerHTML =
        "<p>Loading people...</p>";


    try {

        let endpoint =
            "/api/connections/discover";


        if (role) {

            endpoint +=
                `?role=${encodeURIComponent(role)}`;

        }


        const data =
            await apiRequest(endpoint);


        const users =
            data.users || [];


        if (users.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No people found</h3>
                    <p>Try another role.</p>
                </div>
            `;

            return;

        }


        container.innerHTML =
            users.map(user => `

                <div class="discover-card">

                    <div>

                        <h3>
                            ${escapeHTML(
                                user.name || "Delta Member"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                user.role || ""
                            )}
                        </p>

                        ${
                            user.email
                                ? `<small>${escapeHTML(user.email)}</small>`
                                : ""
                        }

                    </div>

                    <button
                        class="btn btn-primary"
                        onclick="connectUser('${user._id}')"
                    >
                        Connect
                    </button>

                </div>

            `).join("");


    } catch (error) {

        container.innerHTML = `
            <p class="error-message">
                ${escapeHTML(error.message)}
            </p>
        `;

    }

}


/* =========================================
   DISCOVER FILTER
   ========================================= */

const discoverRole =
    document.getElementById("discoverRole");


if (discoverRole) {

    discoverRole.addEventListener("change", function () {

        loadDiscover();

    });

}


/* =========================================
   SEND CONNECTION
   ========================================= */

async function connectUser(userId) {

    if (!userId) {
        return;
    }


    try {

        const data =
            await apiRequest(
                `/api/connections/request/${userId}`,
                {
                    method: "POST"
                }
            );


        alert(
            data.message ||
            "Connection request sent."
        );


        await loadDiscover();

        await loadConnections();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================================
   CONNECTIONS
   ========================================= */

async function loadConnections() {

    const container =
        document.getElementById("connectionsList");


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>Loading connections...</p>";


    try {

        const data =
            await apiRequest("/api/connections");


        const connections =
            data.connections || [];


        const connectionCount =
            document.getElementById("connectionCount");


        const currentUser =
            getCurrentUser();


        const acceptedConnections =
            connections.filter(
                connection =>
                    connection.status === "accepted"
            );


        if (connectionCount) {

            connectionCount.textContent =
                acceptedConnections.length;

        }


        if (connections.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No connections yet</h3>
                    <p>Discover founders, investors and consultants.</p>
                </div>
            `;

            return;

        }


        container.innerHTML =
            connections.map(connection => {

                const sender =
                    connection.sender || {};

                const receiver =
                    connection.receiver || {};


                const currentId =
                    String(currentUser?.id || "");


                const senderId =
                    String(sender._id || "");


                const receiverId =
                    String(receiver._id || "");


                const otherUser =
                    senderId === currentId
                        ? receiver
                        : sender;


                let actions = "";


                if (
                    connection.status === "pending" &&
                    receiverId === currentId
                ) {

                    actions = `

                        <button
                            class="btn btn-primary"
                            onclick="acceptConnection('${connection._id}')"
                        >
                            Accept
                        </button>

                        <button
                            class="btn btn-secondary"
                            onclick="rejectConnection('${connection._id}')"
                        >
                            Reject
                        </button>

                    `;

                }


                return `

                    <div class="connection-card">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    otherUser.name ||
                                    "Delta Member"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    otherUser.role ||
                                    ""
                                )}
                            </p>

                            <span class="status-badge">
                                ${escapeHTML(
                                    connection.status ||
                                    "pending"
                                )}
                            </span>

                        </div>

                        <div class="connection-actions">

                            ${actions}

                        </div>

                    </div>

                `;

            }).join("");


    } catch (error) {

        container.innerHTML = `
            <p class="error-message">
                ${escapeHTML(error.message)}
            </p>
        `;

    }

}


/* =========================================
   ACCEPT CONNECTION
   ========================================= */

async function acceptConnection(connectionId) {

    try {

        const data =
            await apiRequest(
                `/api/connections/${connectionId}/accept`,
                {
                    method: "PUT"
                }
            );


        alert(
            data.message ||
            "Connection accepted."
        );


        await loadConnections();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================================
   REJECT CONNECTION
   ========================================= */

async function rejectConnection(connectionId) {

    try {

        const data =
            await apiRequest(
                `/api/connections/${connectionId}/reject`,
                {
                    method: "PUT"
                }
            );


        alert(
            data.message ||
            "Connection rejected."
        );


        await loadConnections();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================================
   LOGOUT
   ========================================= */

function logout() {

    localStorage.removeItem("deltaToken");
    localStorage.removeItem("deltaUser");

    if (dashboardPage) {
        dashboardPage.classList.add("hidden");
    }

    if (landingPage) {
        landingPage.classList.remove("hidden");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   AUTO LOGIN
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const user =
        getCurrentUser();

    const token =
        localStorage.getItem("deltaToken");


    if (user && token) {

        openDashboard();

    }

});