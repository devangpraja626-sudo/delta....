/* =========================================================
   DELTA V1 FRONTEND
   Social + Profiles + Pitches + Connections
========================================================= */

const API_URL = "https://delta-7.onrender.com";

let selectedRole = "";
let currentUser = null;
let currentProfile = null;
let floatingTimer = null;


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

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

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
   LANDING
========================================================= */

function goHome() {
    if (
        currentUser &&
        $("dashboardPage") &&
        !$("dashboardPage").classList.contains("hidden")
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
    $("dashboardPage").classList.add("hidden");
    $("landingPage").classList.remove("hidden");

    document.body.classList.remove(
        "dashboard-active"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   AUTH MODAL
========================================================= */

function openJoin(role = "") {
    $("authModal").classList.add("open");

    document.body.classList.add("modal-open");

    selectedRole = role || "";

    showRegisterChoice();

    if (role) {
        chooseRole(role);
    }
}

function closeJoin() {
    $("authModal").classList.remove("open");

    document.body.classList.remove(
        "modal-open"
    );
}

function chooseRole(role) {
    selectedRole = role;

    $("selectedRole").textContent =
        `${role} selected`;

    $("roleText").textContent =
        `Create your ${role} account.`;

    document
        .querySelectorAll(".role-card")
        .forEach(card => {
            card.classList.remove("selected");

            if (
                card.textContent
                    .toLowerCase()
                    .includes(role.toLowerCase())
            ) {
                card.classList.add("selected");
            }
        });
}

function showRegisterChoice() {
    $("authChoice").classList.remove("hidden");
    $("registerForm").classList.add("hidden");
    $("loginFormWrap").classList.add("hidden");
}

function showRegisterForm() {
    if (!selectedRole) {
        $("selectedRole").textContent =
            "Please select a role first.";
        return;
    }

    $("authChoice").classList.add("hidden");
    $("registerForm").classList.remove("hidden");
    $("loginFormWrap").classList.add("hidden");

    $("roleText").textContent =
        `Create your ${selectedRole} account.`;
}

function showLoginForm() {
    $("authChoice").classList.add("hidden");
    $("registerForm").classList.add("hidden");
    $("loginFormWrap").classList.remove("hidden");
}

function resetAuthForms() {
    $("registerForm").reset();
    $("loginForm").reset();

    clearMessage("registerMessage");
    clearMessage("loginMessage");

    selectedRole = "";

    $("selectedRole").textContent = "";

    document
        .querySelectorAll(".role-card")
        .forEach(card =>
            card.classList.remove("selected")
        );
}


/* =========================================================
   REGISTER
========================================================= */

$("registerForm").addEventListener(
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
                .querySelector("button[type='submit']");

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent = "Creating...";

        try {
            const data = await apiRequest(
                "/api/auth/register",
                {
                    method: "POST",
                    body: {
                        name: $("name").value.trim(),
                        email: $("email").value.trim(),
                        password: $("password").value,
                        role: selectedRole
                    }
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
            button.textContent = originalText;
        }
    }
);


/* =========================================================
   LOGIN
========================================================= */

$("loginForm").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage("loginMessage");

        const button =
            $("loginForm")
                .querySelector("button[type='submit']");

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent = "Logging in...";

        try {
            const data = await apiRequest(
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
                JSON.stringify(data.user)
            );

            currentUser = data.user;

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
            button.textContent = originalText;
        }
    }
);


/* =========================================================
   DASHBOARD
========================================================= */

async function enterDashboard() {
    $("landingPage").classList.add("hidden");
    $("dashboardPage").classList.remove("hidden");

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

    loadCommunityFeed();
}

function updateUserUI() {
    if (!currentUser) {
        return;
    }

    $("dashboardGreeting").textContent =
        currentUser.name || "Welcome";

    $("userBadge").textContent =
        currentUser.role || "Member";

    $("composerName").textContent =
        currentUser.name || "Delta Member";

    $("composerRole").textContent =
        currentUser.role || "Member";
}

function showDashboardSection(
    section,
    updateURL = true
) {
    document
        .querySelectorAll(".dash-section")
        .forEach(element =>
            element.classList.add("hidden")
        );

    const target =
        $(`section-${section}`);

    if (target) {
        target.classList.remove("hidden");
    }

    document
        .querySelectorAll(".side-link")
        .forEach(link =>
            link.classList.remove("active")
        );

    const matchingLink =
        Array.from(
            document.querySelectorAll(".side-link")
        ).find(link =>
            link
                .getAttribute("onclick")
                ?.includes(
                    `'${section}'`
                )
        );

    if (matchingLink) {
        matchingLink.classList.add("active");
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
}


/* =========================================================
   PROFILE
========================================================= */

function hideAllRoleFields() {
    document
        .querySelectorAll(".role-field")
        .forEach(field =>
            field.classList.add("hidden")
        );
}

function showRoleField(id) {
    const element = $(id);

    if (element) {
        element.classList.remove("hidden");
    }
}

function setupProfileRole(role) {
    hideAllRoleFields();

    if (role === "Founder") {
        showRoleField("founderStartupGroup");
        showRoleField("founderIdeaGroup");
        showRoleField("industryGroup");
        showRoleField("stageGroup");

        $("profileRoleHint").textContent =
            "Founder profile — showcase what you're building.";
    }

    if (role === "Investor") {
        showRoleField("investorFirmGroup");
        showRoleField("investorFocusGroup");
        showRoleField("investorIndustriesGroup");
        showRoleField("investorTicketGroup");

        $("profileRoleHint").textContent =
            "Investor profile — tell founders what you invest in.";
    }

    if (role === "Consultant") {
        showRoleField("consultantExpertiseGroup");
        showRoleField("consultantExperienceGroup");
        showRoleField("consultantRateGroup");

        $("profileRoleHint").textContent =
            "Consultant profile — showcase your expertise.";
    }
}

async function loadProfile() {
    try {
        const data =
            await apiRequest(
                "/api/profiles/me"
            );

        currentUser = data.user;
        currentProfile = data.profile;

        localStorage.setItem(
            "deltaUser",
            JSON.stringify(currentUser)
        );

        updateUserUI();

        setupProfileRole(
            currentUser.role
        );

        $("profileName").value =
            currentUser.name || "";

        $("location").value =
            currentProfile?.location || "";

        $("website").value =
            currentProfile?.website || "";

        $("bio").value =
            currentProfile?.bio || "";

        $("startupName").value =
            currentProfile?.startupName || "";

        $("idea").value =
            currentProfile?.idea || "";

        $("industry").value =
            currentProfile?.industry || "";

        $("stage").value =
            currentProfile?.stage || "";

        $("firmName").value =
            currentProfile?.firmName || "";

        $("investmentFocus").value =
            currentProfile?.investmentFocus || "";

        $("industries").value =
            Array.isArray(
                currentProfile?.industries
            )
                ? currentProfile.industries.join(", ")
                : "";

        $("ticketSize").value =
            currentProfile?.ticketSize || "";

        $("expertise").value =
            Array.isArray(
                currentProfile?.expertise
            )
                ? currentProfile.expertise.join(", ")
                : "";

        $("experience").value =
            currentProfile?.experience || "";

        $("hourlyRate").value =
            currentProfile?.hourlyRate || "";

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

    $("profileStatus").textContent =
        complete
            ? "Complete"
            : "Incomplete";
}

$("profileForm").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage("profileMessage");

        if (!currentUser) {
            return;
        }

        const role =
            currentUser.role;

        const payload = {
            location:
                $("location").value.trim(),

            website:
                $("website").value.trim(),

            bio:
                $("bio").value.trim()
        };

        if (role === "Founder") {
            payload.startupName =
                $("startupName").value.trim();

            payload.idea =
                $("idea").value.trim();

            payload.industry =
                $("industry").value.trim();

            payload.stage =
                $("stage").value;
        }

        if (role === "Investor") {
            payload.firmName =
                $("firmName").value.trim();

            payload.investmentFocus =
                $("investmentFocus").value.trim();

            payload.industries =
                $("industries")
                    .value
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean);

            payload.ticketSize =
                $("ticketSize").value.trim();
        }

        if (role === "Consultant") {
            payload.expertise =
                $("expertise")
                    .value
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean);

            payload.experience =
                $("experience").value.trim();

            payload.hourlyRate =
                $("hourlyRate").value.trim();
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

            if (
                $("profileName").value.trim() &&
                $("profileName").value.trim()
                !== currentUser.name
            ) {
                currentUser.name =
                    $("profileName").value.trim();

                localStorage.setItem(
                    "deltaUser",
                    JSON.stringify(currentUser)
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

$("postContent").addEventListener(
    "input",
    () => {
        $("postCharacterCount").textContent =
            $("postContent").value.length;
    }
);

$("postForm").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage("postMessage");

        const content =
            $("postContent")
                .value
                .trim();

        const imageUrl =
            $("postImageUrl")
                .value
                .trim();

        if (!content) {
            setMessage(
                "postMessage",
                "Write something before publishing.",
                "error"
            );
            return;
        }

        if (imageUrl && !safeImageURL(imageUrl)) {
            setMessage(
                "postMessage",
                "Please enter a valid http/https image URL.",
                "error"
            );
            return;
        }

        const button =
            $("postForm")
                .querySelector("button[type='submit']");

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent = "Publishing...";

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

            $("postCharacterCount")
                .textContent = "0";

            setMessage(
                "postMessage",
                "Post published successfully.",
                "success"
            );

            await loadMyPosts();
            await loadCommunityFeed();

            $("postForm")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            setTimeout(() => {
                setMessage(
                    "postMessage",
                    "",
                    ""
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
            button.textContent = originalText;
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

        $("postCount").textContent =
            posts.length;

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
        posts.map(post =>
            createPostCard(
                post,
                options
            )
        ).join("");
}

function createPostCard(
    post,
    options = {}
) {
    const author =
        post.author || {};

    const name =
        author.name || "Delta Member";

    const role =
        author.role || "Member";

    const likes =
        Number(
            post.likesCount ??
            post.likes?.length ??
            0
        );

    const liked =
        Boolean(
            currentUser &&
            Array.isArray(post.likes) &&
            post.likes.some(
                id =>
                    String(
                        id?._id || id
                    ) ===
                    String(currentUser.id)
            )
        );

    const image =
        safeImageURL(post.imageUrl);

    const ownPost =
        currentUser &&
        author._id &&
        String(author._id) ===
        String(currentUser.id);

    return `
        <article
            class="post-card ${options.homeFeed ? "home-post-card" : ""}"
            data-post-id="${escapeHTML(post._id)}">

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
                                onclick="deletePost('${escapeHTML(post._id)}')"
                                title="Delete post">
                                ×
                            </button>
                        `
                        : ""
                }

            </div>

            <div class="post-content">
                ${escapeHTML(post.content)}
            </div>

            ${
                image
                    ? `
                        <div class="post-image-wrap">
                            <img
                                class="post-image"
                                src="${escapeHTML(image)}"
                                alt="Post image"
                                loading="lazy"
                                onerror="this.parentElement.style.display='none';">
                        </div>
                    `
                    : ""
            }

            <div class="post-actions">

                <button
                    class="post-like-button ${liked ? "liked" : ""}"
                    onclick="togglePostLike('${escapeHTML(post._id)}', this)">

                    <span>
                        ${liked ? "♥" : "♡"}
                    </span>

                    <span class="like-count">
                        ${likes}
                    </span>

                </button>

                ${
                    !options.homeFeed
                        ? ""
                        : `
                            <span class="post-action-label">
                                Delta Community
                            </span>
                        `
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
            button.querySelector("span");

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

async function deletePost(postId) {
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
                        class="floating-post floating-post-${index + 1}"
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
                                        ?.slice(0, 70) ||
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

$("discoverRole").addEventListener(
    "change",
    loadDiscoverUsers
);

async function loadDiscoverUsers() {
    if (!getToken()) {
        return;
    }

    const role =
        $("discoverRole").value;

    const query =
        role
            ? `?role=${encodeURIComponent(role)}`
            : "";

    $("discoverUsers").innerHTML = `
        <div class="loading-state">
            Discovering people...
        </div>
    `;

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
                .map(createDiscoverCard)
                .join("");

    } catch (error) {
        $("discoverUsers").innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">!</div>
                <h3>Unable to discover members</h3>
                <p>
                    ${escapeHTML(error.message)}
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
                    getInitials(user.name)
                )}
            </div>

            <div class="discover-role">
                ${escapeHTML(user.role)}
            </div>

            <h3>
                ${escapeHTML(user.name)}
            </h3>

            <p>
                ${escapeHTML(user.email)}
            </p>

            <div class="discover-actions">

                <button
                    class="btn btn-primary"
                    onclick="connectWithUser('${escapeHTML(user._id)}')">
                    Connect
                </button>

                <button
                    class="btn btn-outline"
                    onclick="viewUserActivity('${escapeHTML(user._id)}', '${escapeHTML(user.name)}')">
                    Activity
                </button>

            </div>

        </article>
    `;
}

async function connectWithUser(userId) {
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
        alert(error.message);
    }
}

async function viewUserActivity(
    userId,
    name
) {
    $("activityModal").classList.add("open");
    document.body.classList.add("modal-open");

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
            $("activityModalContent").innerHTML += `
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
                        createPostCard(post)
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
                    ${escapeHTML(error.message)}
                </p>
            </div>
        `;
    }
}

function closeActivityModal() {
    $("activityModal")
        .classList
        .remove("open");

    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   PITCHES
========================================================= */

$("pitchForm").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        clearMessage("pitchMessage");

        if (
            !currentUser ||
            currentUser.role !== "Founder"
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
                .querySelector("button[type='submit']");

        const originalText =
            button.textContent;

        button.disabled = true;
        button.textContent = "Saving...";

        try {
            await apiRequest(
                "/api/pitches",
                {
                    method: "POST",
                    body: {
                        title:
                            $("pitchTitle")
                                .value
                                .trim(),

                        description:
                            $("pitchDescription")
                                .value
                                .trim(),

                        industry:
                            $("pitchIndustry")
                                .value
                                .trim(),

                        stage:
                            $("pitchStage").value,

                        fundingRequired:
                            $("fundingRequired")
                                .value
                                .trim(),

                        website:
                            $("pitchWebsite")
                                .value
                                .trim(),

                        status:
                            $("pitchStatus").value
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
            button.textContent = originalText;
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

        $("pitchCount").textContent =
            pitches.length;

        renderPitches(pitches);

    } catch (error) {
        console.error(
            "Pitches error:",
            error
        );
    }
}

function renderPitches(pitches) {
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

        $("connectionCount").textContent =
            connections.filter(
                connection =>
                    connection.status ===
                    "accepted"
            ).length;

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

function renderConnections(connections) {
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
                connection =>
                    createConnectionCard(
                        connection
                    )
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
        String(currentUser?.id);

    const person =
        isSender
            ? connection.receiver
            : connection.sender;

    const incoming =
        !isSender &&
        connection.status ===
        "pending";

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
                                onclick="acceptConnection('${escapeHTML(connection._id)}')">
                                Accept
                            </button>

                            <button
                                class="btn btn-outline"
                                onclick="rejectConnection('${escapeHTML(connection._id)}')">
                                Reject
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


/* =========================================================
   LOGOUT
========================================================= */

$("logoutButton").addEventListener(
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
   SESSION RESTORE
========================================================= */

async function restoreSession() {
    const token =
        getToken();

    if (!token) {
        loadCommunityFeed();
        return;
    }

    currentUser =
        getStoredUser();

    if (!currentUser) {
        localStorage.removeItem(
            "deltaToken"
        );

        loadCommunityFeed();
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

        loadCommunityFeed();
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