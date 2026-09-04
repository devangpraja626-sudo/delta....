/* =========================================================
   DELTA FRONTEND — V1
   Authentication
   Profiles
   Pitches
   Discover
   Connections
   Messaging
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL = "https://delta-7.onrender.com";


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentUser =
    JSON.parse(
        localStorage.getItem("deltaUser") || "null"
    );

let selectedRole = "";

let activeChatUser = null;


/* =========================================================
   API REQUEST HELPER
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        localStorage.getItem("deltaToken");

    const headers = {
        ...(options.headers || {})
    };

    if (options.body) {
        headers["Content-Type"] =
            "application/json";
    }

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    let response;

    try {

        response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

    } catch (error) {

        throw new Error(
            "Unable to connect to Delta server."
        );
    }


    let data = {};

    try {
        data = await response.json();
    } catch (_) {
        data = {};
    }


    if (!response.ok) {

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "deltaToken"
            );

            localStorage.removeItem(
                "deltaUser"
            );

            currentUser = null;
        }

        throw new Error(
            data.message ||
            `Request failed (${response.status})`
        );
    }

    return data;
}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getUserId(user) {

    if (!user) return "";

    return String(
        user._id ||
        user.id ||
        ""
    );
}


function formatDate(date) {

    if (!date) return "";

    const value =
        new Date(date);

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {
        return "";
    }

    return value.toLocaleDateString(
        [],
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function formatMessageTime(date) {

    if (!date) return "";

    const value =
        new Date(date);

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {
        return "";
    }

    return value.toLocaleString(
        [],
        {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function safeImageUrl(url) {

    if (!url) return "";

    try {

        const parsed =
            new URL(url);

        if (
            parsed.protocol !== "http:" &&
            parsed.protocol !== "https:"
        ) {
            return "";
        }

        return parsed.href;

    } catch (_) {

        return "";
    }
}


/* =========================================================
   LANDING / DASHBOARD
========================================================= */

function showLanding() {

    const landing =
        document.getElementById(
            "landingPage"
        );

    const dashboard =
        document.getElementById(
            "dashboardPage"
        );

    if (landing) {
        landing.style.display = "";
    }

    if (dashboard) {
        dashboard.style.display = "none";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showDashboard() {

    const landing =
        document.getElementById(
            "landingPage"
        );

    const dashboard =
        document.getElementById(
            "dashboardPage"
        );

    if (landing) {
        landing.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "flex";
    }

    updateDashboardUser();

    showDashboardSection(
        "overview"
    );
}


function showDashboardSection(
    section
) {

    const sections = [
        "overview",
        "profile",
        "createPitch",
        "myPitches",
        "createPost",
        "myPosts",
        "discover",
        "connections",
        "messages"
    ];


    sections.forEach(
        name => {

            const element =
                document.getElementById(
                    `${name}Section`
                );

            if (!element) return;

            element.style.display =
                name === section
                    ? ""
                    : "none";
        }
    );


    document
        .querySelectorAll(
            ".dashboard-nav-item"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section ===
                    section
            );

        });


    switch (section) {

        case "overview":
            loadOverview();
            break;

        case "profile":
            loadProfile();
            break;

        case "myPitches":
            loadMyPitches();
            break;

        case "createPost":
            preparePostComposer();
            break;

        case "myPosts":
            loadMyPosts();
            break;

        case "discover":
            loadDiscover("");
            break;

        case "connections":
            loadConnections();
            break;

        case "messages":
            loadConversations();
            break;
    }
}


/* =========================================================
   DASHBOARD USER
========================================================= */

