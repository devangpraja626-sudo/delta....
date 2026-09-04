/* =========================================================
   DELTA — FOUNDER NETWORK
   APP.JS
========================================================= */

const API_URL = "https://delta-5.onrender.com";


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentUser = null;
let currentProfile = null;
let currentStartup = null;
let selectedConversation = null;
let selectedPostType = "Idea";


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

function getToken() {
    return localStorage.getItem("deltaToken");
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("deltaUser"));
    } catch {
        return null;
    }
}

function escapeHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function initials(name = "Delta") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();
}

function showMessage(element, message, type = "") {
    if (!element) return;

    element.textContent = message;
    element.className = "form-message";

    if (type) {
        element.classList.add(type);
    }
}

function showElement(element) {
    if (element) element.classList.remove("hidden");
}

function hideElement(element) {
    if (element) element.classList.add("hidden");
}

async function apiRequest(endpoint, options = {}) {

    const token = getToken();

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

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            `Request failed (${response.status})`
        );
    }

    return data;
}


/* =========================================================
   AUTH MODAL
========================================================= */

const authModal = $("authModal");
const authChoice = $("authChoice");
const registerForm = $("registerForm");
const loginFormWrap = $("loginFormWrap");
const loginForm = $("loginForm");

const continueButton = $("continueButton");
const selectedRole = $("selectedRole");
const roleText = $("roleText");

const registerMessage = $("registerMessage");
const loginMessage = $("loginMessage");


let chosenRole = "Founder";


function openJoin() {
    showElement(authModal);

    showElement(authChoice);
    hideElement(registerForm);
    hideElement(loginFormWrap);

    if (registerMessage) {
        registerMessage.textContent = "";
    }

    if (loginMessage) {
        loginMessage.textContent = "";
    }
}


function closeJoin() {
    hideElement(authModal);
}


function chooseRole(role) {

    chosenRole = role;

    if (selectedRole) {
        selectedRole.value = role;
    }

    if (roleText) {
        roleText.textContent = role;
    }

    showRegisterForm();
}


function showRegisterForm() {

    hideElement(authChoice);
    showElement(registerForm);
    hideElement(loginFormWrap);

    if (selectedRole) {
        selectedRole.value = chosenRole;
    }
}


function showLoginForm() {

    hideElement(authChoice);
    hideElement(registerForm);
    showElement(loginFormWrap);
}


function showRegisterChoice() {

    showElement(authChoice);
    hideElement(registerForm);
    hideElement(loginFormWrap);
}


window.openJoin = openJoin;
window.closeJoin = closeJoin;
window.chooseRole = chooseRole;
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.showRegisterChoice = showRegisterChoice;


/* =========================================================
   REGISTER
========================================================= */

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = $("registerName")?.value.trim();
        const email = $("registerEmail")?.value.trim();
        const password = $("registerPassword")?.value;

        if (!name || !email || !password) {

            showMessage(
                registerMessage,
                "Please complete all fields.",
                "error"
            );

            return;
        }

        try {

            showMessage(
                registerMessage,
                "Creating your Delta account..."
            );

            const data = await apiRequest(
                "/api/auth/register",
                {
                    method: "POST",

                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role: chosenRole
                    })
                }
            );

            if (data.token) {

                localStorage.setItem(
                    "deltaToken",
                    data.token
                );
            }

            if (data.user) {

                localStorage.setItem(
                    "deltaUser",
                    JSON.stringify(data.user)
                );
            }

            currentUser = data.user;

            showMessage(
                registerMessage,
                "Account created successfully.",
                "success"
            );

            setTimeout(() => {

                closeJoin();

                openDashboard();

            }, 500);

        } catch (error) {

            showMessage(
                registerMessage,
                error.message,
                "error"
            );
        }

    });
}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = $("loginEmail")?.value.trim();
        const password = $("loginPassword")?.value;

        if (!email || !password) {

            showMessage(
                loginMessage,
                "Please enter your email and password.",
                "error"
            );

            return;
        }

        try {

            showMessage(
                loginMessage,
                "Signing you in..."
            );

            const data = await apiRequest(
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

            currentUser = data.user;

            showMessage(
                loginMessage,
                "Login successful.",
                "success"
            );

            setTimeout(() => {

                closeJoin();

                openDashboard();

            }, 400);

        } catch (error) {

            showMessage(
                loginMessage,
                error.message,
                "error"
            );
        }

    });
}


/* =========================================================
   DASHBOARD ELEMENTS
========================================================= */

const landingPage = $("landingPage");
const dashboardPage = $("dashboardPage");

const dashboardGreeting = $("dashboardGreeting");
const userBadge = $("userBadge");

