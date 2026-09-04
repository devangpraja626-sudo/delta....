/* =========================================================
   DELTA V1.1 FRONTEND
   Social + Profiles + Pitches + Connections + Messaging
========================================================= */

const API_URL = "https://delta-7.onrender.com";

let selectedRole = "";
let currentUser = null;
let currentProfile = null;
let floatingTimer = null;

let activeChatUserId = null;
let activeChatUser = null;
let messageRefreshTimer = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function getToken() {
    return localStorage.getItem("deltaToken");
}

function getStoredUser() {
    try {
        return JSON.parse(
            localStorage.getItem("deltaUser") || "null"
        );
    } catch {
        return null;
    }
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

function getInitials(name) {
    if (!name) {
        return "Δ";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

function formatTime(dateValue) {
    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString(
        undefined,
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}

function safeImageURL(url) {
    if (!url) {
        return "";
    }

    try {
        const parsed = new URL(url);

        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        ) {
            return parsed.href;
        }

        return "";
    } catch {
        return "";
    }
}

function setMessage(elementId, message, type = "") {
    const element = $(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;

    element.className =
        `form-message ${type}`.trim();
}

function clearMessage(elementId) {
    const element = $(elementId);

    if (!element) {
        return;
    }

    element.textContent = "";
    element.className = "form-message";
}

function isLoggedIn() {
    return Boolean(
        getToken() &&
        currentUser
    );
}


/* =========================================================
   API
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {
    const headers = {
        ...(options.headers || {})
    };

    if (
        options.body &&
        typeof options.body !== "string"
    ) {
        headers["Content-Type"] =
            "application/json";

        options.body =
            JSON.stringify(options.body);
    }

    const token = getToken();

    if (token) {
        headers.Authorization =
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
            "Unable to connect to Delta server. Please check your internet connection."
        );
    }

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        if (response.status === 401) {
            handleUnauthorized();
        }

        throw new Error(
            data.message ||
            `Request failed (${response.status})`
        );
    }

    return data;
}

function handleUnauthorized() {
    localStorage.removeItem("deltaToken");
    localStorage.removeItem("deltaUser");

    currentUser = null;
    currentProfile = null;

    stopMessageRefresh();

    if ($("dashboardPage")) {
        $("dashboardPage").classList.add("hidden");
    }

    if ($("landingPage")) {
        $("landingPage").classList.remove("hidden");
    }

    document.body.classList.remove(
        "dashboard-active"
    );
}


/* =========================================================
   LANDING
========================================================= */

function goHome() {
    if (
        currentUser &&
        $("dashboardPage") &&
        !$("dashboardPage")
            .classList
            .contains("hidden")
    ) {
        showLanding();
        return;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showLanding() {
    if ($("dashboardPage")) {
        $("dashboardPage")
            .classList
            .add("hidden");
    }

    if ($("landingPage")) {
        $("landingPage")
            .classList
            .remove("hidden");
    }

    document.body.classList.remove(
        "dashboard-active"
    );

    stopMessageRefresh();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   AUTH MODAL
========================================================= */

function openJoin(role = "") {
    if (!$("authModal")) {
        return;
    }

    $("authModal")
        .classList
        .add("open");

    document.body.classList.add(
        "modal-open"
    );

    selectedRole = role || "";

    showRegisterChoice();

    if (role) {
        chooseRole(role);
    }
}

function closeJoin() {
    if (!$("authModal")) {
        return;
    }

    $("authModal")
        .classList
        .remove("open");

    document.body.classList.remove(
        "modal-open"
    );
}

function chooseRole(role) {
    selectedRole = role;

    if ($("selectedRole")) {
        $("selectedRole").textContent =
            `${role} selected`;
    }

    if ($("roleText")) {
        $("roleText").textContent =
            `Create your ${role} account.`;
    }

    document
        .querySelectorAll(".role-card")
        .forEach(card => {
            card.classList.remove(
                "selected"
            );

            if (
                card.textContent
                    .toLowerCase()
                    .includes(
                        role.toLowerCase()
                    )
            ) {
                card.classList.add(
                    "selected"
                );
            }
        });
}

function showRegisterChoice() {
    $("authChoice")?.classList.remove(
        "hidden"
    );

    $("registerForm")?.classList.add(
        "hidden"
    );

    $("loginFormWrap")?.classList.add(
        "hidden"
    );
}

function showRegisterForm() {
    if (!selectedRole) {
        if ($("selectedRole")) {
            $("selectedRole").textContent =
                "Please select a role first.";
        }

        return;
    }

    $("authChoice")?.classList.add(
        "hidden"
    );

    $("registerForm")?.classList.remove(
        "hidden"
    );

    $("loginFormWrap")?.classList.add(
        "hidden"
    );

    if ($("roleText")) {
        $("roleText").textContent =
            `Create your ${selectedRole} account.`;
    }
}

function showLoginForm() {
    $("authChoice")?.classList.add(
        "hidden"
    );

    $("registerForm")?.classList.add(
        "hidden"
    );

    $("loginFormWrap")?.classList.remove(
        "hidden"
    );
}

function resetAuthForms() {
    $("registerForm")?.reset();
    $("loginForm")?.reset();

    clearMessage("registerMessage");
    clearMessage("loginMessage");

    selectedRole = "";

    if ($("selectedRole")) {
        $("selectedRole").textContent = "";
    }

    document
        .querySelectorAll(".role-card")
        .forEach(card =>
            card.classList.remove(
                "selected"
            )
        );
}


/* =========================================================
   REGISTER
========================================================= */

$("registerForm")?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage("registerMessage");

        if (!selectedRole) {
            setMessage(
                "registerMessage",
                "Please select your role first.",
                "error"
            );
            return;
        }

        const button =
            $("registerForm")
                .querySelector(
                    "button[type='submit']"
                );

        if (!button) {
            return;
        }

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent =
            "Creating...";

        try {
            const data =
                await apiRequest(
                    "/api/auth/register",
                    {
                        method: "POST",
                        body: {
                            name:
                                $("name")
                                    .value
                                    .trim(),

                            email:
                                $("email")
                                    .value
                                    .trim(),

                            password:
                                $("password")
                                    .value,

                            role:
                                selectedRole
                        }
                    }
                );

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

            closeJoin();

            await enterDashboard();

        } catch (error) {
            setMessage(
                "registerMessage",
                error.message,
                "error"
            );
        } finally {
            button.disabled = false;
            button.textContent =
                originalText;
        }
    }
);


/* =========================================================
   LOGIN
========================================================= */

$("loginForm")?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage("loginMessage");

        const button =
            $("loginForm")
                .querySelector(
                    "button[type='submit']"
                );

        if (!button) {
            return;
        }

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent =
            "Logging in...";

        try {
            const data =
                await apiRequest(
                    "/api/auth/login",
                    {
                        method: "POST",
                        body: {
                            email:
                                $("loginEmail")
                                    .value
                                    .trim(),

                            password:
                                $("loginPassword")
                                    .value
                        }
                    }
                );

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

            closeJoin();

            await enterDashboard();

        } catch (error) {
            setMessage(
                "loginMessage",
                error.message,
                "error"
            );
        } finally {
            button.disabled = false;
            button.textContent =
                originalText;
        }
    }
);


/* =========================================================
   DASHBOARD
========================================================= */

async function enterDashboard() {
    $("landingPage")
        ?.classList
        .add("hidden");

    $("dashboardPage")
        ?.classList
        .remove("hidden");

    document.body.classList.add(
        "dashboard-active"
    );

    updateUserUI();

    showDashboardSection(
        "dashboard",
        false
    );

    await Promise.allSettled([
        loadProfile(),
        loadMyPitches(),
        loadMyPosts(),
        loadConnections()
    ]);

    await loadCommunityFeed();
}

function updateUserUI() {
    if (!currentUser) {
        return;
    }

    const name =
        currentUser.name ||
        "Delta Member";

    const role =
        currentUser.role ||
        "Member";

    if ($("dashboardGreeting")) {
        $("dashboardGreeting")
            .textContent = name;
    }

    if ($("userBadge")) {
        $("userBadge")
            .textContent = role;
    }

    if ($("composerName")) {
        $("composerName")
            .textContent = name;
    }

    if ($("composerRole")) {
        $("composerRole")
            .textContent = role;
    }

    if ($("dashboardName")) {
        $("dashboardName")
            .textContent = name;
    }

    if ($("dashboardRole")) {
        $("dashboardRole")
            .textContent = role;
    }
}

function showDashboardSection(
    section,
    updateURL = true
) {
    document
        .querySelectorAll(".dash-section")
        .forEach(element =>
            element.classList.add(
                "hidden"
            )
        );

    const target =
        $(`section-${section}`);

    if (target) {
        target.classList.remove(
            "hidden"
        );
    }

    document
        .querySelectorAll(".side-link")
        .forEach(link =>
            link.classList.remove(
                "active"
            )
        );

    const matchingLink =
        Array.from(
            document.querySelectorAll(
                ".side-link"
            )
        ).find(link =>
            link
                .getAttribute("onclick")
                ?.includes(
                    `'${section}'`
                )
        );

    if (matchingLink) {
        matchingLink.classList.add(
            "active"
        );
    }

    if (updateURL) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    if (section === "posts") {
        loadMyPosts();
    }

    if (section === "discover") {
        loadDiscoverUsers();
    }

    if (section === "connections") {
        loadConnections();
    }

    if (section === "pitches") {
        loadMyPitches();
    }

    if (section === "profile") {
        loadProfile();
    }

    if (section === "messages") {
        loadConversations();
    }
}


/* =========================================================
   PROFILE
========================================================= */

function hideAllRoleFields() {
    document
        .querySelectorAll(".role-field")
        .forEach(field =>
            field.classList.add(
                "hidden"
            )
        );
}

function showRoleField(id) {
    const element = $(id);

    if (element) {
        element.classList.remove(
            "hidden"
        );
    }
}

function setupProfileRole(role) {
    hideAllRoleFields();

    if (role === "Founder") {
        showRoleField(
            "founderStartupGroup"
        );

        showRoleField(
            "founderIdeaGroup"
        );

        showRoleField(
            "industryGroup"
        );

        showRoleField(
            "stageGroup"
        );

        if ($("profileRoleHint")) {
            $("profileRoleHint")
                .textContent =
                "Founder profile — showcase what you're building.";
        }
    }

    if (role === "Investor") {
        showRoleField(
            "investorFirmGroup"
        );

        showRoleField(
            "investorFocusGroup"
        );

        showRoleField(
            "investorIndustriesGroup"
        );

        showRoleField(
            "investorTicketGroup"
        );

        if ($("profileRoleHint")) {
            $("profileRoleHint")
                .textContent =
                "Investor profile — tell founders what you invest in.";
        }
    }

    if (role === "Consultant") {
        showRoleField(
            "consultantExpertiseGroup"
        );

        showRoleField(
            "consultantExperienceGroup"
        );

        showRoleField(
            "consultantRateGroup"
        );

        if ($("profileRoleHint")) {
            $("profileRoleHint")
                .textContent =
                "Consultant profile — showcase your expertise.";
        }
    }
}

async function loadProfile() {
    if (!getToken()) {
        return;
    }

    try {
        const data =
            await apiRequest(
                "/api/profiles/me"
            );

        currentUser =
            data.user;

        currentProfile =
            data.profile;

        localStorage.setItem(
            "deltaUser",
            JSON.stringify(
                currentUser
            )
        );

        updateUserUI();

        setupProfileRole(
            currentUser.role
        );

        if ($("profileName")) {
            $("profileName").value =
                currentUser.name || "";
        }

        if ($("location")) {
            $("location").value =
                currentProfile?.location ||
                "";
        }

        if ($("website")) {
            $("website").value =
                currentProfile?.website ||
                "";
        }

        if ($("bio")) {
            $("bio").value =
                currentProfile?.bio ||
                "";
        }

        if ($("startupName")) {
            $("startupName").value =
                currentProfile?.startupName ||
                "";
        }

        if ($("idea")) {
            $("idea").value =
                currentProfile?.idea ||
                "";
        }

        if ($("industry")) {
            $("industry").value =
                currentProfile?.industry ||
                "";
        }

        if ($("stage")) {
            $("stage").value =
                currentProfile?.stage ||
                "";
        }

        if ($("firmName")) {
            $("firmName").value =
                currentProfile?.firmName ||
                "";
        }

        if ($("investmentFocus")) {
            $("investmentFocus").value =
                currentProfile?.investmentFocus ||
                "";
        }

        if ($("industries")) {
            $("industries").value =
                Array.isArray(
                    currentProfile?.industries
                )
                    ? currentProfile
                        .industries
                        .join(", ")
                    : "";
        }

        if ($("ticketSize")) {
            $("ticketSize").value =
                currentProfile?.ticketSize ||
                "";
        }

        if ($("expertise")) {
            $("expertise").value =
                Array.isArray(
                    currentProfile?.expertise
                )
                    ? currentProfile
                        .expertise
                        .join(", ")
                    : "";
        }

        if ($("experience")) {
            $("experience").value =
                currentProfile?.experience ||
                "";
        }

        if ($("hourlyRate")) {
            $("hourlyRate").value =
                currentProfile?.hourlyRate ||
                "";
        }

        updateProfileStatus();

    } catch (error) {
        console.error(
            "Profile load error:",
            error
        );
    }
}

function updateProfileStatus() {
    if (!currentUser) {
        return;
    }

    const profile =
        currentProfile || {};

    const role =
        currentUser.role;

    let complete = false;

    if (role === "Founder") {
        complete =
            Boolean(
                profile.startupName &&
                profile.industry &&
                profile.bio
            );
    }

    if (role === "Investor") {
        complete =
            Boolean(
                profile.firmName &&
                profile.investmentFocus &&
                profile.bio
            );
    }

    if (role === "Consultant") {
        complete =
            Boolean(
                profile.expertise?.length &&
                profile.experience &&
                profile.bio
            );
    }

    if ($("profileStatus")) {
        $("profileStatus")
            .textContent =
            complete
                ? "Complete"
                : "Incomplete";
    }
}

$("profileForm")?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage(
            "profileMessage"
        );

        if (!currentUser) {
            return;
        }

        const role =
            currentUser.role;

        const payload = {
            location:
                $("location")?.value
                    .trim() || "",

            website:
                $("website")?.value
                    .trim() || "",

            bio:
                $("bio")?.value
                    .trim() || ""
        };

        if (role === "Founder") {
            payload.startupName =
                $("startupName")
                    ?.value
                    .trim() || "";

            payload.idea =
                $("idea")
                    ?.value
                    .trim() || "";

            payload.industry =
                $("industry")
                    ?.value
                    .trim() || "";

            payload.stage =
                $("stage")?.value || "";
        }

        if (role === "Investor") {
            payload.firmName =
                $("firmName")
                    ?.value
                    .trim() || "";

            payload.investmentFocus =
                $("investmentFocus")
                    ?.value
                    .trim() || "";

            payload.industries =
                $("industries")
                    ?.value
                    .split(",")
                    .map(item =>
                        item.trim()
                    )
                    .filter(Boolean) ||
                [];

            payload.ticketSize =
                $("ticketSize")
                    ?.value
                    .trim() || "";
        }

        if (role === "Consultant") {
            payload.expertise =
                $("expertise")
                    ?.value
                    .split(",")
                    .map(item =>
                        item.trim()
                    )
                    .filter(Boolean) ||
                [];

            payload.experience =
                $("experience")
                    ?.value
                    .trim() || "";

            payload.hourlyRate =
                $("hourlyRate")
                    ?.value
                    .trim() || "";
        }

        try {
            const data =
                await apiRequest(
                    "/api/profiles/me",
                    {
                        method: "PUT",
                        body: payload
                    }
                );

            currentProfile =
                data.profile;

            const newName =
                $("profileName")
                    ?.value
                    .trim();

            if (
                newName &&
                newName !==
                    currentUser.name
            ) {
                currentUser.name =
                    newName;

                localStorage.setItem(
                    "deltaUser",
                    JSON.stringify(
                        currentUser
                    )
                );

                updateUserUI();
            }

            updateProfileStatus();

            setMessage(
                "profileMessage",
                "Profile saved successfully.",
                "success"
            );

        } catch (error) {
            setMessage(
                "profileMessage",
                error.message,
                "error"
            );
        }
    }
);


/* =========================================================
   POSTS
========================================================= */

$("postContent")?.addEventListener(
    "input",
    () => {
        if ($("postCharacterCount")) {
            $("postCharacterCount")
                .textContent =
                $("postContent")
                    .value
                    .length;
        }
    }
);

$("postForm")?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage(
            "postMessage"
        );

        const content =
            $("postContent")
                ?.value
                .trim() || "";

        const imageUrl =
            $("postImageUrl")
                ?.value
                .trim() || "";

        if (!content) {
            setMessage(
                "postMessage",
                "Write something before publishing.",
                "error"
            );
            return;
        }

        if (
            imageUrl &&
            !safeImageURL(imageUrl)
        ) {
            setMessage(
                "postMessage",
                "Please enter a valid http/https image URL.",
                "error"
            );
            return;
        }

        const button =
            $("postForm")
                .querySelector(
                    "button[type='submit']"
                );

        if (!button) {
            return;
        }

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent =
            "Publishing...";

        try {
            await apiRequest(
                "/api/posts",
                {
                    method: "POST",
                    body: {
                        content,
                        imageUrl
                    }
                }
            );

            $("postForm").reset();

            if ($("postCharacterCount")) {
                $("postCharacterCount")
                    .textContent = "0";
            }

            setMessage(
                "postMessage",
                "Post published successfully.",
                "success"
            );

            await loadMyPosts();
            await loadCommunityFeed();

            setTimeout(() => {
                clearMessage(
                    "postMessage"
                );
            }, 3000);

        } catch (error) {
            setMessage(
                "postMessage",
                error.message,
                "error"
            );
        } finally {
            button.disabled = false;
            button.textContent =
                originalText;
        }
    }
);