function updateDashboardUser() {

    if (!currentUser) return;

    const name =
        currentUser.name ||
        "User";

    const role =
        currentUser.role ||
        "";


    const elements = {

        dashboardName:
            document.getElementById(
                "dashboardName"
            ),

        dashboardRole:
            document.getElementById(
                "dashboardRole"
            ),

        overviewName:
            document.getElementById(
                "overviewName"
            ),

        profileDisplayName:
            document.getElementById(
                "profileDisplayName"
            ),

        profileDisplayRole:
            document.getElementById(
                "profileDisplayRole"
            ),

        postComposerName:
            document.getElementById(
                "postComposerName"
            ),

        postComposerRole:
            document.getElementById(
                "postComposerRole"
            )
    };


    if (elements.dashboardName) {
        elements.dashboardName.textContent =
            name;
    }

    if (elements.dashboardRole) {
        elements.dashboardRole.textContent =
            role;
    }

    if (elements.overviewName) {
        elements.overviewName.textContent =
            name;
    }

    if (elements.profileDisplayName) {
        elements.profileDisplayName.textContent =
            name;
    }

    if (elements.profileDisplayRole) {
        elements.profileDisplayRole.textContent =
            role;
    }

    if (elements.postComposerName) {
        elements.postComposerName.textContent =
            name;
    }

    if (elements.postComposerRole) {
        elements.postComposerRole.textContent =
            role;
    }


    const avatarLetter =
        name
            .charAt(0)
            .toUpperCase();


    [
        "dashboardAvatar",
        "profileAvatar",
        "postComposerAvatar"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                avatarLetter;
        }

    });


    const pitchNav =
        document.getElementById(
            "createPitchNav"
        );

    const myPitchesNav =
        document.getElementById(
            "myPitchesNav"
        );


    if (
        role === "Founder"
    ) {

        if (pitchNav) {
            pitchNav.style.display = "";
        }

        if (myPitchesNav) {
            myPitchesNav.style.display = "";
        }

    } else {

        if (pitchNav) {
            pitchNav.style.display = "none";
        }

        if (myPitchesNav) {
            myPitchesNav.style.display = "none";
        }
    }
}


/* =========================================================
   AUTH
========================================================= */

function openAuth(
    mode = "register",
    role = ""
) {

    const modal =
        document.getElementById(
            "authModal"
        );

    if (!modal) return;

    modal.style.display = "flex";

    if (mode === "login") {
        showLoginForm();
        return;
    }

    if (role) {
        selectedRole = role;
        showRegisterForm();
        return;
    }

    showAuthChoice();
}


function closeAuth() {

    const modal =
        document.getElementById(
            "authModal"
        );

    if (modal) {
        modal.style.display = "none";
    }
}


function showAuthChoice() {

    hideAuthViews();

    const choice =
        document.getElementById(
            "authChoice"
        );

    if (choice) {
        choice.style.display = "";
    }
}


function showRegisterForm() {

    hideAuthViews();

    const form =
        document.getElementById(
            "registerForm"
        );

    if (form) {
        form.style.display = "";
    }


    const roleText =
        document.getElementById(
            "selectedRoleText"
        );

    if (roleText) {

        roleText.textContent =
            selectedRole
                ? `Joining Delta as ${selectedRole}.`
                : "Create your account.";
    }
}


function showLoginForm() {

    hideAuthViews();

    const form =
        document.getElementById(
            "loginForm"
        );

    if (form) {
        form.style.display = "";
    }
}


function hideAuthViews() {

    [
        "authChoice",
        "registerForm",
        "loginForm"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.style.display =
                "none";
        }

    });
}


function selectRole(role) {

    selectedRole = role;

    showRegisterForm();
}


/* =========================================================
   REGISTER
========================================================= */

async function registerUser(event) {

    event.preventDefault();

    const name =
        document.getElementById(
            "registerName"
        ).value.trim();

    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "registerPassword"
        ).value;

    const message =
        document.getElementById(
            "registerMessage"
        );


    if (!selectedRole) {

        if (message) {
            message.textContent =
                "Please select a role.";
        }

        return;
    }


    if (message) {
        message.textContent =
            "Creating your Delta account...";
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
                        role: selectedRole
                    })
                }
            );


        if (!data.token) {
            throw new Error(
                data.message ||
                "Registration failed"
            );
        }


        localStorage.setItem(
            "deltaToken",
            data.token
        );

        localStorage.setItem(
            "deltaUser",
            JSON.stringify(
                data.user
            )
        );


        currentUser =
            data.user;


        closeAuth();

        showDashboard();

        await loadProfile();


    } catch (error) {

        if (message) {
            message.textContent =
                error.message;
        }
    }
}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(event) {

    event.preventDefault();

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        ).value;

    const message =
        document.getElementById(
            "loginMessage"
        );


    if (message) {
        message.textContent =
            "Signing you in...";
    }


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


        if (!data.token) {
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
            JSON.stringify(
                data.user
            )
        );


        currentUser =
            data.user;


        closeAuth();

        showDashboard();

        await loadProfile();


    } catch (error) {

        if (message) {
            message.textContent =
                error.message;
        }
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "deltaToken"
    );

    localStorage.removeItem(
        "deltaUser"
    );

    currentUser = null;

    activeChatUser = null;

    showLanding();
}


/* =========================================================
   PROFILE
========================================================= */