const sectionDashboard = $("section-dashboard");
const sectionFounderHome = $("section-founder-home");
const sectionProfile = $("section-profile");
const sectionStartup = $("section-startup");
const sectionCreatePost = $("section-create-post");
const sectionPitch = $("section-pitch");
const sectionPitches = $("section-pitches");
const sectionDiscover = $("section-discover");
const sectionConnections = $("section-connections");
const sectionMessages = $("section-messages");
const sectionGroups = $("section-groups");

const allSections = document.querySelectorAll(".dash-section");


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

const navItems = document.querySelectorAll(
    ".dashboard-nav-item[data-section]"
);


function showDashboardSection(section) {

    allSections.forEach(item => {
        item.classList.add("hidden");
    });

    const target = document.getElementById(
        `section-${section}`
    );

    if (target) {
        target.classList.remove("hidden");
    }

    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === section
        );

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    /* Load data depending on section */

    if (section === "founder-home") {

        loadFounderHome();
    }

    if (section === "profile") {

        loadProfile();
    }

    if (section === "startup") {

        loadStartup();
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

    if (section === "messages") {

        loadConversations();
    }

    if (section === "groups") {

        loadGroups();
    }

}


window.showDashboardSection = showDashboardSection;


navItems.forEach(item => {

    item.addEventListener("click", () => {

        const section = item.dataset.section;

        if (section) {
            showDashboardSection(section);
        }

    });

});


/* =========================================================
   OPEN DASHBOARD
========================================================= */

async function openDashboard() {

    hideElement(landingPage);
    showElement(dashboardPage);

    currentUser =
        currentUser ||
        getStoredUser();

    updateUserUI();

    await loadProfile();

    if (currentUser?.role === "Founder") {

        showFounderNavigation();

        showDashboardSection("founder-home");

    } else {

        hideFounderNavigation();

        showDashboardSection("dashboard");

    }
}


/* =========================================================
   USER UI
========================================================= */

function updateUserUI() {

    if (!currentUser) return;

    const name =
        currentUser.name ||
        "Founder";

    if (dashboardGreeting) {

        dashboardGreeting.textContent =
            `Welcome back, ${name}.`;

    }

    if (userBadge) {

        userBadge.textContent =
            initials(name);

    }

    const sidebarName =
        $("sidebarUserName");

    const sidebarRole =
        $("sidebarUserRole");

    if (sidebarName) {
        sidebarName.textContent = name;
    }

    if (sidebarRole) {
        sidebarRole.textContent =
            currentUser.role || "Member";
    }

    const founderNameElements =
        document.querySelectorAll(
            "[data-founder-name]"
        );

    founderNameElements.forEach(element => {

        element.textContent = name;

    });

    const founderInitialElements =
        document.querySelectorAll(
            "[data-founder-initials]"
        );

    founderInitialElements.forEach(element => {

        element.textContent =
            initials(name);

    });

}


/* =========================================================
   FOUNDER NAVIGATION
========================================================= */

function showFounderNavigation() {

    document
        .querySelectorAll(".founder-only")
        .forEach(element => {

            element.classList.remove("hidden");

        });

}


function hideFounderNavigation() {

    document
        .querySelectorAll(".founder-only")
        .forEach(element => {

            element.classList.add("hidden");

        });

}


/* =========================================================
   PROFILE
========================================================= */

const profileForm = $("profileForm");


async function loadProfile() {

    try {

        const data =
            await apiRequest(
                "/api/profiles/me"
            );

        currentUser =
            data.user ||
            currentUser;

        currentProfile =
            data.profile ||
            null;

        updateUserUI();

        fillProfileForm();

        updateFounderIdentity();

    } catch (error) {

        console.error(
            "Profile loading failed:",
            error
        );
    }

}


function fillProfileForm() {

    if (!currentUser) return;

    if ($("profileName")) {

        $("profileName").value =
            currentUser.name || "";

    }

    if (!currentProfile) return;

    const fields = [
        "startupName",
        "idea",
        "industry",
        "location",
        "stage",
        "website",
        "bio",
        "profilePhoto"
    ];

    fields.forEach(field => {

        const element =
            $(field);

        if (
            element &&
            currentProfile[field] !== undefined
        ) {

            element.value =
                currentProfile[field] || "";

        }

    });

}


function updateFounderIdentity() {

    const name =
        currentUser?.name ||
        "Founder";

    const nameElements =
        document.querySelectorAll(
            "[data-founder-name]"
        );

    nameElements.forEach(element => {

        element.textContent = name;

    });

    const roleElements =
        document.querySelectorAll(
            "[data-founder-role]"
        );

    roleElements.forEach(element => {

        element.textContent =
            currentUser?.role || "Founder";

    });

    if (currentProfile) {

        const startupName =
            currentProfile.startupName ||
            "Your Startup";

        document
            .querySelectorAll(
                "[data-startup-name]"
            )
            .forEach(element => {

                element.textContent =
                    startupName;

            });

    }

}


