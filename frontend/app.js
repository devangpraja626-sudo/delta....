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
    } catch (error) {
        throw new Error("Server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
}


/* =========================================
   AUTH MODAL
========================================= */

function openJoin() {

    if (!authModal) return;

    authModal.classList.remove("hidden");

    if (authChoice) {
        authChoice.classList.remove("hidden");
    }

    if (registerForm) {
        registerForm.classList.add("hidden");
    }

    if (loginFormWrap) {
        loginFormWrap.classList.add("hidden");
    }

    document.body.style.overflow = "hidden";
}


function closeJoin() {

    if (!authModal) return;

    authModal.classList.add("hidden");

    document.body.style.overflow = "";
}


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


/* =========================================
   ROLE SELECTION
========================================= */

function chooseRole(role) {

    selectedUserRole = role;

    if (selectedRole) {
        selectedRole.dataset.role = role;
        selectedRole.textContent = role;
    }

    if (roleText) {
        roleText.textContent = role;
    }

    showRegister();
}


/* =========================================
   REGISTER
========================================= */

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        try {

            const name =
                document.getElementById("name")?.value.trim();

            const email =
                document.getElementById("email")?.value.trim();

            const password =
                document.getElementById("password")?.value;

            if (!name || !email || !password) {

                if (registerMessage) {
                    registerMessage.textContent =
                        "Please fill all fields.";
                }

                return;
            }

            if (!selectedUserRole) {

                if (registerMessage) {
                    registerMessage.textContent =
                        "Please select your role first.";
                }

                return;
            }

            if (registerMessage) {
                registerMessage.textContent =
                    "Creating your account...";
            }

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
                    "Account created successfully. You can now login.";
            }

            registerForm.reset();

            setTimeout(() => {
                showLogin();
            }, 800);

        } catch (error) {

            console.error("REGISTER ERROR:", error);

            if (registerMessage) {
                registerMessage.textContent =
                    error.message || "Registration failed.";
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

        try {

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

            const data = await apiRequest("/api/auth/login", {

                method: "POST",

                body: JSON.stringify({
                    email,
                    password
                })

            });

            console.log("LOGIN RESPONSE:", data);

            if (!data.success) {
                throw new Error(
                    data.message || "Login failed."
                );
            }

            /* SAVE LOGIN */

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

            console.log(
                "TOKEN SAVED:",
                !!localStorage.getItem("deltaToken")
            );

            console.log(
                "USER SAVED:",
                getCurrentUser()
            );

            /* OPEN DASHBOARD */

            closeJoin();

            openDashboard();

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            if (loginMessage) {
                loginMessage.textContent =
                    error.message || "Login failed.";
            }

        }

    });

}


/* =========================================
   CURRENT USER
========================================= */

function getCurrentUser() {

    try {

        const user = localStorage.getItem("deltaUser");

        if (!user) {
            return null;
        }

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "USER PARSE ERROR:",
            error
        );

        return null;
    }
}


/* =========================================
   OPEN DASHBOARD
========================================= */

function openDashboard() {

    console.log("=================================");
    console.log("DELTA DASHBOARD OPEN");
    console.log("=================================");

    const user = getCurrentUser();

    console.log("CURRENT USER:", user);

    if (!user) {

        console.error(
            "No user found in localStorage."
        );

        return;
    }

    const landing =
        document.getElementById("landingPage");

    const dashboard =
        document.getElementById("dashboardPage");

    console.log("LANDING PAGE:", landing);
    console.log("DASHBOARD PAGE:", dashboard);

    if (!dashboard) {

        console.error(
            "dashboardPage element NOT FOUND."
        );

        return;
    }


    /* HIDE LANDING */

    if (landing) {

        landing.classList.add("hidden");

        landing.style.display = "none";
    }


    /* SHOW DASHBOARD */

    dashboard.classList.remove("hidden");

    dashboard.style.display = "flex";

    dashboard.style.visibility = "visible";

    dashboard.style.opacity = "1";


    document.body.style.overflow = "";


    /* GREETING */

    const greeting =
        document.getElementById("dashboardGreeting");

    if (greeting) {

        greeting.textContent =
            `Welcome, ${user.name || "Founder"}.`;
    }


    /* USER BADGE */

    const badge =
        document.getElementById("userBadge");

    if (badge) {

        badge.textContent =
            user.role || "Member";
    }


    /* DEFAULT SECTION */

    showDashboardSection("dashboard");


    console.log(
        "DASHBOARD OPENED SUCCESSFULLY"
    );


    /* LOAD DATA */

    loadDashboard();
}


/* =========================================
   DASHBOARD NAVIGATION
========================================= */