async function loadMyPosts() {
    if (!getToken()) {
        return;
    }

    try {
        const data =
            await apiRequest(
                "/api/posts/my"
            );

        const posts =
            data.posts || [];

        if ($("postCount")) {
            $("postCount")
                .textContent =
                posts.length;
        }

        renderPosts(
            $("myPosts"),
            posts,
            {
                ownPosts: true
            }
        );

    } catch (error) {
        console.error(
            "My posts error:",
            error
        );
    }
}

async function loadCommunityFeed() {
    try {
        const data =
            await apiRequest(
                "/api/posts/feed"
            );

        const posts =
            data.posts || [];

        renderPosts(
            $("homeFeed"),
            posts.slice(0, 6),
            {
                homeFeed: true
            }
        );

        renderFloatingPosts(
            posts.slice(0, 8)
        );

    } catch (error) {
        console.error(
            "Community feed error:",
            error
        );

        if ($("homeFeed")) {
            $("homeFeed").innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">Δ</div>
                    <h3>Community is growing</h3>
                    <p>
                        Posts will appear here as Delta members
                        start sharing.
                    </p>
                </div>
            `;
        }
    }
}

function renderPosts(
    container,
    posts,
    options = {}
) {
    if (!container) {
        return;
    }

    if (!posts.length) {
        if (options.homeFeed) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">Δ</div>
                    <h3>Be one of the first</h3>
                    <p>
                        Delta community activity will appear here.
                    </p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">Δ</div>
                    <h3>No posts yet</h3>
                    <p>
                        Share your first update with the Delta ecosystem.
                    </p>
                    <button
                        class="btn btn-primary"
                        onclick="showDashboardSection('post')">
                        Create Post
                    </button>
                </div>
            `;
        }

        return;
    }

    container.innerHTML =
        posts
            .map(post =>
                createPostCard(
                    post,
                    options
                )
            )
            .join("");
}

