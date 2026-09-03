/* =========================================================
   DELTA FRONTEND JAVASCRIPT
========================================================= */

const API_URL = "https://delta-admin-qdbu.onrender.com";

/* =========================================================
   DOM ELEMENTS
========================================================= */

const authModal = document.getElementById("authModal");
const authChoice = document.getElementById("authChoice");
const registerForm = document.getElementById("registerForm");
const loginFormWrap = document.getElementById("loginFormWrap");
const loginForm = document.getElementById("loginForm");

const continueButton = document.getElementById("continueButton");
const selectedRole = document.getElementById("selectedRole");
const roleText = document.getElementById("roleText");

const registerMessage = document.getElementById("registerMessage");
const loginMessage = document.getElementById("loginMessage");

const landingPage = document.getElementById("landingPage");
const dashboardPage = document.getElementById("dashboardPage");
const footer = document.querySelector(".footer");

let selectedUserRole = null;

/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem("deltaToken");

    const headers = {
        ...(options.headers || {})
    };

    if (options.body) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed (${response.status})`
        );
    }

    return data;
}

/* =========================================================
   AUTH MODAL
========================================================= */

function openJoin(role = null) {

    if (!authModal) return;

    authModal.classList.add("active");
    authModal.classList.remove("hidden");

    if (role) {
        selectedUserRole = role;

        if (selectedRole) {
            selectedRole.textContent = `Selected role: ${role}`;
            selectedRole.dataset.role = role;
        }

        if (roleText) {
            roleText.textContent = role;
        }
    } else {
        selectedUserRole = null;

        if (selectedRole) {
            selectedRole.textContent = "";
            selectedRole.dataset.role = "";
        }

        if (roleText) {
            roleText.textContent = "";
        }
    }

    showRoles();

    document.body.style.overflow = "hidden";
}

function closeJoin() {

    if (!authModal) return;

    authModal.classList.remove("active");
    authModal.classList.add("hidden");

    document.body.style.overflow = "";
}

/* =========================================================
   AUTH SCREENS
========================================================= */

function showRoles() {

    if (authChoice) {
        authChoice.classList.remove("hidden");
    }

    if (registerForm) {
        registerForm.classList.add("hidden");
    }

    if (loginFormWrap) {
        loginFormWrap.classList.add("hidden");
    }
}

function showRegister() {

    if (authChoice) {
        authChoice.classList.add("hidden");
    }

    if (registerForm) {
        registerForm.classList.remove("hidden");
    }

    if (loginFormWrap) {
        loginFormWrap.classList.add("hidden");
    }

    if (registerMessage) {
        registerMessage.textContent = "";
    }

    if (selectedUserRole && roleText) {
        roleText.textContent = selectedUserRole;
    }
}

function showLogin() {

    if (authChoice) {
        authChoice.classList.add("hidden");
    }

    if (registerForm) {
        registerForm.classList.add("hidden");
    }

    if (loginFormWrap) {
        loginFormWrap.classList.remove("hidden");
    }

    if (loginMessage) {
        loginMessage.textContent = "";
    }
}

/* =========================================================
   COMPATIBILITY FUNCTIONS
   These match the onclick names in index.html
========================================================= */

function showRegisterForm() {

    if (!selectedUserRole) {

        if (selectedRole) {
            selectedRole.textContent = "Please select a role first.";
        }

        return;
    }

    showRegister();
}

function showLoginForm() {
    showLogin();
}

function showRegisterChoice() {
    showRoles();
}

/* =========================================================
   ROLE SELECTION
========================================================= */

function chooseRole(role) {

    selectedUserRole = role;

    if (selectedRole) {
        selectedRole.textContent = `Selected role: ${role}`;
        selectedRole.dataset.role = role;
    }

    if (roleText) {
        roleText.textContent = role;
    }
}

/* =========================================================
   REGISTRATION
========================================================= */

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nameElement = document.getElementById("name");
        const emailElement = document.getElementById("email");
        const passwordElement = document.getElementById("password");

        const name = nameElement ? nameElement.value.trim() : "";
        const email = emailElement ? emailElement.value.trim() : "";
        const password = passwordElement ? passwordElement.value : "";

        if (!name || !email || !password) {

            if (registerMessage) {
                registerMessage.textContent =
                    "Please fill all required fields.";
            }

            return;
        }

        if (!selectedUserRole) {

            if (registerMessage) {
                registerMessage.textContent =
                    "Please select a role.";
            }

            return;
        }

        if (password.length < 6) {

            if (registerMessage) {
                registerMessage.textContent =
                    "Password must be at least 6 characters.";
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
                    role: selectedUserRole
                })
            });

            if (!data.success) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            if (registerMessage) {
                registerMessage.textContent =
                    "Account created successfully. Please login.";
            }

            registerForm.reset();

            setTimeout(function () {
                showLogin();
            }, 900);

        } catch (error) {

            console.error("Registration error:", error);

            if (registerMessage) {
                registerMessage.textContent =
                    error.message || "Registration failed.";
            }
        }
    });
}

/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailElement = document.getElementById("loginEmail");
        const passwordElement = document.getElementById("loginPassword");

        const email = emailElement
            ? emailElement.value.trim()
            : "";

        const password = passwordElement
            ? passwordElement.value
            : "";

        if (!email || !password) {

            if (loginMessage) {
                loginMessage.textContent =
                    "Please enter email and password.";
            }

            return;
        }

        if (loginMessage) {
            loginMessage.textContent = "Logging in...";
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
                    data.message || "Login failed."
                );
            }

            if (!data.token) {
                throw new Error(
                    "Login succeeded but no authentication token was received."
                );
            }

            /* Save session */
            localStorage.setItem("deltaToken", data.token);

            if (data.user) {
                localStorage.setItem(
                    "deltaUser",
                    JSON.stringify(data.user)
                );
            }

            if (loginMessage) {
                loginMessage.textContent =
                    "Login successful. Opening dashboard...";
            }

            /* IMPORTANT:
               Close modal and immediately open dashboard */
            setTimeout(function () {

                closeJoin();
                openDashboard();

            }, 300);

        } catch (error) {

            console.error("Login error:", error);

            if (loginMessage) {
                loginMessage.textContent =
                    error.message || "Login failed.";
            }
        }
    });
}

/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {

    try {

        const user = localStorage.getItem("deltaUser");

        if (!user) {
            return null;
        }

        return JSON.parse(user);

    } catch (error) {

        console.error("User parsing error:", error);

        return null;
    }
}

/* =========================================================
   OPEN DASHBOARD
========================================================= */

function openDashboard() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    /* Hide landing */
    if (landingPage) {
        landingPage.classList.add("hidden");
        landingPage.style.display = "none";
    }

    /* Hide footer */
    if (footer) {
        footer.classList.add("hidden");
    }

    /* Show dashboard */
    if (dashboardPage) {

        dashboardPage.classList.remove("hidden");

        dashboardPage.style.display = "flex";
        dashboardPage.style.visibility = "visible";
        dashboardPage.style.opacity = "1";
    }

    /* Greeting */
    const dashboardGreeting =
        document.getElementById("dashboardGreeting");

    const userBadge =
        document.getElementById("userBadge");

    if (dashboardGreeting) {
        dashboardGreeting.textContent =
            `Welcome, ${user.name || "Founder"}.`;
    }

    if (userBadge) {
        userBadge.textContent =
            user.role || "Member";
    }

    showDashboardSection("dashboard");
    loadDashboard();
}

/* =========================================================
   DASHBOARD NAVIGATION
========================================================= */

function showDashboardSection(section) {

    document.querySelectorAll(".dash-section").forEach(function (item) {
        item.classList.add("hidden");
    });

    const target =
        document.getElementById(`section-${section}`);

    if (target) {
        target.classList.remove("hidden");
    }

    /* Correct active state without requiring data-section
       attributes in index.html */

    const sections = [
        "dashboard",
        "profile",
        "pitch",
        "pitches",
        "discover",
        "connections"
    ];

    document.querySelectorAll(".side-link").forEach(function (link, index) {

        link.classList.remove("active");

        if (sections[index] === section) {
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

/* =========================================================
   DASHBOARD LOAD
========================================================= */

async function loadDashboard() {

    await Promise.allSettled([
        loadProfile(),
        loadMyPitches(),
        loadConnections()
    ]);
}

/* =========================================================
   PROFILE
========================================================= */

async function loadProfile() {

    try {

        const data =
            await apiRequest("/api/profiles/me");

        const profile =
            data.profile || data.data || data;

        if (!profile) {
            return;
        }

        const fields = {
            profileName: profile.name || "",
            startupName: profile.startupName || "",
            industry: profile.industry || "",
            location: profile.location || "",
            stage: profile.stage || "",
            website: profile.website || "",
            bio: profile.bio || ""
        };

        Object.keys(fields).forEach(function (id) {

            const element =
                document.getElementById(id);

            if (element) {
                element.value = fields[id];
            }
        });

        const profileStatus =
            document.getElementById("profileStatus");

        if (profileStatus) {

            const completed =
                profile.name &&
                profile.industry &&
                profile.bio;

            profileStatus.textContent =
                completed ? "Complete" : "Incomplete";
        }

    } catch (error) {

        console.log("Profile load:", error.message);
    }
}

/* =========================================================
   SAVE PROFILE
========================================================= */

const profileForm =
    document.getElementById("profileForm");

if (profileForm) {

    profileForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const profileMessage =
            document.getElementById("profileMessage");

        const payload = {
            name: getValue("profileName"),
            startupName: getValue("startupName"),
            industry: getValue("industry"),
            location: getValue("location"),
            stage: getValue("stage"),
            website: getValue("website"),
            bio: getValue("bio")
        };

        if (profileMessage) {
            profileMessage.textContent =
                "Saving profile...";
        }

        try {

            const data =
                await apiRequest("/api/profiles/me", {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });

            if (profileMessage) {
                profileMessage.textContent =
                    data.message ||
                    "Profile saved successfully.";
            }

            const profileStatus =
                document.getElementById("profileStatus");

            if (profileStatus) {
                profileStatus.textContent = "Complete";
            }

        } catch (error) {

            console.error("Profile save:", error);

            if (profileMessage) {
                profileMessage.textContent =
                    error.message || "Failed to save profile.";
            }
        }
    });
}

/* =========================================================
   CREATE PITCH
========================================================= */

const pitchForm =
    document.getElementById("pitchForm");

if (pitchForm) {

    pitchForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const pitchMessage =
            document.getElementById("pitchMessage");

        const payload = {
            title: getValue("pitchTitle"),
            industry: getValue("pitchIndustry"),
            stage: getValue("pitchStage"),
            fundingRequired: getValue("fundingRequired"),
            website: getValue("pitchWebsite"),
            status: getValue("pitchStatus"),
            description: getValue("pitchDescription")
        };

        if (!payload.title || !payload.description) {

            if (pitchMessage) {
                pitchMessage.textContent =
                    "Please add a title and description.";
            }

            return;
        }

        if (pitchMessage) {
            pitchMessage.textContent =
                "Publishing pitch...";
        }

        try {

            const data =
                await apiRequest("/api/pitches", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

            if (pitchMessage) {
                pitchMessage.textContent =
                    data.message ||
                    "Pitch created successfully.";
            }

            pitchForm.reset();

            await loadMyPitches();

            const pitchCount =
                document.getElementById("pitchCount");

            if (pitchCount) {

                const current =
                    parseInt(pitchCount.textContent) || 0;

                pitchCount.textContent = current + 1;
            }

        } catch (error) {

            console.error("Pitch creation:", error);

            if (pitchMessage) {
                pitchMessage.textContent =
                    error.message || "Failed to create pitch.";
            }
        }
    });
}

/* =========================================================
   MY PITCHES
========================================================= */

async function loadMyPitches() {

    const container =
        document.getElementById("myPitches");

    if (!container) {
        return;
    }

    try {

        const data =
            await apiRequest("/api/pitches/my");

        const pitches =
            data.pitches ||
            data.data ||
            [];

        container.innerHTML = "";

        const pitchCount =
            document.getElementById("pitchCount");

        if (pitchCount) {
            pitchCount.textContent = pitches.length;
        }

        if (!pitches.length) {

            container.innerHTML = `
                <div class="empty-state">
                    You haven't created any pitches yet.
                </div>
            `;

            return;
        }

        pitches.forEach(function (pitch) {

            const card =
                document.createElement("div");

            card.className = "content-card";

            card.innerHTML = `
                <h3>${escapeHTML(pitch.title || "Untitled Pitch")}</h3>
                <p>${escapeHTML(
                    pitch.description ||
                    "No description available."
                )}</p>
                <div class="meta">
                    ${escapeHTML(pitch.industry || "General")}
                    ${pitch.stage ? " • " + escapeHTML(pitch.stage) : ""}
                    ${pitch.status ? " • " + escapeHTML(pitch.status) : ""}
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        console.error("Pitches:", error);

        container.innerHTML = `
            <div class="empty-state">
                Unable to load pitches right now.
            </div>
        `;
    }
}