if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const status =
                $("profileStatus");

            try {

                showMessage(
                    status,
                    "Saving profile..."
                );

                const payload = {
                    startupName:
                        $("startupName")?.value.trim() || "",

                    idea:
                        $("idea")?.value.trim() || "",

                    industry:
                        $("industry")?.value.trim() || "",

                    location:
                        $("location")?.value.trim() || "",

                    stage:
                        $("stage")?.value.trim() || "",

                    website:
                        $("website")?.value.trim() || "",

                    bio:
                        $("bio")?.value.trim() || "",

                    profilePhoto:
                        $("profilePhoto")?.value.trim() || ""
                };

                const data =
                    await apiRequest(
                        "/api/profiles/me",
                        {
                            method: "PUT",
                            body: JSON.stringify(payload)
                        }
                    );

                currentProfile =
                    data.profile;

                updateFounderIdentity();

                showMessage(
                    status,
                    "Profile updated successfully.",
                    "success"
                );

                await loadFounderHome();

            } catch (error) {

                showMessage(
                    status,
                    error.message,
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   FOUNDER HOME
========================================================= */

async function loadFounderHome() {

    updateFounderIdentity();

    await loadFounderFeed();

    await loadConnectionPreview();

    await loadGroupPreview();

}


/* =========================================================
   FOUNDER FEED
========================================================= */

const founderFeed =
    $("founderFeed");


async function loadFounderFeed() {

    if (!founderFeed) return;

    try {

        const data =
            await apiRequest(
                "/api/posts/feed"
            );

        const posts =
            data.posts ||
            data.data ||
            [];

        renderPosts(posts);

    } catch (error) {

        console.error(
            "Feed loading failed:",
            error
        );

        founderFeed.innerHTML = `
            <div class="empty-feed">
                <div class="empty-feed-symbol">Δ</div>
                <h3>Your founder feed starts here.</h3>
                <p>
                    Publish your first idea and start
                    conversations with other founders.
                </p>
            </div>
        `;
    }

}


function renderPosts(posts) {

    if (!founderFeed) return;

    if (!posts.length) {

        founderFeed.innerHTML = `
            <div class="empty-feed">
                <div class="empty-feed-symbol">✦</div>

                <h3>No ideas yet.</h3>

                <p>
                    Be the first founder to publish an
                    idea, update, achievement or opportunity.
                </p>

                <button
                    class="btn btn-outline btn-small"
                    onclick="showDashboardSection('create-post')"
                >
                    Publish an idea
                </button>
            </div>
        `;

        return;
    }

    founderFeed.innerHTML =
        posts.map(renderPost).join("");

}


function renderPost(post) {

    const author =
        post.author?.name ||
        post.user?.name ||
        "Founder";

    const avatar =
        post.author?.profilePhoto ||
        post.user?.profilePhoto ||
        "";

    const content =
        post.content ||
        "";

    const type =
        post.type ||
        "Idea";

    const media =
        post.mediaUrl ||
        post.image ||
        "";

    const postId =
        post._id ||
        post.id;

    const avatarHTML =
        avatar
            ? `<img src="${escapeHTML(avatar)}" alt="">`
            : initials(author);

    const mediaHTML =
        media
            ? `
                <div class="post-media">
                    <img
                        src="${escapeHTML(media)}"
                        alt="Post media"
                        loading="lazy"
                    >
                </div>
              `
            : "";

    return `
        <article
            class="post-card"
            data-post-id="${escapeHTML(postId || "")}"
        >

            <div class="post-author">

                <div class="avatar avatar-small">
                    ${avatarHTML}
                </div>

                <div class="post-author-info">

                    <strong>
                        ${escapeHTML(author)}
                    </strong>

                    <span>
                        Founder
                    </span>

                </div>

                <span class="post-type-badge">
                    ${escapeHTML(type)}
                </span>

            </div>

            <div class="post-content">
                ${escapeHTML(content)}
            </div>

            ${mediaHTML}

            <div class="post-actions">

                <button
                    class="post-action"
                    onclick="likePost('${escapeHTML(postId || "")}')"
                >
                    ♡ Like
                </button>

                <button
                    class="post-action"
                    onclick="focusPostComment('${escapeHTML(postId || "")}')"
                >
                    ◌ Comment
                </button>

                <button
                    class="post-action"
                    onclick="sharePost('${escapeHTML(postId || "")}')"
                >
                    ↗ Share
                </button>

                <span class="post-time">
                    ${formatDate(post.createdAt)}
                </span>

            </div>

        </article>
    `;
}


/* =========================================================
   CREATE POST
========================================================= */

const createPostForm =
    $("createPostForm");


document
    .querySelectorAll(".post-type")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectedPostType =
                    button.dataset.type ||
                    button.textContent.trim();

                document
                    .querySelectorAll(".post-type")
                    .forEach(item =>
                        item.classList.remove("active")
                    );

                button.classList.add("active");

                const hiddenType =
                    $("postType");

                if (hiddenType) {
                    hiddenType.value =
                        selectedPostType;
                }

            }
        );

    });