function createPostCard(
    post,
    options = {}
) {
    const author =
        post.author || {};

    const name =
        author.name ||
        "Delta Member";

    const role =
        author.role ||
        "Member";

    const likes =
        Number(
            post.likesCount ??
            post.likes?.length ??
            0
        );

    const liked =
        Boolean(
            currentUser &&
            Array.isArray(
                post.likes
            ) &&
            post.likes.some(
                id =>
                    String(
                        id?._id || id
                    ) ===
                    String(
                        currentUser.id
                    )
            )
        );

    const image =
        safeImageURL(
            post.imageUrl
        );

    const ownPost =
        currentUser &&
        author._id &&
        String(author._id) ===
            String(
                currentUser.id
            );

    return `
        <article
            class="post-card ${
                options.homeFeed
                    ? "home-post-card"
                    : ""
            }"
            data-post-id="${escapeHTML(
                post._id
            )}">

            <div class="post-header">

                <div class="post-avatar">
                    ${escapeHTML(
                        getInitials(name)
                    )}
                </div>

                <div class="post-author">

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <div class="post-meta">

                        <span class="role-badge">
                            ${escapeHTML(role)}
                        </span>

                        <span>
                            ${escapeHTML(
                                formatDate(
                                    post.createdAt
                                )
                            )}
                        </span>

                    </div>

                </div>

                ${
                    ownPost
                        ? `
                            <button
                                class="post-menu-button"
                                onclick="deletePost('${escapeHTML(
                                    post._id
                                )}')"
                                title="Delete post">
                                ×
                            </button>
                        `
                        : ""
                }

            </div>

            <div class="post-content">
                ${escapeHTML(
                    post.content
                )}
            </div>

            ${
                image
                    ? `
                        <div class="post-image-wrap">
                            <img
                                class="post-image"
                                src="${escapeHTML(
                                    image
                                )}"
                                alt="Post image"
                                loading="lazy"
                                onerror="this.parentElement.style.display='none';">
                        </div>
                    `
                    : ""
            }

            <div class="post-actions">

                <button
                    class="post-like-button ${
                        liked ? "liked" : ""
                    }"
                    onclick="togglePostLike(
                        '${escapeHTML(
                            post._id
                        )}',
                        this
                    )">

                    <span>
                        ${
                            liked
                                ? "♥"
                                : "♡"
                        }
                    </span>

                    <span class="like-count">
                        ${likes}
                    </span>

                </button>

                ${
                    options.homeFeed
                        ? `
                            <span class="post-action-label">
                                Delta Community
                            </span>
                        `
                        : ""
                }

            </div>

        </article>
    `;
}