function showDashboardSection(section) {

    const sections =
        document.querySelectorAll(".dash-section");

    sections.forEach(function (item) {

        item.classList.add("hidden");

    });


    const target =
        document.getElementById(
            `section-${section}`
        );

    if (target) {

        target.classList.remove("hidden");

    }


    /* SIDE LINKS */

    const links =
        document.querySelectorAll(".side-link");

    links.forEach(function (link) {

        link.classList.remove("active");

        const targetSection =
            link.dataset.section;

        if (targetSection === section) {
            link.classList.add("active");
        }

    });


    /* LOAD SECTION DATA */

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
   SIDEBAR LINKS
========================================= */

document
    .querySelectorAll(".side-link")
    .forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const section =
                link.dataset.section;

            if (section) {
                showDashboardSection(section);
            }

        });

    });


/* =========================================
   DASHBOARD LOAD
========================================= */

async function loadDashboard() {

    console.log(
        "Loading dashboard data..."
    );

    try {

        await Promise.all([
            loadProfile(),
            loadMyPitches(),
            loadConnections()
        ]);

        console.log(
            "Dashboard data loaded."
        );

    } catch (error) {

        console.error(
            "DASHBOARD LOAD ERROR:",
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
            await apiRequest(
                "/api/profiles/me"
            );

        console.log(
            "PROFILE:",
            data
        );

        const profile =
            data.profile || data.user || data;

        if (!profile) return;


        const profileName =
            document.getElementById(
                "profileName"
            );

        const startupName =
            document.getElementById(
                "startupName"
            );

        const industry =
            document.getElementById(
                "industry"
            );

        const location =
            document.getElementById(
                "location"
            );

        const stage =
            document.getElementById(
                "stage"
            );

        const website =
            document.getElementById(
                "website"
            );

        const bio =
            document.getElementById(
                "bio"
            );


        if (profileName)
            profileName.value =
                profile.name || "";


        if (startupName)
            startupName.value =
                profile.startupName || "";


        if (industry)
            industry.value =
                profile.industry || "";


        if (location)
            location.value =
                profile.location || "";


        if (stage)
            stage.value =
                profile.stage || "";


        if (website)
            website.value =
                profile.website || "";


        if (bio)
            bio.value =
                profile.bio || "";


    } catch (error) {

        console.error(
            "PROFILE LOAD ERROR:",
            error
        );

    }

}


/* =========================================
   SAVE PROFILE
========================================= */

const profileForm =
    document.getElementById("profileForm");

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const profileMessage =
                document.getElementById(
                    "profileMessage"
                );

            try {

                const payload = {

                    name:
                        document.getElementById(
                            "profileName"
                        )?.value.trim(),

                    startupName:
                        document.getElementById(
                            "startupName"
                        )?.value.trim(),

                    industry:
                        document.getElementById(
                            "industry"
                        )?.value.trim(),

                    location:
                        document.getElementById(
                            "location"
                        )?.value.trim(),

                    stage:
                        document.getElementById(
                            "stage"
                        )?.value,

                    website:
                        document.getElementById(
                            "website"
                        )?.value.trim(),

                    bio:
                        document.getElementById(
                            "bio"
                        )?.value.trim()

                };


                if (profileMessage) {

                    profileMessage.textContent =
                        "Saving profile...";
                }


                const data =
                    await apiRequest(
                        "/api/profiles/me",
                        {
                            method: "PUT",
                            body: JSON.stringify(payload)
                        }
                    );


                if (profileMessage) {

                    profileMessage.textContent =
                        data.message ||
                        "Profile saved successfully.";
                }


            } catch (error) {

                console.error(
                    "PROFILE SAVE ERROR:",
                    error
                );

                if (profileMessage) {

                    profileMessage.textContent =
                        error.message ||
                        "Could not save profile.";
                }

            }

        }
    );

}


/* =========================================
   CREATE PITCH
========================================= */

const pitchForm =
    document.getElementById("pitchForm");

if (pitchForm) {

    pitchForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const pitchMessage =
                document.getElementById(
                    "pitchMessage"
                );

            try {

                const payload = {

                    title:
                        document.getElementById(
                            "pitchTitle"
                        )?.value.trim(),

                    industry:
                        document.getElementById(
                            "pitchIndustry"
                        )?.value.trim(),

                    stage:
                        document.getElementById(
                            "pitchStage"
                        )?.value,

                    fundingRequired:
                        document.getElementById(
                            "fundingRequired"
                        )?.value,

                    website:
                        document.getElementById(
                            "pitchWebsite"
                        )?.value.trim(),

                    status:
                        document.getElementById(
                            "pitchStatus"
                        )?.value,

                    description:
                        document.getElementById(
                            "pitchDescription"
                        )?.value.trim()

                };


                if (pitchMessage) {

                    pitchMessage.textContent =
                        "Publishing pitch...";
                }


                const data =
                    await apiRequest(
                        "/api/pitches",
                        {
                            method: "POST",
                            body: JSON.stringify(payload)
                        }
                    );


                if (pitchMessage) {

                    pitchMessage.textContent =
                        data.message ||
                        "Pitch published successfully.";
                }


                pitchForm.reset();

                loadMyPitches();


            } catch (error) {

                console.error(
                    "PITCH CREATE ERROR:",
                    error
                );

                if (pitchMessage) {

                    pitchMessage.textContent =
                        error.message ||
                        "Could not publish pitch.";
                }

            }

        }
    );

}