if (createPostForm) {

    createPostForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const status =
                $("postStatus");

            const content =
                $("postContent")?.value.trim();

            const mediaUrl =
                $("postMediaUrl")?.value.trim() ||
                "";

            if (!content) {

                showMessage(
                    status,
                    "Write something before publishing.",
                    "error"
                );

                return;
            }

            try {

                showMessage(
                    status,
                    "Publishing..."
                );

                await apiRequest(
                    "/api/posts",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            type: selectedPostType,
                            content,
                            mediaUrl
                        })
                    }
                );

                createPostForm.reset();

                selectedPostType = "Idea";

                document
                    .querySelectorAll(".post-type")
                    .forEach(button =>
                        button.classList.remove("active")
                    );

                document
                    .querySelector(
                        '.post-type[data-type="Idea"]'
                    )
                    ?.classList.add("active");

                showMessage(
                    status,
                    "Published successfully.",
                    "success"
                );

                await loadFounderFeed();

                setTimeout(() => {

                    showDashboardSection(
                        "founder-home"
                    );

                }, 500);

            } catch (error) {

                showMessage(
                    status,
                    error.message,
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   LIKE / SHARE PLACEHOLDERS
========================================================= */

async function likePost(postId) {

    if (!postId) return;

    try {

        await apiRequest(
            `/api/posts/${postId}/like`,
            {
                method: "POST"
            }
        );

        await loadFounderFeed();

    } catch (error) {

        console.error(
            "Like failed:",
            error
        );
    }

}


function focusPostComment(postId) {

    const commentBox =
        document.querySelector(
            `[data-post-id="${postId}"]`
        );

    if (commentBox) {

        commentBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


async function sharePost(postId) {

    const url =
        `${window.location.origin}${window.location.pathname}#post-${postId}`;

    try {

        if (navigator.share) {

            await navigator.share({
                title: "Delta Founder Post",
                url
            });

        } else {

            await navigator.clipboard.writeText(url);

            alert("Post link copied.");

        }

    } catch {
        /* User cancelled share */
    }

}


window.likePost = likePost;
window.focusPostComment = focusPostComment;
window.sharePost = sharePost;


/* =========================================================
   STARTUP
========================================================= */

const startupForm =
    $("startupForm");


async function loadStartup() {

    try {

        const data =
            await apiRequest(
                "/api/startups/me"
            );

        currentStartup =
            data.startup ||
            data.data ||
            null;

        fillStartupForm();

    } catch (error) {

        console.error(
            "Startup loading failed:",
            error
        );

    }

}


function fillStartupForm() {

    if (!currentStartup) return;

    const fields = [
        "name",
        "logo",
        "tagline",
        "description",
        "industry",
        "stage",
        "location",
        "website",
        "foundedYear"
    ];

    fields.forEach(field => {

        const element =
            $(`startup${capitalize(field)}`);

        if (element) {

            element.value =
                currentStartup[field] || "";

        }

    });

}


if (startupForm) {

    startupForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const status =
                $("startupStatus");

            const payload = {
                name:
                    $("startupNameField")?.value.trim() || "",

                logo:
                    $("startupLogo")?.value.trim() || "",

                tagline:
                    $("startupTagline")?.value.trim() || "",

                description:
                    $("startupDescription")?.value.trim() || "",

                industry:
                    $("startupIndustry")?.value.trim() || "",

                stage:
                    $("startupStage")?.value.trim() || "",

                location:
                    $("startupLocation")?.value.trim() || "",

                website:
                    $("startupWebsite")?.value.trim() || "",

                foundedYear:
                    $("startupFoundedYear")?.value || ""
            };

            try {

                showMessage(
                    status,
                    "Saving startup..."
                );

                const data =
                    await apiRequest(
                        "/api/startups/me",
                        {
                            method: "PUT",
                            body: JSON.stringify(payload)
                        }
                    );

                currentStartup =
                    data.startup ||
                    data.data;

                showMessage(
                    status,
                    "Startup profile saved.",
                    "success"
                );

            } catch (error) {

                showMessage(
                    status,
                    error.message,
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   PITCH
========================================================= */

const pitchForm =
    $("pitchForm");


if (pitchForm) {

    pitchForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const status =
                $("pitchStatusMessage");

            const payload = {
                title:
                    $("pitchTitle")?.value.trim() || "",

                industry:
                    $("pitchIndustry")?.value.trim() || "",

                stage:
                    $("pitchStage")?.value.trim() || "",

                fundingRequired:
                    Number(
                        $("fundingRequired")?.value || 0
                    ),

                website:
                    $("pitchWebsite")?.value.trim() || "",

                description:
                    $("pitchDescription")?.value.trim() || "",

                status:
                    $("pitchStatus")?.value ||
                    "Draft"
            };

            try {

                showMessage(
                    status,
                    "Creating pitch..."
                );

                await apiRequest(
                    "/api/pitches",
                    {
                        method: "POST",
                        body: JSON.stringify(payload)
                    }
                );

                pitchForm.reset();

                showMessage(
                    status,
                    "Pitch created successfully.",
                    "success"
                );

                await loadMyPitches();

            } catch (error) {

                showMessage(
                    status,
                    error.message,
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   MY PITCHES
========================================================= */

async function loadMyPitches() {

    const container =
        $("myPitches");

    if (!container) return;

    try {

        const data =
            await apiRequest(
                "/api/pitches/my"
            );

        const pitches =
            data.pitches ||
            data.data ||
            [];

        const count =
            $("pitchCount");

        if (count) {
            count.textContent =
                pitches.length;
        }

        if (!pitches.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <div>◫</div>
                    <h3>No pitches yet.</h3>
                    <p>
                        Create your first pitch to present
                        your startup to the Delta ecosystem.
                    </p>
                </div>
            `;

            return;
        }

        container.className = "pitches-grid";

        container.innerHTML =
            pitches.map(pitch => `

                <article class="pitch-card">

                    <h3>
                        ${escapeHTML(
                            pitch.title ||
                            "Untitled Pitch"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            pitch.description ||
                            "No description provided."
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

                        <span>
                            ${escapeHTML(
                                pitch.status ||
                                "Draft"
                            )}
                        </span>

                    </div>

                </article>

            `).join("");

    } catch (error) {

        console.error(
            "Pitch loading failed:",
            error
        );

    }

}


/* =========================================================
   DISCOVER FOUNDERS
========================================================= */

const discoverRole =
    $("discoverRole");


async function loadDiscover() {

    const container =
        $("discoverUsers");

    if (!container) return;

    const role =
        discoverRole?.value ||
        "Founder";

    try {

        const data =
            await apiRequest(
                `/api/connections/discover?role=${encodeURIComponent(role)}`
            );

        const users =
            data.users ||
            data.data ||
            [];

        renderDiscoverUsers(
            container,
            users
        );

    } catch (error) {

        console.error(
            "Discover loading failed:",
            error
        );

    }

}


if (discoverRole) {

    discoverRole.addEventListener(
        "change",
        loadDiscover
    );

}


function renderDiscoverUsers(
    container,
    users
) {

    if (!users.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>◎</div>
                <h3>No founders found.</h3>
                <p>
                    New founders joining Delta will
                    appear here.
                </p>
            </div>
        `;

        return;
    }

    container.className = "discover-grid";

    container.innerHTML =
        users.map(user => {

            const userId =
                user._id ||
                user.id;

            return `

                <article class="discover-card">

                    <div class="discover-card-top">

                        <div class="avatar">
                            ${initials(user.name)}
                        </div>

                        <span class="badge">
                            ${escapeHTML(
                                user.role || "Founder"
                            )}
                        </span>

                    </div>

                    <h3>
                        ${escapeHTML(
                            user.name ||
                            "Founder"
                        )}
                    </h3>

                    <div class="role">
                        ${escapeHTML(
                            user.email || ""
                        )}
                    </div>

                    <p class="discover-bio">
                        Building the next opportunity
                        inside the Delta ecosystem.
                    </p>

                    <button
                        class="btn btn-outline btn-small btn-full"
                        onclick="sendConnectionRequest('${escapeHTML(userId)}')"
                    >
                        + Connect
                    </button>

                </article>

            `;

        }).join("");

}


/* =========================================================
   CONNECTIONS
========================================================= */

async function sendConnectionRequest(userId) {

    if (!userId) return;

    try {

        await apiRequest(
            `/api/connections/request/${userId}`,
            {
                method: "POST"
            }
        );

        alert(
            "Connection request sent."
        );

        await loadDiscover();

        await loadConnections();

    } catch (error) {

        alert(
            error.message
        );

    }

}


window.sendConnectionRequest =
    sendConnectionRequest;


async function loadConnections() {

    const container =
        $("connectionsList");

    if (!container) return;

    try {

        const data =
            await apiRequest(
                "/api/connections"
            );

        const connections =
            data.connections ||
            data.data ||
            [];

        renderConnections(
            container,
            connections
        );

        updateConnectionCount(
            connections
        );

    } catch (error) {

        console.error(
            "Connections loading failed:",
            error
        );

    }

}


function updateConnectionCount(
    connections
) {

    const accepted =
        connections.filter(
            item =>
                item.status === "accepted"
        );

    const count =
        $("connectionCount");

    if (count) {

        count.textContent =
            accepted.length;

    }

}


function getOtherConnectionUser(
    connection
) {

    const currentId =
        currentUser?._id ||
        currentUser?.id;

    const sender =
        connection.sender;

    const receiver =
        connection.receiver;

    const senderId =
        sender?._id ||
        sender;

    if (String(senderId) === String(currentId)) {
        return receiver;
    }

    return sender;
}


function renderConnections(
    container,
    connections
) {

    if (!connections.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>∞</div>
                <h3>Your network is waiting.</h3>
                <p>
                    Discover founders and start building
                    meaningful connections.
                </p>
            </div>
        `;

        return;
    }

    container.className =
        "connections-grid";

    container.innerHTML =
        connections.map(connection => {

            const user =
                getOtherConnectionUser(
                    connection
                );

            const userId =
                user?._id ||
                user?.id;

            const status =
                connection.status;

            let actionHTML = "";

            if (status === "accepted") {

                actionHTML = `
                    <button
                        class="btn btn-primary btn-small"
                        onclick="startConversation('${escapeHTML(userId)}')"
                    >
                        Message
                    </button>
                `;

            } else if (
                status === "pending" &&
                String(
                    connection.receiver?._id ||
                    connection.receiver
                ) === String(
                    currentUser?._id ||
                    currentUser?.id
                )
            ) {

                actionHTML = `
                    <button
                        class="btn btn-primary btn-small"
                        onclick="acceptConnection('${escapeHTML(connection._id)}')"
                    >
                        Accept
                    </button>

                    <button
                        class="btn btn-outline btn-small"
                        onclick="rejectConnection('${escapeHTML(connection._id)}')"
                    >
                        Reject
                    </button>
                `;

            } else {

                actionHTML = `
                    <span class="badge">
                        Pending
                    </span>
                `;

            }

            return `

                <article class="connection-card">

                    <div class="avatar">
                        ${initials(
                            user?.name ||
                            "Founder"
                        )}
                    </div>

                    <div class="connection-card-info">

                        <strong>
                            ${escapeHTML(
                                user?.name ||
                                "Founder"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                user?.role ||
                                "Founder"
                            )}
                        </span>

                    </div>

                    <div class="connection-actions">
                        ${actionHTML}
                    </div>

                </article>

            `;

        }).join("");

}


/* =========================================================
   ACCEPT / REJECT CONNECTION
========================================================= */

async function acceptConnection(
    connectionId
) {

    try {

        await apiRequest(
            `/api/connections/${connectionId}/accept`,
            {
                method: "PUT"
            }
        );

        await loadConnections();

    } catch (error) {

        alert(error.message);

    }

}


async function rejectConnection(
    connectionId
) {

    try {

        await apiRequest(
            `/api/connections/${connectionId}/reject`,
            {
                method: "PUT"
            }
        );

        await loadConnections();

    } catch (error) {

        alert(error.message);

    }

}


window.acceptConnection =
    acceptConnection;

window.rejectConnection =
    rejectConnection;


/* =========================================================
   CONNECTION PREVIEW
========================================================= */

async function loadConnectionPreview() {

    const container =
        $("connectionPreview");

    if (!container) return;

    try {

        const data =
            await apiRequest(
                "/api/connections"
            );

        const connections =
            data.connections ||
            [];

        const pending =
            connections.filter(
                item =>
                    item.status === "pending"
            );

        if (!pending.length) {

            container.innerHTML = `
                <div class="empty-mini">
                    No new connection requests.
                </div>
            `;

            return;
        }

        container.innerHTML =
            pending
                .slice(0, 4)
                .map(connection => {

                    const user =
                        getOtherConnectionUser(
                            connection
                        );

                    return `
                        <div class="request-mini">

                            <div class="avatar avatar-small">
                                ${initials(
                                    user?.name ||
                                    "F"
                                )}
                            </div>

                            <div class="request-mini-info">

                                <strong>
                                    ${escapeHTML(
                                        user?.name ||
                                        "Founder"
                                    )}
                                </strong>

                                <span>
                                    wants to connect
                                </span>

                            </div>

                        </div>
                    `;

                })
                .join("");

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   MESSAGES
========================================================= */

async function loadConversations() {

    const container =
        $("conversationItems");

    if (!container) return;

    try {

        const data =
            await apiRequest(
                "/api/messages/conversations"
            );

        const conversations =
            data.conversations ||
            data.data ||
            [];

        renderConversations(
            container,
            conversations
        );

    } catch (error) {

        console.error(
            "Conversation loading failed:",
            error
        );

        container.innerHTML = `
            <div class="empty-mini">
                Connect with a founder to start messaging.
            </div>
        `;

    }

}


function renderConversations(
    container,
    conversations
) {

    if (!conversations.length) {

        container.innerHTML = `
            <div class="empty-mini">
                No conversations yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        conversations.map(conversation => {

            const other =
                conversation.otherUser ||
                conversation.user ||
                conversation.participant;

            const conversationId =
                conversation._id ||
                conversation.id;

            return `
                <div
                    class="conversation-item"
                    onclick="openConversation('${escapeHTML(conversationId)}')"
                >

                    <div class="avatar avatar-small">
                        ${initials(
                            other?.name ||
                            "Founder"
                        )}
                    </div>

                    <div class="conversation-info">

                        <strong>
                            ${escapeHTML(
                                other?.name ||
                                "Founder"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                conversation.lastMessage?.content ||
                                conversation.lastMessage ||
                                "Start a conversation"
                            )}
                        </span>

                    </div>

                </div>
            `;

        }).join("");

}


async function startConversation(
    userId
) {

    if (!userId) return;

    try {

        const data =
            await apiRequest(
                "/api/messages/conversations",
                {
                    method: "POST",

                    body: JSON.stringify({
                        userId
                    })
                }
            );

        const conversation =
            data.conversation ||
            data.data;

        showDashboardSection(
            "messages"
        );

        if (conversation?._id) {

            await openConversation(
                conversation._id
            );

        }

    } catch (error) {

        alert(error.message);

    }

}


window.startConversation =
    startConversation;


async function openConversation(
    conversationId
) {

    if (!conversationId) return;

    selectedConversation =
        conversationId;

    const chatPanel =
        $("activeChat");

    const emptyState =
        $("chatEmptyState");

    if (emptyState) {
        emptyState.classList.add("hidden");
    }

    if (chatPanel) {
        chatPanel.classList.remove("hidden");
    }

    await loadMessages(
        conversationId
    );

}


window.openConversation =
    openConversation;


async function loadMessages(
    conversationId
) {

    const container =
        $("messageList");

    if (!container) return;

    try {

        const data =
            await apiRequest(
                `/api/messages/conversations/${conversationId}`
            );

        const messages =
            data.messages ||
            data.data ||
            [];

        renderMessages(
            container,
            messages
        );

    } catch (error) {

        console.error(
            "Messages loading failed:",
            error
        );

    }

}


function renderMessages(
    container,
    messages
) {

    if (!messages.length) {

        container.innerHTML = `
            <div class="empty-mini">
                Start the conversation.
            </div>
        `;

        return;
    }

    const currentId =
        currentUser?._id ||
        currentUser?.id;

    container.innerHTML =
        messages.map(message => {

            const senderId =
                message.sender?._id ||
                message.sender;

            const mine =
                String(senderId) ===
                String(currentId);

            return `
                <div
                    class="message-bubble ${
                        mine ? "mine" : ""
                    }"
                >

                    ${escapeHTML(
                        message.content ||
                        message.text ||
                        ""
                    )}

                    <span class="message-time">
                        ${formatDate(
                            message.createdAt
                        )}
                    </span>

                </div>
            `;

        }).join("");

    container.scrollTop =
        container.scrollHeight;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

const messageForm =
    $("messageForm");


if (messageForm) {

    messageForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!selectedConversation) {

                return;

            }

            const input =
                $("messageInput");

            const content =
                input?.value.trim();

            if (!content) return;

            try {

                await apiRequest(
                    `/api/messages/conversations/${selectedConversation}`,
                    {
                        method: "POST",

                        body: JSON.stringify({
                            content
                        })
                    }
                );

                input.value = "";

                await loadMessages(
                    selectedConversation
                );

            } catch (error) {

                alert(error.message);

            }

        }
    );

}


/* =========================================================
   GROUPS
========================================================= */

async function loadGroups() {

    const container =
        $("groupsGrid");

    if (!container) return;

    try {

        const data =
            await apiRequest(
                "/api/groups"
            );

        const groups =
            data.groups ||
            data.data ||
            [];

        renderGroups(
            container,
            groups
        );

    } catch (error) {

        console.error(
            "Groups loading failed:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                <div>◈</div>
                <h3>Founder groups are coming.</h3>
                <p>
                    Create focused communities around
                    startups, industries and ideas.
                </p>
            </div>
        `;

    }

}


function renderGroups(
    container,
    groups
) {

    if (!groups.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>◈</div>
                <h3>No groups yet.</h3>
                <p>
                    Be one of the first founders to
                    create a Delta community.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        groups.map(group => {

            const groupId =
                group._id ||
                group.id;

            return `
                <article class="group-card">

                    <div class="group-card-icon">
                        ◈
                    </div>

                    <span class="group-category">
                        ${escapeHTML(
                            group.category ||
                            "FOUNDER COMMUNITY"
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            group.name ||
                            "Delta Group"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            group.description ||
                            "A community for founders."
                        )}
                    </p>

                    <div class="group-meta">

                        <span>
                            ${group.memberCount || 0}
                            members
                        </span>

                    </div>

                    <button
                        class="btn btn-outline btn-small btn-full"
                        onclick="joinGroup('${escapeHTML(groupId)}')"
                    >
                        Join Group
                    </button>

                </article>
            `;

        }).join("");

}


async function loadGroupPreview() {

    const container =
        $("groupPreview");

    if (!container) return;

    try {

        const data =
            await apiRequest(
                "/api/groups"
            );

        const groups =
            data.groups ||
            [];

        if (!groups.length) {

            container.innerHTML = `
                <div class="empty-mini">
                    No founder groups yet.
                </div>
            `;

            return;
        }

        container.innerHTML =
            groups.slice(0, 3)
                .map(group => `
                    <div class="request-mini">

                        <div class="group-symbol">
                            ◈
                        </div>

                        <div class="request-mini-info">

                            <strong>
                                ${escapeHTML(
                                    group.name
                                )}
                            </strong>

                            <span>
                                ${group.memberCount || 0}
                                members
                            </span>

                        </div>

                    </div>
                `)
                .join("");

    } catch (error) {

        console.error(error);

    }

}


async function joinGroup(groupId) {

    try {

        await apiRequest(
            `/api/groups/${groupId}/join`,
            {
                method: "POST"
            }
        );

        alert(
            "You joined the group."
        );

        await loadGroups();

    } catch (error) {

        alert(error.message);

    }

}


window.joinGroup =
    joinGroup;


/* =========================================================
   CREATE GROUP
========================================================= */

const createGroupForm =
    $("createGroupForm");


if (createGroupForm) {

    createGroupForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const status =
                $("groupStatus");

            const payload = {
                name:
                    $("groupName")?.value.trim() || "",

                category:
                    $("groupCategory")?.value.trim() || "",

                description:
                    $("groupDescription")?.value.trim() || ""
            };

            try {

                showMessage(
                    status,
                    "Creating group..."
                );

                await apiRequest(
                    "/api/groups",
                    {
                        method: "POST",
                        body: JSON.stringify(payload)
                    }
                );

                createGroupForm.reset();

                showMessage(
                    status,
                    "Group created successfully.",
                    "success"
                );

                await loadGroups();

            } catch (error) {

                showMessage(
                    status,
                    error.message,
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    $("logoutButton");


function logout() {

    localStorage.removeItem(
        "deltaToken"
    );

    localStorage.removeItem(
        "deltaUser"
    );

    currentUser = null;
    currentProfile = null;
    currentStartup = null;
    selectedConversation = null;

    hideElement(dashboardPage);

    showElement(landingPage);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date) {

    if (!date) return "";

    const value =
        new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    const now =
        new Date();

    const seconds =
        Math.floor(
            (now - value) / 1000
        );

    if (seconds < 60) {
        return "just now";
    }

    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m`;
    }

    if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)}h`;
    }

    if (seconds < 604800) {
        return `${Math.floor(seconds / 86400)}d`;
    }

    return value.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );

}


function capitalize(
    value
) {

    return value.charAt(0).toUpperCase()
        + value.slice(1);

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

document
    .querySelectorAll("[data-open-section]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.openSection;

                if (section) {

                    showDashboardSection(
                        section
                    );

                }

            }
        );

    });


/* =========================================================
   SESSION RESTORE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const token =
            getToken();

        const storedUser =
            getStoredUser();

        if (
            token &&
            storedUser
        ) {

            currentUser =
                storedUser;

            try {

                await openDashboard();

            } catch (error) {

                console.error(
                    "Session restore failed:",
                    error
                );

            }

        }

    }
);


/* =========================================================
   CLOSE MODAL WITH ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            authModal &&
            !authModal.classList.contains("hidden")
        ) {

            closeJoin();

        }

    }
);