async function togglePostLike(
    postId,
    button
) {
    if (!getToken()) {
        openJoin();
        return;
    }

    if (!button) {
        return;
    }

    button.disabled = true;

    try {
        const data =
            await apiRequest(
                `/api/posts/${postId}/like`,
                {
                    method: "POST"
                }
            );

        button.classList.toggle(
            "liked",
            data.liked
        );

        const icon =
            button.querySelector(
                "span"
            );

        const count =
            button.querySelector(
                ".like-count"
            );

        if (icon) {
            icon.textContent =
                data.liked
                    ? "♥"
                    : "♡";
        }

        if (count) {
            count.textContent =
                data.likesCount;
        }

    } catch (error) {
        console.error(
            "Like error:",
            error
        );
    } finally {
        button.disabled = false;
    }
}

async function deletePost(
    postId
) {
    const confirmed =
        window.confirm(
            "Delete this post?"
        );

    if (!confirmed) {
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
        await loadCommunityFeed();

    } catch (error) {
        alert(error.message);
    }
}


/* =========================================================
   FLOATING HOMEPAGE POSTS
========================================================= */

function renderFloatingPosts(posts) {
    const container =
        $("floatingPosts");

    if (!container) {
        return;
    }

    if (!posts.length) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML =
        posts
            .slice(0, 5)
            .map(
                (post, index) => `
                    <div
                        class="floating-post floating-post-${
                            index + 1
                        }"
                        data-floating-index="${index}">

                        <div class="floating-post-dot">
                            Δ
                        </div>

                        <div>
                            <strong>
                                ${escapeHTML(
                                    post.author?.name ||
                                    "Delta Member"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    post.content
                                        ?.slice(
                                            0,
                                            70
                                        ) ||
                                    ""
                                )}
                            </span>
                        </div>

                    </div>
                `
            )
            .join("");

    startFloatingRotation();
}