async function loadProfile() {

    if (!currentUser) return;

    const container =
        document.getElementById(
            "profileRoleFields"
        );

    if (!container) return;


    container.innerHTML = `
        <div class="empty-state">
            Loading your profile...
        </div>
    `;


    try {

        const data =
            await apiRequest(
                "/api/profiles/me"
            );


        renderProfileFields(
            data.profile || {}
        );


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


function renderProfileFields(
    profile
) {

    const container =
        document.getElementById(
            "profileRoleFields"
        );

    if (!container) return;


    const role =
        currentUser.role;


    if (role === "Founder") {

        container.innerHTML = `

            <div class="form-grid">

                <div class="input-group">
                    <label>Startup Name</label>

                    <input
                        type="text"
                        id="profileStartupName"
                        value="${escapeHTML(
                            profile.startupName || ""
                        )}"
                        placeholder="Your startup"
                    >
                </div>


                <div class="input-group">
                    <label>Industry</label>

                    <input
                        type="text"
                        id="profileIndustry"
                        value="${escapeHTML(
                            profile.industry || ""
                        )}"
                        placeholder="Technology, Fintech..."
                    >
                </div>


                <div class="input-group">
                    <label>Startup Stage</label>

                    <input
                        type="text"
                        id="profileStage"
                        value="${escapeHTML(
                            profile.stage || ""
                        )}"
                        placeholder="Idea, MVP, Growth..."
                    >
                </div>


                <div class="input-group">
                    <label>Location</label>

                    <input
                        type="text"
                        id="profileLocation"
                        value="${escapeHTML(
                            profile.location || ""
                        )}"
                        placeholder="City, Country"
                    >
                </div>


                <div class="input-group full-width">
                    <label>Startup Website</label>

                    <input
                        type="url"
                        id="profileWebsite"
                        value="${escapeHTML(
                            profile.website || ""
                        )}"
                        placeholder="https://..."
                    >
                </div>


                <div class="input-group full-width">
                    <label>Idea</label>

                    <textarea
                        id="profileIdea"
                        rows="5"
                        maxlength="3000"
                        placeholder="Tell people what you're building..."
                    >${escapeHTML(
                        profile.idea || ""
                    )}</textarea>
                </div>


                <div class="input-group full-width">
                    <label>About You</label>

                    <textarea
                        id="profileBio"
                        rows="6"
                        maxlength="2000"
                        placeholder="Tell the Delta network about yourself..."
                    >${escapeHTML(
                        profile.bio || ""
                    )}</textarea>
                </div>

            </div>
        `;

        return;
    }


    if (role === "Investor") {

        container.innerHTML = `

            <div class="form-grid">

                <div class="input-group">
                    <label>Firm Name</label>

                    <input
                        type="text"
                        id="profileFirmName"
                        value="${escapeHTML(
                            profile.firmName || ""
                        )}"
                        placeholder="Fund / Firm"
                    >
                </div>


                <div class="input-group">
                    <label>Investment Focus</label>

                    <input
                        type="text"
                        id="profileInvestmentFocus"
                        value="${escapeHTML(
                            profile.investmentFocus || ""
                        )}"
                        placeholder="Early-stage startups..."
                    >
                </div>


                <div class="input-group">
                    <label>Industries</label>

                    <input
                        type="text"
                        id="profileIndustries"
                        value="${escapeHTML(
                            Array.isArray(
                                profile.industries
                            )
                                ? profile.industries.join(", ")
                                : ""
                        )}"
                        placeholder="AI, Fintech, SaaS..."
                    >
                </div>


                <div class="input-group">
                    <label>Ticket Size</label>

                    <input
                        type="text"
                        id="profileTicketSize"
                        value="${escapeHTML(
                            profile.ticketSize || ""
                        )}"
                        placeholder="₹10L - ₹1Cr"
                    >
                </div>


                <div class="input-group">
                    <label>Location</label>

                    <input
                        type="text"
                        id="profileLocation"
                        value="${escapeHTML(
                            profile.location || ""
                        )}"
                        placeholder="City, Country"
                    >
                </div>


                <div class="input-group full-width">
                    <label>About You</label>

                    <textarea
                        id="profileBio"
                        rows="7"
                        maxlength="2000"
                        placeholder="Tell founders about your investment thesis..."
                    >${escapeHTML(
                        profile.bio || ""
                    )}</textarea>
                </div>

            </div>
        `;

        return;
    }


    if (role === "Consultant") {

        container.innerHTML = `

            <div class="form-grid">

                <div class="input-group full-width">
                    <label>Expertise</label>

                    <input
                        type="text"
                        id="profileExpertise"
                        value="${escapeHTML(
                            Array.isArray(
                                profile.expertise
                            )
                                ? profile.expertise.join(", ")
                                : ""
                        )}"
                        placeholder="Marketing, Strategy, Finance..."
                    >
                </div>


                <div class="input-group">
                    <label>Experience</label>

                    <input
                        type="text"
                        id="profileExperience"
                        value="${escapeHTML(
                            profile.experience || ""
                        )}"
                        placeholder="8 years"
                    >
                </div>


                <div class="input-group">
                    <label>Hourly Rate</label>

                    <input
                        type="text"
                        id="profileHourlyRate"
                        value="${escapeHTML(
                            profile.hourlyRate || ""
                        )}"
                        placeholder="₹2,000/hour"
                    >
                </div>


                <div class="input-group">
                    <label>Location</label>

                    <input
                        type="text"
                        id="profileLocation"
                        value="${escapeHTML(
                            profile.location || ""
                        )}"
                        placeholder="City, Country"
                    >
                </div>


                <div class="input-group">
                    <label>Website</label>

                    <input
                        type="url"
                        id="profileWebsite"
                        value="${escapeHTML(
                            profile.website || ""
                        )}"
                        placeholder="https://..."
                    >
                </div>


                <div class="input-group full-width">
                    <label>About You</label>

                    <textarea
                        id="profileBio"
                        rows="7"
                        maxlength="2000"
                        placeholder="Tell founders how you can help..."
                    >${escapeHTML(
                        profile.bio || ""
                    )}</textarea>
                </div>

            </div>
        `;
    }
}


async function saveProfile(event) {

    event.preventDefault();

    const message =
        document.getElementById(
            "profileMessage"
        );


    if (message) {
        message.textContent =
            "Saving profile...";
    }


    let payload = {};


    if (
        currentUser.role ===
        "Founder"
    ) {

        payload = {

            startupName:
                getInputValue(
                    "profileStartupName"
                ),

            idea:
                getInputValue(
                    "profileIdea"
                ),

            industry:
                getInputValue(
                    "profileIndustry"
                ),

            stage:
                getInputValue(
                    "profileStage"
                ),

            location:
                getInputValue(
                    "profileLocation"
                ),

            website:
                getInputValue(
                    "profileWebsite"
                ),

            bio:
                getInputValue(
                    "profileBio"
                )
        };
    }


    if (
        currentUser.role ===
        "Investor"
    ) {

        payload = {

            firmName:
                getInputValue(
                    "profileFirmName"
                ),

            investmentFocus:
                getInputValue(
                    "profileInvestmentFocus"
                ),

            industries:
                getInputValue(
                    "profileIndustries"
                )
                    .split(",")
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(Boolean),

            ticketSize:
                getInputValue(
                    "profileTicketSize"
                ),

            location:
                getInputValue(
                    "profileLocation"
                ),

            bio:
                getInputValue(
                    "profileBio"
                )
        };
    }


    if (
        currentUser.role ===
        "Consultant"
    ) {

        payload = {

            expertise:
                getInputValue(
                    "profileExpertise"
                )
                    .split(",")
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(Boolean),

            experience:
                getInputValue(
                    "profileExperience"
                ),

            hourlyRate:
                getInputValue(
                    "profileHourlyRate"
                ),

            location:
                getInputValue(
                    "profileLocation"
                ),

            website:
                getInputValue(
                    "profileWebsite"
                ),

            bio:
                getInputValue(
                    "profileBio"
                )
        };
    }


    try {

        await apiRequest(
            "/api/profiles/me",
            {
                method: "PUT",

                body:
                    JSON.stringify(
                        payload
                    )
            }
        );


        if (message) {
            message.textContent =
                "Profile saved successfully.";
        }


    } catch (error) {

        if (message) {
            message.textContent =
                error.message;
        }
    }
}


function getInputValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


/* =========================================================
   PITCHES
========================================================= */

async function createPitch(
    event
) {

    event.preventDefault();

    const message =
        document.getElementById(
            "pitchMessage"
        );


    if (
        !currentUser ||
        currentUser.role !==
            "Founder"
    ) {

        if (message) {
            message.textContent =
                "Only founders can create pitches.";
        }

        return;
    }


    const payload = {

        title:
            getInputValue(
                "pitchTitle"
            ),

        description:
            getInputValue(
                "pitchDescription"
            ),

        industry:
            getInputValue(
                "pitchIndustry"
            ),

        stage:
            getInputValue(
                "pitchStage"
            ),

        fundingRequired:
            getInputValue(
                "fundingRequired"
            ),

        website:
            getInputValue(
                "pitchWebsite"
            ),

        status:
            getInputValue(
                "pitchStatus"
            )
    };


    if (message) {
        message.textContent =
            "Creating pitch...";
    }


    try {

        await apiRequest(
            "/api/pitches",
            {
                method: "POST",

                body:
                    JSON.stringify(
                        payload
                    )
            }
        );


        if (message) {
            message.textContent =
                "Pitch created successfully.";
        }


        document
            .getElementById(
                "pitchForm"
            )
            ?.reset();


        await loadMyPitches();


    } catch (error) {

        if (message) {
            message.textContent =
                error.message;
        }
    }
}


async function loadMyPitches() {

    const container =
        document.getElementById(
            "myPitches"
        );

    if (!container) return;


    container.innerHTML = `
        <div class="empty-state">
            Loading pitches...
        </div>
    `;


    try {

        const data =
            await apiRequest(
                "/api/pitches/my"
            );


        const pitches =
            data.pitches || [];


        const count =
            document.getElementById(
                "pitchCount"
            );

        if (count) {
            count.textContent =
                pitches.length;
        }


        if (!pitches.length) {

            container.innerHTML = `
                <div class="empty-state">
                    You haven't created a pitch yet.
                </div>
            `;

            return;
        }


        container.innerHTML =
            pitches.map(
                pitch => `
                    <article class="pitch-card">

                        <div class="pitch-card-top">

                            <span>
                                ${escapeHTML(
                                    pitch.status
                                )}
                            </span>

                            <small>
                                ${formatDate(
                                    pitch.createdAt
                                )}
                            </small>

                        </div>

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

                        <div class="pitch-meta">

                            <span>
                                ${escapeHTML(
                                    pitch.industry ||
                                    "Industry"
                                )}
                            </span>

                            <span>
                                ${escapeHTML(
                                    pitch.stage ||
                                    "Stage"
                                )}
                            </span>

                        </div>

                    </article>
                `
            ).join("");


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


/* =========================================================
   DISCOVER
========================================================= */

async function loadDiscover(
    role = ""
) {

    const container =
        document.getElementById(
            "discoverUsers"
        );

    if (!container) return;


    container.innerHTML = `
        <div class="empty-state">
            Discovering people...
        </div>
    `;


    try {

        const endpoint =
            role
                ? `/api/connections/discover?role=${encodeURIComponent(role)}`
                : "/api/connections/discover";


        const data =
            await apiRequest(
                endpoint
            );


        const users =
            data.users || [];


        if (!users.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No people found.
                </div>
            `;

            return;
        }


        container.innerHTML =
            users.map(
                user => {

                    const initials =
                        (user.name || "U")
                            .charAt(0)
                            .toUpperCase();


                    return `

                        <article
                            class="discover-card"
                        >

                            <div
                                class="discover-avatar"
                            >
                                ${initials}
                            </div>

                            <div
                                class="discover-card-content"
                            >

                                <span
                                    class="discover-role"
                                >
                                    ${escapeHTML(
                                        user.role
                                    )}
                                </span>

                                <h3>
                                    ${escapeHTML(
                                        user.name
                                    )}
                                </h3>

                                <p>
                                    Member since
                                    ${formatDate(
                                        user.createdAt
                                    )}
                                </p>

                                <div
                                    class="discover-actions"
                                >

                                    <button
                                        class="secondary-btn"
                                        onclick="sendConnectionRequest('${user._id}')"
                                    >
                                        Connect
                                    </button>

                                    <button
                                        class="text-link"
                                        onclick="openUserActivity('${user._id}')"
                                    >
                                        Activity →
                                    </button>

                                </div>

                            </div>

                        </article>
                    `;
                }
            ).join("");


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


/* =========================================================
   CONNECTIONS
========================================================= */

async function sendConnectionRequest(
    userId
) {

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


        await loadDiscover("");

    } catch (error) {

        alert(
            error.message
        );
    }
}


function getConnectionOtherUser(
    connection
) {

    const currentId =
        String(
            currentUser.id
        );


    const sender =
        connection.sender;

    const receiver =
        connection.receiver;


    const senderId =
        String(
            sender?._id ||
            sender
        );


    return senderId === currentId
        ? receiver
        : sender;
}


async function loadConnections() {

    const container =
        document.getElementById(
            "connectionsList"
        );

    if (!container) return;


    container.innerHTML = `
        <div class="empty-state">
            Loading connections...
        </div>
    `;


    try {

        const data =
            await apiRequest(
                "/api/connections"
            );


        const connections =
            data.connections || [];


        const count =
            document.getElementById(
                "connectionCount"
            );

        if (count) {
            count.textContent =
                connections.filter(
                    connection =>
                        connection.status ===
                        "accepted"
                ).length;
        }


        if (!connections.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No connection activity yet.
                </div>
            `;

            return;
        }


        container.innerHTML =
            connections.map(
                connection => {

                    const otherUser =
                        getConnectionOtherUser(
                            connection
                        );


                    if (!otherUser) {
                        return "";
                    }


                    const name =
                        escapeHTML(
                            otherUser.name
                        );

                    const role =
                        escapeHTML(
                            otherUser.role
                        );


                    /* =====================
                       ACCEPTED
                    ===================== */

                    if (
                        connection.status ===
                        "accepted"
                    ) {

                        return `

                            <article
                                class="connection-card accepted"
                            >

                                <div
                                    class="connection-user"
                                >

                                    <div
                                        class="discover-avatar"
                                    >
                                        ${name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>

                                        <span>
                                            CONNECTED
                                        </span>

                                        <h3>
                                            ${name}
                                        </h3>

                                        <p>
                                            ${role}
                                        </p>

                                    </div>

                                </div>


                                <div
                                    class="connection-actions"
                                >

                                    <button
                                        class="primary-btn"
                                        onclick="openChat(
                                            '${otherUser._id}',
                                            '${name}',
                                            '${role}'
                                        )"
                                    >
                                        Message
                                        <span>↗</span>
                                    </button>

                                </div>

                            </article>
                        `;
                    }


                    /* =====================
                       INCOMING REQUEST
                    ===================== */

                    if (
                        connection.status ===
                            "pending" &&
                        String(
                            connection.receiver?._id ||
                            connection.receiver
                        ) ===
                            String(
                                currentUser.id
                            )
                    ) {

                        return `

                            <article
                                class="connection-card pending"
                            >

                                <div
                                    class="connection-user"
                                >

                                    <div
                                        class="discover-avatar"
                                    >
                                        ${name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>

                                        <span>
                                            CONNECTION REQUEST
                                        </span>

                                        <h3>
                                            ${name}
                                        </h3>

                                        <p>
                                            ${role}
                                        </p>

                                    </div>

                                </div>


                                <div
                                    class="connection-actions"
                                >

                                    <button
                                        class="primary-btn"
                                        onclick="acceptConnection('${connection._id}')"
                                    >
                                        Accept
                                    </button>

                                    <button
                                        class="secondary-btn"
                                        onclick="rejectConnection('${connection._id}')"
                                    >
                                        Reject
                                    </button>

                                </div>

                            </article>
                        `;
                    }


                    /* =====================
                       OUTGOING REQUEST
                    ===================== */

                    if (
                        connection.status ===
                            "pending"
                    ) {

                        return `

                            <article
                                class="connection-card pending"
                            >

                                <div
                                    class="connection-user"
                                >

                                    <div
                                        class="discover-avatar"
                                    >
                                        ${name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>

                                        <span>
                                            REQUEST SENT
                                        </span>

                                        <h3>
                                            ${name}
                                        </h3>

                                        <p>
                                            ${role}
                                        </p>

                                    </div>

                                </div>

                            </article>
                        `;
                    }


                    return "";
                }
            ).join("");


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


async function acceptConnection(
    connectionId
) {

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

        alert(
            error.message
        );
    }
}


async function rejectConnection(
    connectionId
) {

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

        alert(
            error.message
        );
    }
}


/* =========================================================
   POSTS
========================================================= */

function preparePostComposer() {

    updateDashboardUser();
}


async function createPost(event) {

    event.preventDefault();


    const content =
        getInputValue(
            "postContent"
        );

    const imageUrl =
        getInputValue(
            "postImageUrl"
        );

    const message =
        document.getElementById(
            "postMessage"
        );


    if (!content) {

        if (message) {
            message.textContent =
                "Write something before publishing.";
        }

        return;
    }


    if (imageUrl) {

        const validUrl =
            safeImageUrl(
                imageUrl
            );

        if (!validUrl) {

            if (message) {
                message.textContent =
                    "Please enter a valid image URL.";
            }

            return;
        }
    }


    if (message) {
        message.textContent =
            "Publishing...";
    }


    try {

        await apiRequest(
            "/api/posts",
            {
                method: "POST",

                body:
                    JSON.stringify({
                        content,
                        imageUrl
                    })
            }
        );


        document
            .getElementById(
                "postForm"
            )
            ?.reset();


        if (message) {
            message.textContent =
                "Post published successfully.";
        }


        await loadMyPosts();


    } catch (error) {

        if (message) {
            message.textContent =
                error.message;
        }
    }
}


async function loadMyPosts() {

    const container =
        document.getElementById(
            "myPosts"
        );

    if (!container) return;


    container.innerHTML = `
        <div class="empty-state">
            Loading your posts...
        </div>
    `;


    try {

        const data =
            await apiRequest(
                "/api/posts/my"
            );


        const posts =
            data.posts || [];


        const count =
            document.getElementById(
                "postCount"
            );

        if (count) {
            count.textContent =
                posts.length;
        }


        if (!posts.length) {

            container.innerHTML = `
                <div class="empty-state">
                    You haven't published anything yet.
                </div>
            `;

            return;
        }


        container.innerHTML =
            posts.map(
                renderPostCard
            ).join("");


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


async function loadFeed(
    containerId = "overviewPosts"
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) return;


    try {

        const data =
            await apiRequest(
                "/api/posts/feed"
            );


        const posts =
            data.posts || [];


        if (!posts.length) {

            container.innerHTML = `
                <div class="empty-state">
                    The Delta network is waiting
                    for its first stories.
                </div>
            `;

            return;
        }


        container.innerHTML =
            posts
                .slice(0, 6)
                .map(
                    renderPostCard
                )
                .join("");


        updateFloatingPosts(
            posts
        );


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                Unable to load network activity.
            </div>
        `;
    }
}


function renderPostCard(
    post
) {

    const author =
        post.author || {};

    const authorId =
        String(
            author._id ||
            author.id ||
            ""
        );


    const currentId =
        currentUser
            ? String(
                currentUser.id
            )
            : "";


    const liked =
        Array.isArray(
            post.likes
        ) &&
        currentUser &&
        post.likes.some(
            id =>
                String(
                    id?._id ||
                    id
                ) ===
                currentId
        );


    const likesCount =
        post.likesCount !== undefined
            ? post.likesCount
            : Array.isArray(post.likes)
                ? post.likes.length
                : 0;


    const image =
        safeImageUrl(
            post.imageUrl
        );


    return `

        <article
            class="post-card"
        >

            <div
                class="post-card-header"
            >

                <div
                    class="post-author"
                >

                    <div
                        class="post-avatar"
                    >
                        ${(author.name || "U")
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(
                                author.name ||
                                "Delta Member"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                author.role ||
                                ""
                            )}
                        </span>

                    </div>

                </div>


                <time>
                    ${formatDate(
                        post.createdAt
                    )}
                </time>

            </div>


            <div
                class="post-content"
            >
                ${escapeHTML(
                    post.content
                )}
            </div>


            ${
                image
                    ? `
                        <img
                            class="post-image"
                            src="${escapeHTML(image)}"
                            alt="Post image"
                            loading="lazy"
                            onerror="this.style.display='none'"
                        >
                    `
                    : ""
            }


            <div
                class="post-card-footer"
            >

                ${
                    currentUser
                        ? `
                            <button
                                class="post-like-btn ${
                                    liked
                                        ? "liked"
                                        : ""
                                }"
                                onclick="toggleLike('${post._id}')"
                            >
                                ${liked ? "♥" : "♡"}
                                ${likesCount}
                            </button>
                        `
                        : `
                            <button
                                class="post-like-btn"
                                onclick="openAuth('login')"
                            >
                                ♡ ${likesCount}
                            </button>
                        `
                }


                ${
                    authorId ===
                    currentId
                        ? `
                            <button
                                class="post-delete-btn"
                                onclick="deletePost('${post._id}')"
                            >
                                Delete
                            </button>
                        `
                        : ""
                }

            </div>

        </article>
    `;
}


async function toggleLike(
    postId
) {

    if (!currentUser) {

        openAuth("login");

        return;
    }


    try {

        await apiRequest(
            `/api/posts/${postId}/like`,
            {
                method: "POST"
            }
        );


        await loadFeed(
            "overviewPosts"
        );


        const currentSection =
            document.querySelector(
                ".dashboard-nav-item.active"
            );


        if (
            currentSection?.dataset.section ===
            "myPosts"
        ) {
            await loadMyPosts();
        }


    } catch (error) {

        alert(
            error.message
        );
    }
}


async function deletePost(
    postId
) {

    if (
        !confirm(
            "Delete this post?"
        )
    ) {
        return;
    }


    try {

        await apiRequest(
            `/api/posts/${postId}`,
            {
                method: "DELETE"
            }
        );


        await loadMyPosts();

        await loadFeed(
            "overviewPosts"
        );


    } catch (error) {

        alert(
            error.message
        );
    }
}


/* =========================================================
   FLOATING HOMEPAGE ACTIVITY
========================================================= */

let floatingPostIndex = 0;

let floatingPostTimer = null;


function updateFloatingPosts(
    posts
) {

    const container =
        document.getElementById(
            "floatingPosts"
        );

    if (!container) return;


    const founders =
        posts.filter(
            post =>
                post.author?.role ===
                "Founder"
        );


    const source =
        founders.length
            ? founders
            : posts;


    if (!source.length) {

        container.innerHTML = "";

        return;
    }


    clearInterval(
        floatingPostTimer
    );


    function renderFloating() {

        const post =
            source[
                floatingPostIndex %
                source.length
            ];

        floatingPostIndex++;


        const author =
            post.author || {};


        container.innerHTML = `

            <div
                class="floating-post-card"
            >

                <div
                    class="floating-post-top"
                >

                    <span>
                        LIVE FROM DELTA
                    </span>

                    <i>✦</i>

                </div>


                <strong>
                    ${escapeHTML(
                        author.name ||
                        "Delta Founder"
                    )}
                </strong>


                <p>
                    ${escapeHTML(
                        post.content
                    ).slice(
                        0,
                        115
                    )}
                    ${
                        post.content.length > 115
                            ? "..."
                            : ""
                    }
                </p>


                <small>
                    ${escapeHTML(
                        author.role ||
                        "Founder"
                    )}
                </small>

            </div>
        `;
    }


    renderFloating();


    floatingPostTimer =
        setInterval(
            renderFloating,
            5000
        );
}


/* =========================================================
   USER ACTIVITY
========================================================= */

async function openUserActivity(
    userId
) {

    const modal =
        document.getElementById(
            "activityModal"
        );

    const container =
        document.getElementById(
            "activityModalContent"
        );


    if (!modal || !container) {
        return;
    }


    modal.style.display =
        "flex";


    container.innerHTML = `
        <div class="empty-state">
            Loading activity...
        </div>
    `;


    try {

        const data =
            await apiRequest(
                `/api/posts/user/${userId}`
            );


        const user =
            data.user || {};

        const posts =
            data.posts || [];


        container.innerHTML = `

            <div
                class="activity-heading"
            >

                <span
                    class="eyebrow"
                >
                    ${escapeHTML(
                        user.role || "MEMBER"
                    )}
                </span>

                <h2>
                    ${escapeHTML(
                        user.name ||
                        "Delta Member"
                    )}
                </h2>

                <p>
                    Delta activity
                </p>

            </div>


            <div
                class="posts-grid"
            >

                ${
                    posts.length
                        ? posts
                            .map(
                                renderPostCard
                            )
                            .join("")
                        : `
                            <div
                                class="empty-state"
                            >
                                No posts yet.
                            </div>
                        `
                }

            </div>
        `;


    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


function closeActivityModal() {

    const modal =
        document.getElementById(
            "activityModal"
        );

    if (modal) {
        modal.style.display =
            "none";
    }
}


/* =========================================================
   MESSAGING
========================================================= */


/*
    IMPORTANT:

    Messaging is allowed ONLY when the
    connection status is "accepted".

    The backend enforces this rule too.
*/


async function loadConversations() {

    const container =
        document.getElementById(
            "conversationList"
        );

    if (!container) return;


    container.innerHTML = `
        <div class="empty-state">
            Loading conversations...
        </div>
    `;


    try {

        const data =
            await apiRequest(
                "/api/messages/conversations"
            );


        const conversations =
            data.conversations || [];


        if (!conversations.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No conversations yet.
                    <br><br>
                    Accept a connection request
                    to start messaging.
                </div>
            `;

            return;
        }


        container.innerHTML =
            conversations.map(
                conversation => {

                    const participants =
                        conversation.participants ||
                        [];


                    const otherUser =
                        participants.find(
                            user =>
                                String(
                                    user._id
                                ) !==
                                String(
                                    currentUser.id
                                )
                        );


                    if (!otherUser) {
                        return "";
                    }


                    return `

                        <button
                            class="conversation-item"
                            onclick="openChat(
                                '${otherUser._id}',
                                '${escapeHTML(otherUser.name)}',
                                '${escapeHTML(otherUser.role)}'
                            )"
                        >

                            <div
                                class="conversation-avatar"
                            >
                                ${(otherUser.name || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        otherUser.name
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        otherUser