/* =========================================
   MY PITCHES
========================================= */

async function loadMyPitches() {

    const container =
        document.getElementById(
            "myPitches"
        );

    if (!container) return;


    try {

        const data =
            await apiRequest(
                "/api/pitches/my"
            );

        console.log(
            "MY PITCHES:",
            data
        );

        const pitches =
            data.pitches || [];


        if (!pitches.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No pitches yet</h3>
                    <p>Create your first pitch and put your startup in front of the ecosystem.</p>
                </div>
            `;

            return;
        }


        container.innerHTML =
            pitches.map(function (pitch) {

                return `
                    <div class="pitch-card">

                        <h3>
                            ${escapeHTML(
                                pitch.title || "Untitled Pitch"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                pitch.description || ""
                            )}
                        </p>

                        <div class="pitch-meta">

                            <span>
                                ${escapeHTML(
                                    pitch.industry || ""
                                )}
                            </span>

                            <span>
                                ${escapeHTML(
                                    pitch.stage || ""
                                )}
                            </span>

                            <span>
                                ${escapeHTML(
                                    pitch.status || ""
                                )}
                            </span>

                        </div>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "PITCH LOAD ERROR:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load pitches.
            </div>
        `;

    }

}


/* =========================================
   DISCOVER
========================================= */

const discoverRole =
    document.getElementById(
        "discoverRole"
    );

if (discoverRole) {

    discoverRole.addEventListener(
        "change",
        loadDiscover
    );

}


async function loadDiscover() {

    const container =
        document.getElementById(
            "discoverUsers"
        );

    if (!container) return;


    try {

        const role =
            discoverRole?.value || "";


        let endpoint =
            "/api/profiles";


        if (role) {

            endpoint +=
                `?role=${encodeURIComponent(role)}`;
        }


        const data =
            await apiRequest(endpoint);


        console.log(
            "DISCOVER:",
            data
        );


        const users =
            data.profiles ||
            data.users ||
            [];


        if (!users.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No members found</h3>
                    <p>Try another role or check back later.</p>
                </div>
            `;

            return;
        }


        container.innerHTML =
            users.map(function (user) {

                return `
                    <div class="member-card">

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

                        <p>
                            ${escapeHTML(
                                user.startupName || ""
                            )}
                        </p>

                        <button
                            class="primary-btn"
                            onclick="sendConnection('${user._id || user.id}')"
                        >
                            Connect
                        </button>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "DISCOVER ERROR:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load members.
            </div>
        `;

    }

}


/* =========================================
   CONNECTIONS
========================================= */

async function loadConnections() {

    const container =
        document.getElementById(
            "connectionsList"
        );

    if (!container) return;


    try {

        const data =
            await apiRequest(
                "/api/connections"
            );


        console.log(
            "CONNECTIONS:",
            data
        );


        const connections =
            data.connections || [];


        if (!connections.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No connections yet</h3>
                    <p>Start discovering founders, investors and consultants.</p>
                </div>
            `;

            return;
        }


        container.innerHTML =
            connections.map(function (connection) {

                const person =
                    connection.user ||
                    connection.sender ||
                    connection.receiver ||
                    {};


                return `
                    <div class="connection-card">

                        <h3>
                            ${escapeHTML(
                                person.name ||
                                "Delta Member"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                person.role || ""
                            )}
                        </p>

                        <span>
                            ${escapeHTML(
                                connection.status ||
                                "connected"
                            )}
                        </span>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "CONNECTIONS ERROR:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load connections.
            </div>
        `;

    }

}


/* =========================================
   SEND CONNECTION
========================================= */

async function sendConnection(userId) {

    if (!userId) return;


    try {

        const data =
            await apiRequest(
                "/api/connections",
                {
                    method: "POST",
                    body: JSON.stringify({
                        userId
                    })
                }
            );


        alert(
            data.message ||
            "Connection request sent."
        );


        loadConnections();


    } catch (error) {

        console.error(
            "CONNECTION ERROR:",
            error
        );

        alert(
            error.message ||
            "Could not send connection request."
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "deltaToken"
            );

            localStorage.removeItem(
                "deltaUser"
            );


            if (dashboardPage) {

                dashboardPage.classList.add(
                    "hidden"
                );

                dashboardPage.style.display =
                    "none";
            }


            if (landingPage) {

                landingPage.classList.remove(
                    "hidden"
                );

                landingPage.style.display =
                    "";
            }


            window.scrollTo(0, 0);

        }
    );

}


/* =========================================
   HTML ESCAPE
========================================= */

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


/* =========================================
   AUTO LOGIN / SESSION RESTORE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "DELTA APP INITIALIZED"
        );


        const user =
            getCurrentUser();

        const token =
            localStorage.getItem(
                "deltaToken"
            );


        console.log(
            "TOKEN EXISTS:",
            !!token
        );

        console.log(
            "USER EXISTS:",
            !!user
        );


        if (user && token) {

            openDashboard();

        }

    }
);