function startFloatingRotation() {
    if (floatingTimer) {
        clearInterval(
            floatingTimer
        );
    }

    const items =
        document.querySelectorAll(
            ".floating-post"
        );

    if (!items.length) {
        return;
    }

    let active = 0;

    items.forEach(
        (item, index) => {
            item.classList.toggle(
                "floating-active",
                index === 0
            );
        }
    );

    floatingTimer =
        setInterval(() => {
            items[active]
                ?.classList
                .remove(
                    "floating-active"
                );

            active =
                (active + 1) %
                items.length;

            items[active]
                ?.classList
                .add(
                    "floating-active"
                );

        }, 3200);
}


/* =========================================================
   DISCOVER
========================================================= */

$("discoverRole")?.addEventListener(
    "change",
    loadDiscoverUsers
);

async function loadDiscoverUsers() {
    if (!getToken()) {
        return;
    }

    const role =
        $("discoverRole")?.value ||
        "";

    const query =
        role
            ? `?role=${encodeURIComponent(
                  role
              )}`
            : "";

    if ($("discoverUsers")) {
        $("discoverUsers").innerHTML = `
            <div class="loading-state">
                Discovering people...
            </div>
        `;
    }

    try {
        const data =
            await apiRequest(
                `/api/connections/discover${query}`
            );

        const users =
            data.users || [];

        if (!users.length) {
            $("discoverUsers").innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">Δ</div>
                    <h3>No members found</h3>
                    <p>
                        New people will appear as the Delta
                        ecosystem grows.
                    </p>
                </div>
            `;
            return;
        }

        $("discoverUsers").innerHTML =
            users
                .map(
                    createDiscoverCard
                )
                .join("");

    } catch (error) {
        $("discoverUsers").innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">!</div>
                <h3>Unable to discover members</h3>
                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>
            </div>
        `;
    }
}

function createDiscoverCard(user) {
    return `
        <article class="discover-card">

            <div class="discover-avatar">
                ${escapeHTML(
                    getInitials(
                        user.name
                    )
                )}
            </div>

            <div class="discover-role">
                ${escapeHTML(
                    user.role
                )}
            </div>

            <h3>
                ${escapeHTML(
                    user.name
                )}
            </h3>

            <p>
                ${escapeHTML(
                    user.email
                )}
            </p>

            <div class="discover-actions">

                <button
                    class="btn btn-primary"
                    onclick="connectWithUser('${escapeHTML(
                        user._id
                    )}')">
                    Connect
                </button>

                <button
                    class="btn btn-outline"
                    onclick="viewUserActivity(
                        '${escapeHTML(
                            user._id
                        )}',
                        '${escapeHTML(
                            user.name
                        )}'
                    )">
                    Activity
                </button>

            </div>

        </article>
    `;
}

async function connectWithUser(
    userId
) {
    if (!getToken()) {
        openJoin();
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

        await loadConnections();

    } catch (error) {
        alert(
            error.message
        );
    }
}

async function viewUserActivity(
    userId,
    name
) {
    if (!$("activityModal")) {
        return;
    }

    $("activityModal")
        .classList
        .add("open");

    document.body.classList.add(
        "modal-open"
    );

    $("activityModalContent").innerHTML = `
        <div class="section-label">
            MEMBER ACTIVITY
        </div>

        <h2>
            ${escapeHTML(name)}
        </h2>

        <div class="loading-state">
            Loading activity...
        </div>
    `;

    try {
        const data =
            await apiRequest(
                `/api/posts/user/${userId}`
            );

        const posts =
            data.posts || [];

        if (!posts.length) {
            $("activityModalContent").innerHTML = `
                <div class="section-label">
                    MEMBER ACTIVITY
                </div>

                <h2>
                    ${escapeHTML(name)}
                </h2>

                <div class="empty-state">
                    <div class="empty-icon">Δ</div>
                    <h3>No posts yet</h3>
                    <p>
                        This member hasn't shared anything yet.
                    </p>
                </div>
            `;

            return;
        }

        $("activityModalContent").innerHTML = `
            <div class="section-label">
                MEMBER ACTIVITY
            </div>

            <h2>
                ${escapeHTML(name)}
            </h2>

            <div class="modal-post-list">
                ${posts
                    .map(post =>
                        createPostCard(
                            post
                        )
                    )
                    .join("")}
            </div>
        `;

    } catch (error) {
        $("activityModalContent").innerHTML = `
            <div class="section-label">
                MEMBER ACTIVITY
            </div>

            <h2>
                ${escapeHTML(name)}
            </h2>

            <div class="empty-state">
                <h3>Unable to load activity</h3>
                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>
            </div>
        `;
    }
}

function closeActivityModal() {
    $("activityModal")
        ?.classList
        .remove("open");

    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   PITCHES
========================================================= */

$("pitchForm")?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage(
            "pitchMessage"
        );

        if (
            !currentUser ||
            currentUser.role !==
                "Founder"
        ) {
            setMessage(
                "pitchMessage",
                "Only founders can create pitches.",
                "error"
            );
            return;
        }

        const button =
            $("pitchForm")
                .querySelector(
                    "button[type='submit']"
                );

        if (!button) {
            return;
        }

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent =
            "Saving...";

        try {
            await apiRequest(
                "/api/pitches",
                {
                    method: "POST",
                    body: {
                        title:
                            $("pitchTitle")
                                ?.value
                                .trim() ||
                            "",

                        description:
                            $("pitchDescription")
                                ?.value
                                .trim() ||
                            "",

                        industry:
                            $("pitchIndustry")
                                ?.value
                                .trim() ||
                            "",

                        stage:
                            $("pitchStage")
                                ?.value ||
                            "",

                        fundingRequired:
                            $("fundingRequired")
                                ?.value
                                .trim() ||
                            "",

                        website:
                            $("pitchWebsite")
                                ?.value
                                .trim() ||
                            "",

                        status:
                            $("pitchStatus")
                                ?.value ||
                            ""
                    }
                }
            );

            $("pitchForm").reset();

            setMessage(
                "pitchMessage",
                "Pitch saved successfully.",
                "success"
            );

            await loadMyPitches();

        } catch (error) {
            setMessage(
                "pitchMessage",
                error.message,
                "error"
            );
        } finally {
            button.disabled = false;
            button.textContent =
                originalText;
        }
    }
);