/* =========================================================
   DISCOVER
========================================================= */

const discoverRole =
    document.getElementById("discoverRole");

if (discoverRole) {

    discoverRole.addEventListener("change", function () {
        loadDiscover();
    });
}

async function loadDiscover() {

    const container =
        document.getElementById("discoverUsers");

    if (!container) {
        return;
    }

    const role =
        discoverRole ? discoverRole.value : "";

    container.innerHTML = `
        <div class="empty-state">
            Loading members...
        </div>
    `;

    try {

        let endpoint = "/api/profiles";

        if (role) {
            endpoint += `?role=${encodeURIComponent(role)}`;
        }

        const data =
            await apiRequest(endpoint);

        const users =
            data.profiles ||
            data.users ||
            data.data ||
            [];

        container.innerHTML = "";

        if (!users.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No members found.
                </div>
            `;

            return;
        }

        users.forEach(function (user) {

            const id =
                user._id ||
                user.id;

            const card =
                document.createElement("div");

            card.className = "discover-card";

            card.innerHTML = `
                <h3>${escapeHTML(user.name || "Member")}</h3>
                <p>${escapeHTML(user.role || "Member")}</p>
                <p>${escapeHTML(
                    user.industry ||
                    user.startupName ||
                    ""
                )}</p>
                <button
                    class="btn btn-outline"
                    onclick="sendConnection('${id}')">
                    Connect
                </button>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        console.error("Discover:", error);

        container.innerHTML = `
            <div class="empty-state">
                Unable to load members right now.
            </div>
        `;
    }
}

/* =========================================================
   CONNECTIONS
========================================================= */

async function loadConnections() {

    const container =
        document.getElementById("connectionsList");

    if (!container) {
        return;
    }

    try {

        const data =
            await apiRequest("/api/connections");

        const connections =
            data.connections ||
            data.data ||
            [];

        container.innerHTML = "";

        const connectionCount =
            document.getElementById("connectionCount");

        if (connectionCount) {
            connectionCount.textContent =
                connections.length;
        }

        if (!connections.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No connections yet.
                </div>
            `;

            return;
        }

        connections.forEach(function (connection) {

            const user =
                connection.user ||
                connection.otherUser ||
                connection.receiver ||
                connection.sender ||
                connection;

            const card =
                document.createElement("div");

            card.className = "content-card";

            card.innerHTML = `
                <h3>${escapeHTML(
                    user.name || "Delta Member"
                )}</h3>

                <p>${escapeHTML(
                    user.role || "Member"
                )}</p>

                <div class="meta">
                    ${escapeHTML(
                        connection.status ||
                        "Connected"
                    )}
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        console.error("Connections:", error);

        container.innerHTML = `
            <div class="empty-state">
                Unable to load connections right now.
            </div>
        `;
    }
}

/* =========================================================
   SEND CONNECTION
========================================================= */

async function sendConnection(userId) {

    if (!userId) {
        return;
    }

    try {

        const data =
            await apiRequest("/api/connections", {
                method: "POST",
                body: JSON.stringify({
                    userId
                })
            });

        alert(
            data.message ||
            "Connection request sent successfully."
        );

        loadConnections();

    } catch (error) {

        console.error("Connection:", error);

        alert(
            error.message ||
            "Unable to send connection request."
        );
    }
}

/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        localStorage.removeItem("deltaToken");
        localStorage.removeItem("deltaUser");

        if (dashboardPage) {
            dashboardPage.classList.add("hidden");
            dashboardPage.style.display = "none";
        }

        if (landingPage) {
            landingPage.classList.remove("hidden");
            landingPage.style.display = "";
        }

        if (footer) {
            footer.classList.remove("hidden");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* =========================================================
   HELPERS
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   CLOSE MODAL WITH ESCAPE
========================================================= */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeJoin();
    }
});

/* =========================================================
   RESTORE SESSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const token =
        localStorage.getItem("deltaToken");

    const user =
        getCurrentUser();

    if (token && user) {
        openDashboard();
    }
});