async function loadMyPitches() {
    if (!getToken()) {
        return;
    }

    try {
        const data =
            await apiRequest(
                "/api/pitches/my"
            );

        const pitches =
            data.pitches || [];

        if ($("pitchCount")) {
            $("pitchCount")
                .textContent =
                pitches.length;
        }

        renderPitches(
            pitches
        );

    } catch (error) {
        console.error(
            "Pitches error:",
            error
        );
    }
}

function renderPitches(
    pitches
) {
    if (!$("myPitches")) {
        return;
    }

    if (!pitches.length) {
        $("myPitches").innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">Δ</div>
                <h3>No pitches yet</h3>
                <p>
                    Create your first pitch and introduce
                    your startup to Delta.
                </p>
                <button
                    class="btn btn-primary"
                    onclick="showDashboardSection('pitch')">
                    Create Pitch
                </button>
            </div>
        `;

        return;
    }

    $("myPitches").innerHTML =
        pitches
            .map(
                pitch => `
                    <article class="pitch-card">

                        <div class="pitch-card-top">

                            <div>
                                <div class="section-label">
                                    ${escapeHTML(
                                        pitch.status
                                    )}
                                </div>

                                <h3>
                                    ${escapeHTML(
                                        pitch.title
                                    )}
                                </h3>
                            </div>

                        </div>

                        <p>
                            ${escapeHTML(
                                pitch.description
                            )}
                        </p>

                        <div class="pitch-meta-grid">

                            <span>
                                ${escapeHTML(
                                    pitch.industry ||
                                    "Industry not specified"
                                )}
                            </span>

                            <span>
                                ${escapeHTML(
                                    pitch.stage ||
                                    "Stage not specified"
                                )}
                            </span>

                            <span>
                                ${escapeHTML(
                                    pitch.fundingRequired ||
                                    "Funding not specified"
                                )}
                            </span>

                        </div>

                    </article>
                `
            )
            .join("");
}


/* =========================================================
   CONNECTIONS
========================================================= */

async function loadConnections() {
    if (!getToken()) {
        return;
    }

    try {
        const data =
            await apiRequest(
                "/api/connections"
            );

        const connections =
            data.connections || [];

        const accepted =
            connections.filter(
                connection =>
                    connection.status ===
                    "accepted"
            );

        if ($("connectionCount")) {
            $("connectionCount")
                .textContent =
                accepted.length;
        }

        renderConnections(
            connections
        );

    } catch (error) {
        console.error(
            "Connections error:",
            error
        );
    }
}

function renderConnections(
    connections
) {
    if (!$("connectionsList")) {
        return;
    }

    if (!connections.length) {
        $("connectionsList").innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">↔</div>
                <h3>No connections yet</h3>
                <p>
                    Start discovering people to build
                    your network.
                </p>
                <button
                    class="btn btn-primary"
                    onclick="showDashboardSection('discover')">
                    Discover People
                </button>
            </div>
        `;

        return;
    }

    $("connectionsList").innerHTML =
        connections
            .map(
                createConnectionCard
            )
            .join("");
}

function createConnectionCard(
    connection
) {
    const isSender =
        String(
            connection.sender?._id
        ) ===
        String(
            currentUser?.id
        );

    const person =
        isSender
            ? connection.receiver
            : connection.sender;

    const incoming =
        !isSender &&
        connection.status ===
            "pending";

    const accepted =
        connection.status ===
        "accepted";

    return `
        <article class="connection-card">

            <div class="discover-avatar">
                ${escapeHTML(
                    getInitials(
                        person?.name
                    )
                )}
            </div>

            <div class="connection-info">

                <strong>
                    ${escapeHTML(
                        person?.name ||
                        "Delta Member"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        person?.role ||
                        "Member"
                    )}
                </span>

                <small>
                    ${escapeHTML(
                        connection.status
                    )}
                </small>

            </div>

            <div class="connection-actions">

                ${
                    incoming
                        ? `
                            <button
                                class="btn btn-primary"
                                onclick="acceptConnection('${escapeHTML(
                                    connection._id
                                )}')">
                                Accept
                            </button>

                            <button
                                class="btn btn-outline"
                                onclick="rejectConnection('${escapeHTML(
                                    connection._id
                                )}')">
                                Reject
                            </button>
                        `
                        : accepted
                            ? `
                                <button
                                    class="btn btn-primary"
                                    onclick="openMessageFromConnection('${escapeHTML(
                                        person?._id
                                    )}')">
                                    Message
                                </button>
                            `
                            : `
                                <span class="connection-status">
                                    ${escapeHTML(
                                        connection.status
                                    )}
                                </span>
                            `
                }

            </div>

        </article>
    `;
}

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
        alert(
            error.message
        );
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
        alert(
            error.message
        );
    }
}


/* =========================================================
   MESSAGING
========================================================= */

async function loadConversations() {
    if (!getToken()) {
        return;
    }

    const container =
        $("conversationList");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading-state">
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

        renderConversations(
            conversations
        );

    } catch (error) {
        console.error(
            "Conversations error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">Δ</div>
                <h3>Messages unavailable</h3>
                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>
            </div>
        `;
    }
}

function renderConversations(
    conversations
) {
    const container =
        $("conversationList");

    if (!container) {
        return;
    }

    if (!conversations.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <h3>No conversations yet</h3>
                <p>
                    Connect with a founder, investor or consultant.
                    Once they accept, you can message them here.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        conversations
            .map(
                conversation => {
                    const participants =
                        conversation
                            .participants ||
                        [];

                    const other =
                        participants.find(
                            participant =>
                                String(
                                    participant._id
                                ) !==
                                String(
                                    currentUser?.id
                                )
                        );

                    if (!other) {
                        return "";
                    }

                    const active =
                        String(
                            other._id
                        ) ===
                        String(
                            activeChatUserId
                        );

                    return `
                        <button
                            type="button"
                            class="conversation-item ${
                                active
                                    ? "active"
                                    : ""
                            }"
                            data-user-id="${escapeHTML(
                                other._id
                            )}"
                            onclick="openConversation('${escapeHTML(
                                other._id
                            )}')">

                            <div class="discover-avatar">
                                ${escapeHTML(
                                    getInitials(
                                        other.name
                                    )
                                )}
                            </div>

                            <div class="connection-info">

                                <strong>
                                    ${escapeHTML(
                                        other.name
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        other.role
                                    )}
                                </span>

                            </div>

                        </button>
                    `;
                }
            )
            .join("");
}

async function openMessageFromConnection(
    userId
) {
    showDashboardSection(
        "messages"
    );

    await openConversation(
        userId
    );
}

async function openConversation(
    userId
) {
    if (!getToken()) {
        openJoin();
        return;
    }

    if (
        String(userId) ===
        String(currentUser?.id)
    ) {
        return;
    }

    activeChatUserId =
        userId;

    const empty =
        $("chatEmpty");

    const windowElement =
        $("chatWindow");

    if (empty) {
        empty.classList.add(
            "hidden"
        );
    }

    if (windowElement) {
        windowElement.classList.remove(
            "hidden"
        );
    }

    if ($("chatMessages")) {
        $("chatMessages").innerHTML = `
            <div class="loading-state">
                Loading conversation...
            </div>
        `;
    }

    try {
        const data =
            await apiRequest(
                `/api/messages/${userId}`
            );

        activeChatUser =
            data.user || null;

        renderChatHeader(
            activeChatUser
        );

        renderMessages(
            data.messages || []
        );

        await loadConversations();

        startMessageRefresh();

        scrollChatToBottom();

    } catch (error) {
        activeChatUserId = null;
        activeChatUser = null;

        if ($("chatMessages")) {
            $("chatMessages").innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">!</div>
                    <h3>Unable to open conversation</h3>
                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>
                </div>
            `;
        }

        stopMessageRefresh();
    }
}

function renderChatHeader(
    user
) {
    if (!user) {
        return;
    }

    if ($("chatUserName")) {
        $("chatUserName")
            .textContent =
            user.name ||
            "Delta Member";
    }

    if ($("chatUserRole")) {
        $("chatUserRole")
            .textContent =
            user.role ||
            "Member";
    }

    if ($("chatUserAvatar")) {
        $("chatUserAvatar")
            .textContent =
            getInitials(
                user.name
            );
    }
}

function renderMessages(
    messages
) {
    const container =
        $("chatMessages");

    if (!container) {
        return;
    }

    if (!messages.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <h3>Start the conversation</h3>
                <p>
                    Your connection is waiting for your first message.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        messages
            .map(message => {
                const senderId =
                    message.sender?._id ||
                    message.sender;

                const mine =
                    String(
                        senderId
                    ) ===
                    String(
                        currentUser?.id
                    );

                return `
                    <div class="message-row ${
                        mine
                            ? "message-mine"
                            : "message-theirs"
                    }">

                        <div class="message-bubble">

                            <div class="message-text">
                                ${escapeHTML(
                                    message.text
                                )}
                            </div>

                            <div class="message-time">
                                ${escapeHTML(
                                    formatTime(
                                        message.createdAt
                                    )
                                )}
                            </div>

                        </div>

                    </div>
                `;
            })
            .join("");
}

$("messageForm")?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        if (
            !activeChatUserId ||
            !getToken()
        ) {
            return;
        }

        const input =
            $("messageInput");

        if (!input) {
            return;
        }

        const text =
            input.value.trim();

        if (!text) {
            return;
        }

        const button =
            $("messageForm")
                .querySelector(
                    "button[type='submit']"
                );

        if (button) {
            button.disabled = true;
        }

        clearMessage(
            "messageStatus"
        );

        try {
            const data =
                await apiRequest(
                    `/api/messages/${activeChatUserId}`,
                    {
                        method: "POST",
                        body: {
                            text
                        }
                    }
                );

            input.value = "";

            if ($("messageStatus")) {
                $("messageStatus")
                    .textContent = "";
            }

            if (
                data.data &&
                $("chatMessages")
            ) {
                addMessageToChat(
                    data.data
                );
            } else {
                await refreshActiveConversation();
            }

            scrollChatToBottom();

        } catch (error) {
            setMessage(
                "messageStatus",
                error.message,
                "error"
            );
        } finally {
            if (button) {
                button.disabled = false;
            }

            input.focus();
        }
    }
);

function addMessageToChat(
    message
) {
    const container =
        $("chatMessages");

    if (!container) {
        return;
    }

    const emptyState =
        container.querySelector(
            ".empty-state"
        );

    if (emptyState) {
        container.innerHTML = "";
    }

    const senderId =
        message.sender?._id ||
        message.sender;

    const mine =
        String(senderId) ===
        String(currentUser?.id);

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        `message-row ${
            mine
                ? "message-mine"
                : "message-theirs"
        }`;

    wrapper.innerHTML = `
        <div class="message-bubble">

            <div class="message-text">
                ${escapeHTML(
                    message.text
                )}
            </div>

            <div class="message-time">
                ${escapeHTML(
                    formatTime(
                        message.createdAt
                    )
                )}
            </div>

        </div>
    `;

    container.appendChild(
        wrapper
    );
}

async function refreshActiveConversation() {
    if (
        !activeChatUserId ||
        !getToken()
    ) {
        return;
    }

    try {
        const data =
            await apiRequest(
                `/api/messages/${activeChatUserId}`
            );

        renderMessages(
            data.messages || []
        );

        if (data.user) {
            activeChatUser =
                data.user;

            renderChatHeader(
                data.user
            );
        }

        scrollChatToBottom();

    } catch (error) {
        console.error(
            "Message refresh error:",
            error
        );
    }
}

function startMessageRefresh() {
    stopMessageRefresh();

    if (!activeChatUserId) {
        return;
    }

    messageRefreshTimer =
        setInterval(
            async () => {
                await refreshActiveConversation();
            },
            5000
        );
}

function stopMessageRefresh() {
    if (
        messageRefreshTimer
    ) {
        clearInterval(
            messageRefreshTimer
        );

        messageRefreshTimer =
            null;
    }
}

function scrollChatToBottom() {
    const container =
        $("chatMessages");

    if (!container) {
        return;
    }

    requestAnimationFrame(() => {
        container.scrollTop =
            container.scrollHeight;
    });
}


/* =========================================================
   LOGOUT
========================================================= */

$("logoutButton")?.addEventListener(
    "click",
    () => {
        localStorage.removeItem(
            "deltaToken"
        );

        localStorage.removeItem(
            "deltaUser"
        );

        currentUser = null;
        currentProfile = null;
        activeChatUserId = null;
        activeChatUser = null;

        stopMessageRefresh();

        showLanding();

        resetAuthForms();

        window.location.reload();
    }
);


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            $("authModal")
        ) {
            closeJoin();
        }

        if (
            event.target ===
            $("activityModal")
        ) {
            closeActivityModal();
        }
    }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key ===
            "Escape"
        ) {
            if (
                $("authModal")
                    ?.classList
                    .contains("open")
            ) {
                closeJoin();
            }

            if (
                $("activityModal")
                    ?.classList
                    .contains("open")
            ) {
                closeActivityModal();
            }
        }
    }
);


/* =========================================================
   SESSION RESTORE
========================================================= */

async function restoreSession() {
    const token =
        getToken();

    if (!token) {
        await loadCommunityFeed();
        return;
    }

    currentUser =
        getStoredUser();

    if (!currentUser) {
        localStorage.removeItem(
            "deltaToken"
        );

        await loadCommunityFeed();
        return;
    }

    try {
        await enterDashboard();

    } catch (error) {
        console.error(
            "Session restore error:",
            error
        );

        localStorage.removeItem(
            "deltaToken"
        );

        localStorage.removeItem(
            "deltaUser"
        );

        currentUser = null;

        showLanding();

        await loadCommunityFeed();
    }
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        restoreSession();
    }
);