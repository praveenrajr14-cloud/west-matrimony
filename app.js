// JUST MATRIMONY APPLICATION STATE & INTERACTION LOGIC

// =========================================================================
// SUPABASE CLIENT CONFIGURATION
// =========================================================================
const SUPABASE_URL = "https://hcpvatyjvxxylnlagxyt.supabase.co"; // Replace with your URL
const SUPABASE_KEY = "sb_publishable_LwqL35y2j9lfXY_T64hfEw_ksOlYLE3"; // Replace with your Key

let supabaseClient = null;
let isBackendEnabled = false;
try {
    if (typeof window.supabase !== "undefined" && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        isBackendEnabled = SUPABASE_URL !== "https://your-project-id.supabaseClient.co" && SUPABASE_KEY !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key";
    }
} catch (e) {
    console.error("Supabase load failed, running in LocalStorage mode:", e);
}

// 1. MOCK DATABASE OF PROFILE MATCHES
const MOCK_PROFILES = [];

// Default User (Initial Login State Mock)
const DEFAULT_USER = {
    name: "Amit Kumar",
    gender: "male",
    age: 28,
    height: "5 ft 8 in",
    religion: "Hindu",
    caste: "Rajput",
    mothertongue: "Hindi",
    education: "MBA in Marketing",
    occupation: "Banker",
    income: "₹8 - 12 Lakhs",
    location: "Mumbai",
    about: "A creative and enthusiastic banker based in Mumbai. I enjoy working on fintech trends, reading fiction, playing badminton on weekends, and cooking traditional dishes.",
    prefAgeMin: 23,
    prefAgeMax: 29,
    prefReligion: "Hindu",
    prefLocation: "Bangalore",
    image: "assets/images/profile_male_2.png" // Placeholder avatar
};

// 2. CHAT BOT AUTOMATED RESPONSES
const MOCK_CHAT_BOT_REPLIES = {
    "WM-10294": [
        "Hi there! Glad to connect. I would love to know more about your career and interests.",
        "That sounds wonderful! I actually work near Infopark in Kochi. How about you?",
        "Yes, my family is very supportive of my career choices. It's really nice talking to you."
    ],
    "WM-28190": [
        "Hello! Thank you for matching. What do you do for fun on weekends?",
        "Oh neat! Bangalore is great for trekking. Let me know if you ever visit.",
        "For sure, sharing core values is the most important thing. Let's stay in touch!"
    ],
    "WM-40192": [
        "Hey! Happy to chat. I saw your profile and it looks very interesting.",
        "I love designing products and exploring cafe cultures. What about your hobbies?",
        "Absolutely, that makes sense. It takes time to find the right partner."
    ],
    "WM-89102": [
        "Hi! Good to connect. How is your week going?",
        "Working in banking keeps me busy, but I always find time for squash. Do you play any sports?",
        "Excellent. Let's speak to our families if we feel the connection matches."
    ]
};

// 3. APPLICATION STATE OBJECT
let state = {
    currentUser: null,
    profiles: [...MOCK_PROFILES],
    shortlist: [],
    sentInterests: [],
    chats: {}, // format: { profileId: [ {sender: 'user/partner', text: '...', time: '...' } ] }
    activeView: "landing",
    activeProfileDetail: null,
    activeProfileTab: "about",
    activeConnectionTab: "shortlists",
    activeChatId: null
};

// 4. ON INIT INITIALIZE
window.addEventListener("DOMContentLoaded", () => {
    // Load state from LocalStorage if exists
    initLocalStorageState();
    
    // Switch to initial view
    switchView(state.activeView);
    
    // Render featured profiles on landing page
    renderFeaturedProfiles();
    
    // Setup Navigation Logo click
    document.getElementById("nav-logo").addEventListener("click", () => {
        switchView("landing");
    });
    
    // Setup admin panel triggers
    setupAdminViewListeners();
    
    // Load live Supabase data if enabled
    if (isBackendEnabled) {
        loadSupabaseData().then(() => {
            loadChatMessages();
        });
    }
    
    // Start background slideshow cycling
    startBackgroundSlideshows();
    
    // Close dropdowns when clicking outside
    window.addEventListener("click", (e) => {
        if (!e.target.closest(".user-profile-chip")) {
            const dropdown = document.getElementById("user-dropdown-menu");
            if (dropdown && !dropdown.classList.contains("hidden")) {
                dropdown.classList.add("hidden");
            }
        }
        
        // Close mobile nav menu when clicking outside
        if (!e.target.closest(".mobile-menu-toggle") && !e.target.closest(".main-nav")) {
            const navMenu = document.getElementById("app-nav-menu");
            if (navMenu && navMenu.classList.contains("mobile-open")) {
                navMenu.classList.remove("mobile-open");
            }
        }
    });
});

// Initialize localStorage State
function initLocalStorageState() {
    const savedUser = localStorage.getItem("wm_current_user");
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
    }
    
    const savedShortlist = localStorage.getItem("wm_shortlist");
    if (savedShortlist) {
        state.shortlist = JSON.parse(savedShortlist);
    }
    
    const savedInterests = localStorage.getItem("wm_interests");
    if (savedInterests) {
        state.sentInterests = JSON.parse(savedInterests);
    }
    
    const savedChats = localStorage.getItem("wm_chats");
    if (savedChats) {
        state.chats = JSON.parse(savedChats);
    }
    
    // Load custom profiles registered by Admin
    const savedCustom = localStorage.getItem("wm_custom_profiles");
    if (savedCustom) {
        const customProfiles = JSON.parse(savedCustom);
        state.profiles = [...MOCK_PROFILES, ...customProfiles];
    }
    
    updateHeaderAuthDOM();
}

// 5. VIEW SWITCHING & ROUTING
function switchView(viewName, subView = null) {
    state.activeView = viewName;
    
    // Close mobile nav menu if open
    const navMenu = document.getElementById("app-nav-menu");
    if (navMenu && navMenu.classList.contains("mobile-open")) {
        navMenu.classList.remove("mobile-open");
    }
    
    // Hide all views
    const views = document.querySelectorAll(".view-section");
    views.forEach(view => {
        view.classList.add("hidden");
        view.classList.remove("active");
    });
    
    // Show target view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.remove("hidden");
        targetView.classList.add("active");
    }
    
    // Highlight Active Nav Link
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => link.classList.remove("active"));
    
    if (viewName === "landing") {
        document.getElementById("nav-link-home").classList.add("active");
    } else if (viewName === "dashboard") {
        document.getElementById("nav-link-dashboard").classList.add("active");
    } else if (viewName === "browse") {
        document.getElementById("nav-link-browse").classList.add("active");
    } else if (viewName === "connections") {
        document.getElementById("nav-link-shortlist").classList.add("active");
    } else if (viewName === "admin") {
        const adminLink = document.getElementById("nav-link-admin");
        if (adminLink) adminLink.classList.add("active");
    }
    
    // Sub-view Specific Loaders
    if (viewName === "auth") {
        setAuthTab(subView || "login");
    } else if (viewName === "dashboard") {
        if (!state.currentUser) {
            switchView("auth", "login");
            showToast("Please login to access the dashboard", "info");
            return;
        }
        renderDashboard();
    } else if (viewName === "browse") {
        resetFilters();
        applyFilters();
    } else if (viewName === "connections") {
        if (!state.currentUser) {
            switchView("auth", "login");
            showToast("Please login to access shortlists & chats", "info");
            return;
        }
        setConnectionTab(subView || "shortlists");
    } else if (viewName === "myprofile") {
        if (!state.currentUser) {
            switchView("auth", "login");
            return;
        }
        loadMyProfileFormData();
    } else if (viewName === "admin") {
        const isUrlAdmin = window.location.search.includes("admin=true");
        const isAdminUser = state.currentUser && state.currentUser.isAdmin;
        if (!isAdminUser && !isUrlAdmin) {
            switchView("landing");
            showToast("Access Denied: Administrator privileges required.", "danger");
            return;
        }
        // Prepare Admin form preview container states
        const prevContainer = document.getElementById("admin-photo-preview-container");
        if (prevContainer) prevContainer.classList.add("hidden");
        adminPhotoBase64 = "";
    }
    
    // Close dropdowns
    const dropdown = document.getElementById("user-dropdown-menu");
    if (dropdown) dropdown.classList.add("hidden");
    
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Handle Header Nav Click checking Auth Guard
function handleNavClick(viewName) {
    if ((viewName === "dashboard" || viewName === "shortlist") && !state.currentUser) {
        switchView("auth", "login");
        showToast("Please sign in or register to access this section.", "info");
    } else {
        const dest = viewName === "shortlist" ? "connections" : viewName;
        switchView(dest);
    }
}

// 6. UPDATE HEADER DOM
function updateHeaderAuthDOM() {
    const authArea = document.getElementById("header-auth-area");
    const userChip = document.getElementById("header-user-chip");
    const hiddenAuthLinks = document.querySelectorAll(".hidden-auth");
    const adminLink = document.getElementById("nav-link-admin");
    
    const isUrlAdmin = window.location.search.includes("admin=true");
    const isAdminUser = state.currentUser && state.currentUser.isAdmin;
    
    if (adminLink) {
        if (isAdminUser || isUrlAdmin) {
            adminLink.classList.remove("hidden");
        } else {
            adminLink.classList.add("hidden");
        }
    }
    
    const mobLogin = document.getElementById("mobile-nav-login");
    const mobRegister = document.getElementById("mobile-nav-register");
    const mobLogout = document.getElementById("mobile-nav-logout");
    
    if (state.currentUser) {
        authArea.classList.add("hidden");
        userChip.classList.remove("hidden");
        
        if (mobLogin) mobLogin.classList.add("hidden");
        if (mobRegister) mobRegister.classList.add("hidden");
        if (mobLogout) mobLogout.classList.remove("hidden");
        
        // Populate profile chip
        document.getElementById("header-user-name").textContent = state.currentUser.name;
        // Use matching gender placeholder if default photo
        if (state.currentUser.gender === "female") {
            document.getElementById("header-user-avatar").src = "assets/images/profile_female_1.png";
        } else {
            document.getElementById("header-user-avatar").src = "assets/images/profile_male_1.png";
        }
        
        // Show auth-only navigation links
        hiddenAuthLinks.forEach(link => link.classList.remove("hidden-auth"));
    } else {
        authArea.classList.remove("hidden");
        userChip.classList.add("hidden");
        
        if (mobLogin) mobLogin.classList.remove("hidden");
        if (mobRegister) mobRegister.classList.remove("hidden");
        if (mobLogout) mobLogout.classList.add("hidden");
        
        // Hide auth-only links
        hiddenAuthLinks.forEach(link => link.classList.add("hidden-auth"));
    }
}

// User Dropdown toggle
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById("app-nav-menu");
    if (navMenu) {
        navMenu.classList.toggle("mobile-open");
    }
}

// 7. LANDING VIEW - RENDER FEATURED
function renderFeaturedProfiles() {
    const container = document.getElementById("featured-profiles-container");
    if (!container) return;
    
    container.innerHTML = "";
    // Show first 3 profiles as featured
    const featured = state.profiles.slice(0, 3);
    
    featured.forEach(profile => {
        const card = createProfileCardDOM(profile, true); // true for landing page
        container.appendChild(card);
    });
}

// Helper to create general Profile Card DOM
function createProfileCardDOM(profile, isLanding = false) {
    const card = document.createElement("div");
    card.className = "profile-card";
    
    // Check if user is logged in
    const isLoggedIn = state.currentUser !== null;
    
    // Calculate match score
    const score = isLoggedIn ? calculateCompatibilityScore(state.currentUser, profile) : 0;
    
    // Blur logic for non-logged in users
    const blurClass = (!isLoggedIn && isLanding) ? "guest-blur" : "";
    
    card.innerHTML = `
        <div class="card-img-wrapper ${blurClass}">
            <img src="${profile.image}" alt="${profile.name}">
            <span class="card-badge">${profile.religion}</span>
            ${isLoggedIn ? `<span class="compatibility-badge">${score}% Match</span>` : ""}
        </div>
        <div class="card-body ${blurClass}">
            <h4 class="profile-name">${profile.name}</h4>
            <p class="profile-summary-text">${profile.age} yrs • ${profile.height} • ${profile.location}</p>
            <ul class="profile-snippet-list">
                <li>${profile.occupation}</li>
                <li>${profile.mothertongue}</li>
                <li>${profile.education.split(" ")[0]}</li>
            </ul>
            <div class="card-actions">
                <button class="btn btn-primary btn-block" onclick="viewProfileDetail('${profile.id}')">View Details</button>
            </div>
        </div>
    `;
    
    // Add Blur Overlay for Guests on Landing page
    if (!isLoggedIn && isLanding) {
        const overlay = document.createElement("div");
        overlay.className = "blur-overlay";
        overlay.innerHTML = `
            <h4>Premium Profile</h4>
            <p>Login or Register Free to see name, matching percentage, and photos.</p>
            <button class="btn btn-outline" onclick="switchView('auth', 'register')">Register Free</button>
        `;
        card.appendChild(overlay);
    }
    
    return card;
}

// 8. AUTHENTICATION CONTROLLERS
function setAuthTab(tab) {
    const tabLogin = document.getElementById("tab-btn-login");
    const tabReg = document.getElementById("tab-btn-register");
    const panelLogin = document.getElementById("login-form-panel");
    const panelReg = document.getElementById("register-form-panel");
    
    if (tab === "login") {
        tabLogin.classList.add("active");
        tabReg.classList.remove("active");
        panelLogin.classList.remove("hidden");
        panelReg.classList.add("hidden");
    } else {
        tabLogin.classList.remove("active");
        tabReg.classList.add("active");
        panelLogin.classList.add("hidden");
        panelReg.classList.remove("hidden");
        // Reset steps slider to Step 1
        nextRegisterStep(1);
    }
}

// Multi-step Registration logic
function nextRegisterStep(step) {
    // Hide all step slides
    document.querySelectorAll(".register-step-slide").forEach(slide => slide.classList.add("hidden"));
    
    // Show target slide
    document.getElementById(`register-slide-${step}`).classList.remove("hidden");
    
    // Update step Indicators
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`indicator-step-${i}`);
        const line = document.getElementById(`line-step-${i}`);
        
        if (i < step) {
            ind.className = "step-indicator completed";
            if (line) line.className = "step-line completed";
        } else if (i === step) {
            ind.className = "step-indicator active";
            if (line) line.className = "step-line";
        } else {
            ind.className = "step-indicator";
            if (line) line.className = "step-line";
        }
    }
}

function prevRegisterStep(step) {
    nextRegisterStep(step);
}

// Handle Form Submission: Login
function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    
    if (isBackendEnabled) {
        handleLoginSubmitSupabase(email, password);
        return;
    }
    
    if (email === "admin@westmatrimony.com" && password === "admin123") {
        state.currentUser = {
            name: "Administrator",
            gender: "male",
            isAdmin: true,
            email: email,
            location: "Mumbai",
            prefLocation: "Mumbai",
            prefAgeMin: 18,
            prefAgeMax: 70
        };
        localStorage.setItem("wm_current_user", JSON.stringify(state.currentUser));
        updateHeaderAuthDOM();
        renderFeaturedProfiles();
        showToast("Logged in as Administrator.", "success");
        switchView("admin");
    } else if (email === "user@example.com" && password === "password123") {
        state.currentUser = { ...DEFAULT_USER, isAdmin: false };
        localStorage.setItem("wm_current_user", JSON.stringify(state.currentUser));
        updateHeaderAuthDOM();
        
        // Re-render featured matching scores now that we are logged in
        renderFeaturedProfiles();
        
        showToast("Logged in successfully. Welcome back!", "success");
        switchView("dashboard");
    } else {
        showToast("Invalid email or password. Use demo details.", "danger");
    }
}

// Handle Form Submission: Register
function handleRegisterSubmit(event) {
    event.preventDefault();
    
    // Basic verification of fields in Slide 3
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;
    
    if (!email || !password) {
        showToast("Please fill in email and password.", "danger");
        return;
    }
    
    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "danger");
        return;
    }
    
    // Gather details from previous slides
    const name = document.getElementById("reg-name").value || "New Member";
    const gender = document.getElementById("reg-gender").value;
    const dob = document.getElementById("reg-dob").value;
    const mothertongue = document.getElementById("reg-mothertongue").value;
    const religion = document.getElementById("reg-religion").value;
    
    let star = "None";
    if (religion === "Hindu") {
        star = document.getElementById("reg-star").value || "None";
    }
    
    let education = document.getElementById("reg-education").value;
    if (education === "Others") {
        education = document.getElementById("reg-education-custom").value.trim() || "Others";
    }
    
    let occupation = document.getElementById("reg-profession").value;
    if (occupation === "Others") {
        occupation = document.getElementById("reg-profession-custom").value.trim() || "Others";
    }
    
    const income = document.getElementById("reg-income").value;
    
    let location = document.getElementById("reg-location").value;
    if (location === "Others") {
        location = document.getElementById("reg-location-custom").value.trim() || "Others";
    }
    
    // Build user object
    const newUser = {
        name: name,
        gender: gender,
        age: dob ? calculateAgeFromDOB(dob) : 26,
        height: gender === "male" ? "5 ft 8 in" : "5 ft 3 in",
        religion: religion,
        caste: "General",
        star: star,
        mothertongue: mothertongue,
        education: education,
        occupation: occupation,
        income: income,
        location: location,
        about: `Hi, I am ${name}. A professional based in ${location}. I joined West Matrimony to find a compatible companion.`,
        prefAgeMin: gender === "male" ? 22 : 25,
        prefAgeMax: gender === "male" ? 28 : 32,
        prefReligion: religion,
        prefLocation: location,
        image: gender === "male" ? "assets/images/profile_male_1.png" : "assets/images/profile_female_1.png"
    };
    
    if (isBackendEnabled) {
        handleRegisterSubmitSupabase(newUser, email, password);
        return;
    }
    
    state.currentUser = newUser;
    localStorage.setItem("wm_current_user", JSON.stringify(state.currentUser));
    updateHeaderAuthDOM();
    renderFeaturedProfiles();
    
    showToast("Registration completed! Profile created.", "success");
    switchView("dashboard");
}

// Helper to calculate age from DOB
function calculateAgeFromDOB(dobString) {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Handle Logout
function handleLogout() {
    if (isBackendEnabled) {
        supabaseClient.auth.signOut();
        if (realtimeChannel) {
            supabaseClient.removeChannel(realtimeChannel);
            realtimeChannel = null;
        }
    }
    state.currentUser = null;
    state.activeView = "landing";
    localStorage.removeItem("wm_current_user");
    updateHeaderAuthDOM();
    renderFeaturedProfiles();
    
    showToast("Successfully logged out.", "info");
    switchView("landing");
}

// 9. CLIENT DASHBOARD CONTROLLER
function renderDashboard() {
    if (!state.currentUser) return;
    
    // Update dashboard labels
    document.getElementById("dash-user-firstname").textContent = state.currentUser.name.split(" ")[0];
    document.getElementById("dash-my-name").textContent = state.currentUser.name;
    document.getElementById("dash-shortlist-count").textContent = state.shortlist.length;
    
    // Render My Profile summary image in sidebar
    if (state.currentUser.gender === "female") {
        document.getElementById("dash-my-avatar").src = "assets/images/profile_female_1.png";
    } else {
        document.getElementById("dash-my-avatar").src = "assets/images/profile_male_1.png";
    }
    
    // Find recommendations: filter opposite gender
    const recommendationsContainer = document.getElementById("dash-recommendations-container");
    if (!recommendationsContainer) return;
    
    recommendationsContainer.innerHTML = "";
    
    const oppositeGender = state.currentUser.gender === "male" ? "female" : "male";
    const matches = state.profiles.filter(p => p.gender === oppositeGender);
    
    if (matches.length === 0) {
        recommendationsContainer.innerHTML = `<p>No recommendations matches found matching preference details.</p>`;
    } else {
        matches.forEach(profile => {
            const card = document.createElement("div");
            card.className = "profile-card";
            
            const score = calculateCompatibilityScore(state.currentUser, profile);
            
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${profile.image}" alt="${profile.name}">
                    <span class="card-badge">${profile.religion}</span>
                    <span class="compatibility-badge">${score}% Match</span>
                </div>
                <div class="card-body">
                    <h4 class="profile-name">${profile.name}</h4>
                    <p class="profile-summary-text">${profile.age} yrs • ${profile.location}</p>
                    <ul class="profile-snippet-list">
                        <li>${profile.occupation}</li>
                        <li>${profile.mothertongue}</li>
                    </ul>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-block" onclick="viewProfileDetail('${profile.id}')">View Details</button>
                    </div>
                </div>
            `;
            recommendationsContainer.appendChild(card);
        });
    }
}

// 10. ADVANCED SEARCH & LIVE FILTER ENGINE
function resetFilters() {
    const oppGender = state.currentUser ? (state.currentUser.gender === "male" ? "female" : "male") : "all";
    
    document.getElementById("filter-gender").value = oppGender;
    document.getElementById("filter-age-min").value = "20";
    document.getElementById("filter-age-max").value = "32";
    document.getElementById("filter-religion").value = "all";
    document.getElementById("filter-location").value = "all";
    document.getElementById("filter-profession").value = "all";
    document.getElementById("filter-mothertongue").value = "all";
    document.getElementById("search-keyword").value = "";
}

function applyFilters() {
    const gender = document.getElementById("filter-gender").value;
    const ageMin = parseInt(document.getElementById("filter-age-min").value);
    const ageMax = parseInt(document.getElementById("filter-age-max").value);
    const religion = document.getElementById("filter-religion").value;
    const location = document.getElementById("filter-location").value;
    const profession = document.getElementById("filter-profession").value;
    const mothertongue = document.getElementById("filter-mothertongue").value;
    const keyword = document.getElementById("search-keyword").value.toLowerCase();
    
    let filtered = state.profiles;
    
    // Filter by looking for gender
    if (gender !== "all") {
        filtered = filtered.filter(p => p.gender === gender);
    }
    
    // Filter age min/max
    filtered = filtered.filter(p => p.age >= ageMin && p.age <= ageMax);
    
    // Filter religion
    if (religion !== "all") {
        filtered = filtered.filter(p => p.religion === religion);
    }
    
    // Filter location
    if (location !== "all") {
        filtered = filtered.filter(p => p.location === location);
    }
    
    // Filter profession
    if (profession !== "all") {
        filtered = filtered.filter(p => p.occupation === profession);
    }
    
    // Filter mother tongue
    if (mothertongue !== "all") {
        filtered = filtered.filter(p => p.mothertongue === mothertongue);
    }
    
    // Filter keyword text search
    if (keyword.trim() !== "") {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(keyword) ||
            p.occupation.toLowerCase().includes(keyword) ||
            p.location.toLowerCase().includes(keyword) ||
            p.religion.toLowerCase().includes(keyword) ||
            p.caste.toLowerCase().includes(keyword) ||
            p.education.toLowerCase().includes(keyword)
        );
    }
    
    // Render profiles count and grid results
    const resultsCountEl = document.getElementById("browse-results-count");
    resultsCountEl.textContent = `Showing ${filtered.length} matching profile${filtered.length === 1 ? '' : 's'}`;
    
    const grid = document.getElementById("browse-profiles-grid");
    if (!grid) return;
    grid.innerHTML = "";
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 40px 0;">
                <div class="empty-icon">🔍</div>
                <h3>No results match your criteria</h3>
                <p>Try widening your filtering parameters or resetting filters.</p>
            </div>
        `;
    } else {
        filtered.forEach(profile => {
            const card = createProfileCardDOM(profile, false);
            grid.appendChild(card);
        });
    }
}

// Handle Hero quick search form on landing page
function handleQuickSearch(event) {
    event.preventDefault();
    const gender = document.getElementById("search-gender").value;
    const ageMin = document.getElementById("search-age-min").value;
    const ageMax = document.getElementById("search-age-max").value;
    const religion = document.getElementById("search-religion").value;
    const location = document.getElementById("search-location").value;
    
    // Navigate to Browse view and set filters
    switchView("browse");
    
    document.getElementById("filter-gender").value = gender;
    document.getElementById("filter-age-min").value = ageMin;
    document.getElementById("filter-age-max").value = ageMax;
    document.getElementById("filter-religion").value = religion;
    document.getElementById("filter-location").value = location;
    
    applyFilters();
}

// 11. PROFILE DETAIL VIEW SYSTEM
function viewProfileDetail(profileId) {
    if (!state.currentUser) {
        switchView("auth", "login");
        showToast("Please login to see complete profile details.", "info");
        return;
    }
    
    const profile = state.profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    state.activeProfileDetail = profileId;
    switchView("detail");
    
    // Fill left card photo & status details
    document.getElementById("detail-profile-img").src = profile.image;
    
    // Math Compatibility Gauge
    const score = calculateCompatibilityScore(state.currentUser, profile);
    document.getElementById("detail-compatibility-text").textContent = `${score}%`;
    const circlePath = document.getElementById("detail-compatibility-path");
    // stroke-dasharray="85, 100" (circumference of 100)
    circlePath.setAttribute("stroke-dasharray", `${score}, 100`);
    
    // Configure buttons state
    const shortlistBtn = document.getElementById("btn-detail-shortlist");
    const isShortlisted = state.shortlist.includes(profileId);
    if (isShortlisted) {
        shortlistBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2" class="heart-icon active">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Shortlisted
        `;
    } else {
        shortlistBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" class="heart-icon">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Shortlist
        `;
    }
    
    const connectBtn = document.getElementById("btn-detail-connect");
    const isInterested = state.sentInterests.includes(profileId);
    if (isInterested) {
        connectBtn.textContent = "Connection Interest Sent";
        connectBtn.disabled = true;
        connectBtn.className = "btn btn-outline btn-block";
    } else {
        connectBtn.textContent = "Send Connection Interest";
        connectBtn.disabled = false;
        connectBtn.className = "btn btn-primary btn-block";
    }
    
    // Highlight about tab panel by default on load
    setProfileTab("about");
    
    // Reset language switcher state to English by default
    state.detailLanguage = "en";
    updateLanguageButtonsDOM("en");
    
    // Render profile details in selected language
    renderProfileDetailContent(profile, "en");
}

function changeDetailLanguage(lang) {
    if (!state.activeProfileDetail) return;
    const profile = state.profiles.find(p => p.id === state.activeProfileDetail);
    if (!profile) return;
    
    state.detailLanguage = lang;
    updateLanguageButtonsDOM(lang);
    renderProfileDetailContent(profile, lang);
}

function updateLanguageButtonsDOM(lang) {
    const btnEn = document.getElementById("lang-btn-en");
    const btnMl = document.getElementById("lang-btn-ml");
    if (!btnEn || !btnMl) return;
    
    if (lang === 'en') {
        btnEn.style.background = 'var(--primary)';
        btnEn.style.color = 'white';
        btnEn.style.borderColor = 'var(--primary)';
        btnEn.classList.add("active");
        
        btnMl.style.background = 'transparent';
        btnMl.style.color = 'var(--text-dark)';
        btnMl.style.borderColor = 'var(--border)';
        btnMl.classList.remove("active");
    } else {
        btnMl.style.background = 'var(--primary)';
        btnMl.style.color = 'white';
        btnMl.style.borderColor = 'var(--primary)';
        btnMl.classList.add("active");
        
        btnEn.style.background = 'transparent';
        btnEn.style.color = 'var(--text-dark)';
        btnEn.style.borderColor = 'var(--border)';
        btnEn.classList.remove("active");
    }
}

// English to Malayalam Translation Mappings
const ML_TRANSLATION_MAP = {
    // English Values -> Malayalam Values
    "Software Engineer": "സോഫ്റ്റ്‌വെയർ എഞ്ചിനീയർ",
    "Doctor": "ഡോക്ടർ",
    "Banker": "ബാങ്കർ",
    "UI/UX Designer": "ഡിസൈനർ",
    "Civil Servant": "സിവിൽ സെർവന്റ്",
    "Business Owner": "ബിസിനസുകാരൻ",
    "Senior Software Developer": "സീനിയർ സോഫ്റ്റ്‌വെയർ ഡെവലപ്പർ",
    "IT Professional, Doctor, or Engineer": "ഐ.ടി രംഗം, ഡോക്ടർ, അല്ലെങ്കിൽ എഞ്ചിനീയർ",
    "Finance, Banking or IT Analyst": "ഫിനാൻസ്, ബാങ്കിംഗ് അല്ലെങ്കിൽ ഐ.ടി അനലിസ്റ്റ്",
    "Creative or Tech Professional": "ക്രിയേറ്റീവ് അല്ലെങ്കിൽ ടെക് പ്രൊഫഷണൽ",
    "IT Professional or Doctor": "ഐ.ടി ഉദ്യോഗസ്ഥൻ അല്ലെങ്കിൽ ഡോക്ടർ",
    
    "Never Married": "അവിവാഹിതൻ / അവിവാഹിത",
    
    "Christian": "ക്രിസ്ത്യൻ",
    "Hindu": "ഹിന്ദു",
    "Muslim": "മുസ്ലിം",
    "Syrian Orthodox": "സിറിയൻ ഓർത്തഡോക്സ്",
    "Tamil Brahmin": "തമിഴ് ബ്രാഹ്മണൻ",
    "Brahmin": "ബ്രാഹ്മണൻ",
    "Patel": "പട്ടേൽ",
    
    "Malayalam": "മലയാളം",
    "Hindi": "ഹിന്ദി",
    "Tamil": "തമിഴ്",
    "Telugu": "തെലുങ്ക്",
    "English": "ഇംഗ്ലീഷ്",
    
    "Kochi": "കൊച്ചി",
    "Trivandrum": "തിരുവനന്തപുരം",
    "Kozhikode": "കോഴിക്കോട്",
    "Thrissur": "തൃശ്ശൂർ",
    "Kollam": "കൊല്ലം",
    "Alappuzha": "ആലപ്പുഴ",
    "Palakkad": "പാലക്കാട്",
    "Kottayam": "കോട്ടയം",
    "Kannur": "കണ്ണൂർ",
    "Bangalore": "ബാംഗ്ലൂർ",
    "Mumbai": "മുംബൈ",
    "Chennai": "ചെന്നൈ",
    
    "Non-Vegetarian": "മാംസാഹാരി",
    "Vegetarian": "സസ്യഹാരി",
    "No / No": "ഇല്ല / ഇല്ല",
    
    "Moderate": "മധ്യമ നിലപാട്",
    "Traditional": "പരമ്പരാഗതം",
    "Liberal": "സ്വതന്ത്ര ചിന്താഗതി",
    
    "Nuclear Family": "ചെറിയ കുടുംബം",
    "Joint Family": "കൂട്ടുകുടുംബം",
    
    "Retired Government Officer": "റിട്ടയേർഡ് സർക്കാർ ഉദ്യോഗസ്ഥൻ",
    "High School Teacher": "ഹൈസ്കൂൾ അധ്യാപിക",
    "Homemaker": "വീട്ടമ്മ",
    "Senior Advocate": "സീനിയർ അഡ്വക്കേറ്റ്",
    "Carnatic Vocalist": "കർണാടക സംഗീതജ്ഞ",
    "Chartered Accountant": "ചാർട്ടേഡ് അക്കൗണ്ടന്റ്",
    "Interior Designer": "ഇന്റീരിയർ ഡിസൈനർ",
    
    "None": "ഇല്ല",
    "0": "ഇല്ല",
    "1": "1",
    "2": "2",
    "1 (Married)": "1 (വിവാഹിതൻ)",
    "Graduate or Post Graduate": "ബിരുദം അല്ലെങ്കിൽ ബിരുദാനന്തര ബിരുദം",
    "Graduate Professional": "ബിരുദധാരിയായ ഉദ്യോഗസ്ഥൻ",
    
    // Stars / Nakshatrams
    "Aswathy": "അശ്വതി",
    "Bharani": "ഭരണി",
    "Karthika": "കാർത്തിക",
    "Rohini": "രോഹിണി",
    "Makayiram": "മകയിരം",
    "Thiruvathira": "തിരുവാതിര",
    "Punartham": "പുണർതം",
    "Pooyam": "പൂയം",
    "Ayilyam": "ആയില്യം",
    "Makham": "മകം",
    "Pooram": "പൂരം",
    "Uthram": "ഉത്രം",
    "Atham": "അത്തം",
    "Chithira": "ചിത്ര",
    "Chothi": "ചോതി",
    "Vishakham": "വിശാഖം",
    "Anizham": "അനിഴം",
    "Thrikketa": "തൃക്കേട്ട",
    "Moolam": "മൂലം",
    "Pooradam": "പൂരാടം",
    "Uthradam": "ഉത്രാടം",
    "Thiruvonam": "തിരുവോണം",
    "Avittam": "അവിട്ടം",
    "Chathayam": "ചതയം",
    "Pooruruttathy": "പൂരുരുട്ടാതി",
    "Uthruttathy": "ഉത്രട്ടാതി",
    "Revathy": "രേവതി"
};

const ML_MOCK_PROFILES_ABOUT = {
    "WM-10294": "പരമ്പരാഗത മൂല്യങ്ങളും ആധുനിക വീക്ഷണങ്ങളും ഒത്തുപോകുന്ന സന്തുഷ്ടയായ, ഔദ്യോഗിക രംഗത്ത് ശ്രദ്ധ കേന്ദ്രീകരിക്കുന്ന ഒരു വ്യക്തിയാണ് അവൾ. വാരാന്ത്യങ്ങളിൽ സംഗീതം കേൾക്കാനും യാത്ര ചെയ്യാനും പുതിയ വിഭവങ്ങൾ പരീക്ഷിക്കാനും അവൾ ഇഷ്ടപ്പെടുന്നു.",
    "WM-28190": "പരസ്പര ബഹുമാനത്തിലും വ്യക്തമായ ആശയവിനിമയത്തിലും വിശ്വസിക്കുന്ന ലളിതവും വിനയമുള്ളതുമായ ഒരു വ്യക്തി. ഫിൻടെക് ട്രെൻഡുകൾ പഠിക്കാനും, ചരിത്ര നോവലുകൾ വായിക്കാനും, പശ്ചിമഘട്ടത്തിൽ ട്രെക്കിംഗ് നടത്താനും ഞാൻ ഇഷ്ടപ്പെടുന്നു.",
    "WM-40192": "ദൃശ്യകലകളും ശാസ്ത്രീയ സംഗീതവും പൈതൃക സ്ഥലങ്ങൾ സന്ദർശിക്കുന്നതും ഇഷ്ടപ്പെടുന്ന സർഗ്ഗാത്മകമായ ഒരു മനസ്സ്. സ്വന്തം ജോലിയോട് താല്പര്യമുള്ളവനും കലയെയും സംസ്കാരത്തെയും വിലമതിക്കുന്നതുമായ ഒരു പങ്കാളിയെ തിരയുന്നു.",
    "WM-89102": "തിരക്കേറിയ ഔദ്യോഗിക ജീവിതവും സ്ക്വാഷ്, പുതിയ പാചക പരീക്ഷണങ്ങൾ, സന്നദ്ധസേവനം തുടങ്ങിയ ഹോബികളും ഒരേപോലെ കൊണ്ടുപോകുന്ന അഭിലാഷിയായ ഒരു ബാങ്കർ. സ്വതന്ത്രയും കുടുംബത്തിന് പ്രാധാന്യം നൽകുന്നതുമായ പങ്കാളിയെ തിരയുന്നു."
};

function renderProfileDetailContent(profile, lang) {
    const isEn = lang === 'en';
    
    // Helper to translate value
    const t = (val) => {
        if (!val) return "";
        if (isEn) return val;
        const strVal = String(val).trim();
        if (ML_TRANSLATION_MAP[strVal]) return ML_TRANSLATION_MAP[strVal];
        
        let res = strVal;
        res = res.replace(" Years", " വർഷം");
        res = res.replace(" Years Range", " വർഷം");
        res = res.replace(" (Married)", " (വിവാഹിതൻ/വിവാഹിത)");
        res = res.replace(" (Unmarried)", " (അവിവാഹിതൻ/അവിവാഹിത)");
        res = res.replace("Never Married", "അവിവാഹിതൻ / അവിവാഹിത");
        res = res.replace("None", "ഇല്ല");
        res = res.replace(", India", ", ഇന്ത്യ");
        
        // Loop over vocabulary to translate occurrences
        for (let eng in ML_TRANSLATION_MAP) {
            if (eng.length > 3 && res.includes(eng)) {
                res = res.replace(eng, ML_TRANSLATION_MAP[eng]);
            }
        }
        return res;
    };
    
    // Helper to translate static labels
    const setLabel = (id, enText, mlText) => {
        const el = document.getElementById(id);
        if (el) el.textContent = isEn ? enText : mlText;
    };
    
    const isFemale = profile.gender === 'female';
    
    setLabel("lbl-detail-about-title", isFemale ? "About Her" : "About Him", isFemale ? "അവളെക്കുറിച്ച്" : "അവനെക്കുറിച്ച്");
    setLabel("lbl-detail-basic-title", "Basic Information", "അടിസ്ഥാന വിവരങ്ങൾ");
    setLabel("lbl-detail-age", "Age", "വയസ്സ്");
    setLabel("lbl-detail-height", "Height", "ഉയരം");
    setLabel("lbl-detail-mothertongue", "Mother Tongue", "മാതൃഭാഷ");
    setLabel("lbl-detail-marital", "Marital Status", "വിവാഹ നില");
    setLabel("lbl-detail-religion", "Religion", "മതം");
    setLabel("lbl-detail-caste", "Caste / Sect", "ജാതി");
    
    setLabel("lbl-detail-edu-title", "Educational Background", "വിദ്യാഭ്യാസം");
    setLabel("lbl-detail-education", "Highest Education", "വിദ്യാഭ്യാസം");
    setLabel("lbl-detail-college", "University / College", "കോളേജ് / സർവ്വകലാശാല");
    
    setLabel("lbl-detail-career-title", "Professional Background", "ഔദ്യോഗിക വിവരങ്ങൾ");
    setLabel("lbl-detail-occupation", "Occupation", "ജോലി");
    setLabel("lbl-detail-employer", "Employed In", "സ്ഥാപനം");
    setLabel("lbl-detail-income", "Annual Income", "വാർഷിക വരുമാനം");
    setLabel("lbl-detail-work-location", "Work Location", "ജോലിസ്ഥലം");
    
    setLabel("lbl-detail-family-title", "Family Background", "കുടുംബ വിവരങ്ങൾ");
    setLabel("lbl-detail-family-values", "Family Values", "കുടുംബ മഹിമ");
    setLabel("lbl-detail-family-type", "Family Type", "കുടുംബ രീതി");
    setLabel("lbl-detail-father", "Father's Profession", "അച്ഛന്റെ ജോലി");
    setLabel("lbl-detail-mother", "Mother's Profession", "അമ്മയുടെ ജോലി");
    setLabel("lbl-detail-brothers", "Brothers", "സহോദരന്മാർ");
    setLabel("lbl-detail-sisters", "Sisters", "സഹോദരിമാർ");
    
    setLabel("lbl-detail-lifestyle-title", "Lifestyle Details", "ജീവിത രീതി");
    setLabel("lbl-detail-diet", "Dietary Habits", "ഭക്ഷണരീതി");
    setLabel("lbl-detail-lifestyle", "Drinking / Smoking", "ശീലങ്ങൾ");
    
    setLabel("lbl-detail-pref-title", "Partner Expectations", "പങ്കാളിയുടെ വിവരങ്ങൾ");
    setLabel("lbl-detail-pref-sub", 
             isFemale ? "What she is looking for in a partner:" : "What he is looking for in a partner:", 
             isFemale ? "ആഗ്രഹിക്കുന്ന പങ്കാളിയുടെ വിവരങ്ങൾ:" : "ആഗ്രഹിക്കുന്ന പങ്കാളിയുടെ വിവരങ്ങൾ:");
    setLabel("lbl-detail-pref-age", "Age Range", "വയസ്സ് പരിധി");
    setLabel("lbl-detail-pref-height", "Min Height", "ഉയര പരിധി");
    setLabel("lbl-detail-pref-religion", "Religion", "മതവും ജാതിയും");
    setLabel("lbl-detail-pref-education", "Education", "വിദ്യാഭ്യാസം");
    setLabel("lbl-detail-pref-profession", "Occupation", "ജോലി");
    setLabel("lbl-detail-pref-location", "Location Pref", "സ്ഥലം");
    
    // Fill dynamic content
    document.getElementById("detail-about-text").textContent = !isEn && ML_MOCK_PROFILES_ABOUT[profile.id] ? ML_MOCK_PROFILES_ABOUT[profile.id] : profile.about;
    document.getElementById("detail-fullname").textContent = profile.name;
    document.getElementById("detail-primary-occupation").textContent = t(profile.occupation);
    document.getElementById("detail-primary-city").textContent = `${t(profile.location)}, ${isEn ? "India" : "ഇന്ത്യ"}`;
    document.getElementById("detail-profile-id").textContent = `ID: ${profile.id}`;
    
    document.getElementById("detail-age").textContent = `${profile.age}${isEn ? " Years" : " വർഷം"}`;
    document.getElementById("detail-height").textContent = profile.height;
    document.getElementById("detail-mothertongue").textContent = t(profile.mothertongue);
    document.getElementById("detail-marital").textContent = isEn ? "Never Married" : "അവിവാഹിതൻ / അവിവാഹിത";
    document.getElementById("detail-religion").textContent = t(profile.religion);
    document.getElementById("detail-caste").textContent = t(profile.caste);
    
    // Display Hindu Star (Naal) if religion is Hindu and star is set
    const starItem = document.getElementById("detail-star-item");
    if (starItem) {
        if (profile.religion === "Hindu" && profile.star && profile.star !== "None") {
            starItem.classList.remove("hidden");
            document.getElementById("detail-star").textContent = t(profile.star);
            setLabel("lbl-detail-star", "Star (Naal)", "നക്ഷത്രം (നാൾ)");
        } else {
            starItem.classList.add("hidden");
        }
    }
    
    document.getElementById("detail-education").textContent = t(profile.education);
    document.getElementById("detail-college").textContent = t(profile.college);
    document.getElementById("detail-occupation").textContent = t(profile.occupation);
    document.getElementById("detail-employer").textContent = t(profile.employer);
    document.getElementById("detail-income").textContent = t(profile.income);
    document.getElementById("detail-work-location").textContent = `${t(profile.location)}, ${isEn ? "India" : "ഇന്ത്യ"}`;
    
    document.getElementById("detail-family-values").textContent = t(profile.familyValues);
    document.getElementById("detail-family-type").textContent = t(profile.familyType);
    document.getElementById("detail-father").textContent = t(profile.father);
    document.getElementById("detail-mother").textContent = t(profile.mother);
    document.getElementById("detail-brothers").textContent = t(String(profile.brothers));
    document.getElementById("detail-sisters").textContent = t(String(profile.sisters));
    document.getElementById("detail-diet").textContent = t(profile.diet);
    document.getElementById("detail-lifestyle").textContent = t(profile.lifestyle);
    
    document.getElementById("detail-pref-age").textContent = `${profile.prefAgeMin} - ${profile.prefAgeMax}${isEn ? " Years" : " വർഷം"}`;
    document.getElementById("detail-pref-height").textContent = profile.prefHeight;
    document.getElementById("detail-pref-religion").textContent = `${t(profile.prefReligion)} (${t(profile.caste)})`;
    document.getElementById("detail-pref-education").textContent = isEn ? "Graduate or Post Graduate" : "ബിരുദം അല്ലെങ്കിൽ ബിരുദാനന്തര ബിരുദം";
    document.getElementById("detail-pref-profession").textContent = t(profile.prefOccupation);
    document.getElementById("detail-pref-location").textContent = t(profile.prefLocation);
    
    // Render phone
    const phoneVal = profile.phone || (isEn ? "Not Provided" : "ലഭ്യമല്ല");
    document.getElementById("detail-phone").textContent = phoneVal;
    
    // Toggle Admin Edit vs User Actions
    const isAdmin = state.currentUser && state.currentUser.isAdmin;
    const btnConnect = document.getElementById("btn-detail-connect");
    const dualActions = document.getElementById("detail-user-actions-dual");
    const adminActionGroup = document.getElementById("admin-action-buttons-group");
    
    if (isAdmin) {
        if (btnConnect) btnConnect.style.display = "none";
        if (dualActions) dualActions.style.display = "none";
        if (adminActionGroup) adminActionGroup.style.display = "flex";
    } else {
        if (btnConnect) btnConnect.style.display = "block";
        if (dualActions) dualActions.style.display = "flex";
        if (adminActionGroup) adminActionGroup.style.display = "none";
    }
}

function setProfileTab(tabName) {
    state.activeProfileTab = tabName;
    
    // Highlight tab headers
    const tabs = document.querySelectorAll(".profile-tab-btn");
    tabs.forEach(tab => tab.classList.remove("active"));
    document.getElementById(`p-tab-btn-${tabName}`).classList.add("active");
    
    // Show active panel
    document.querySelectorAll(".profile-panel").forEach(p => p.classList.add("hidden"));
    document.getElementById(`p-panel-${tabName}`).classList.remove("hidden");
}

function goBackToMatches() {
    switchView("browse");
}

// 12. COMPATIBILITY ALGORITHM
function calculateCompatibilityScore(user, partner) {
    if (!user || !partner) return 80; // Default fallback score
    
    let score = 50; // Starting baseline
    
    // 1. Gender Match Check (Safety guard)
    if (user.gender === partner.gender) return 20; 
    
    // 2. Religion Match (Weighted heavily: 20 pts)
    if (user.religion === partner.religion) {
        score += 20;
    } else if (user.prefReligion === "all" || partner.prefReligion === "all") {
        score += 10;
    }
    
    // 3. Location Match (Weighted: 15 pts)
    if (user.location === partner.location) {
        score += 15;
    } else if (user.prefLocation.includes(partner.location) || partner.prefLocation.includes(user.location)) {
        score += 10;
    }
    
    // 4. Age Compatibility (Weighted: 15 pts)
    if (partner.age >= user.prefAgeMin && partner.age <= user.prefAgeMax) {
        score += 15;
    } else {
        const diff = Math.abs(partner.age - ((user.prefAgeMin + user.prefAgeMax)/2));
        if (diff < 5) score += 7;
    }
    
    // 5. Mother tongue (Weighted: 10 pts)
    if (user.mothertongue === partner.mothertongue) {
        score += 10;
    }
    
    return Math.min(score, 98); // Max compatibility 98% (nobody is 100% perfect!)
}

// 13. CONNECTION INTERACTIONS (SHORTLIST & CONNECT)
function handleDetailShortlist() {
    const profileId = state.activeProfileDetail;
    if (!profileId) return;
    
    const profile = state.profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    const index = state.shortlist.indexOf(profileId);
    const shortlistBtn = document.getElementById("btn-detail-shortlist");
    
    if (index > -1) {
        // Remove from shortlist
        state.shortlist.splice(index, 1);
        shortlistBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" class="heart-icon">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Shortlist
        `;
        showToast(`Removed ${profile.name} from shortlist.`, "info");
        
        if (isBackendEnabled && state.currentUser) {
            supabaseClient
                .from('shortlists')
                .delete()
                .eq('user_id', state.currentUser.id)
                .eq('profile_id', profileId)
                .then(({error}) => { if (error) console.error("Supabase shortlist delete failure:", error); });
        }
    } else {
        // Add to shortlist
        state.shortlist.push(profileId);
        shortlistBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2" class="heart-icon active">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Shortlisted
        `;
        showToast(`Added ${profile.name} to shortlist!`, "success");
        
        if (isBackendEnabled && state.currentUser) {
            supabaseClient
                .from('shortlists')
                .insert({
                    user_id: state.currentUser.id,
                    profile_id: profileId
                })
                .then(({error}) => { if (error) console.error("Supabase shortlist insert failure:", error); });
        }
    }
    
    localStorage.setItem("wm_shortlist", JSON.stringify(state.shortlist));
}

function handleDetailConnect() {
    const profileId = state.activeProfileDetail;
    if (!profileId) return;
    
    const profile = state.profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    if (state.sentInterests.includes(profileId)) return;
    
    state.sentInterests.push(profileId);
    localStorage.setItem("wm_interests", JSON.stringify(state.sentInterests));
    
    const connectBtn = document.getElementById("btn-detail-connect");
    connectBtn.textContent = "Connection Interest Sent";
    connectBtn.disabled = true;
    connectBtn.className = "btn btn-outline btn-block";
    
    showToast(`Interest request sent to ${profile.name}!`, "success");
    
    // Automatically trigger chat initialization so they can message them
    if (!state.chats[profileId]) {
        state.chats[profileId] = [];
        localStorage.setItem("wm_chats", JSON.stringify(state.chats));
    }
    
    if (isBackendEnabled && state.currentUser) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        supabaseClient
            .from('messages')
            .insert({
                sender_id: state.currentUser.id,
                receiver_id: profileId,
                text: `Hi, I am interested in matching with you. Let's connect!`,
                time: timeStr
            })
            .then(({error}) => {
                if (error) console.error("Supabase connect message send failure:", error);
                loadChatMessages();
            });
    }
}

// Detail View quick chat toggle
function handleDetailChat() {
    const profileId = state.activeProfileDetail;
    if (!profileId) return;
    
    openQuickChatWidget(profileId);
}

// 14. CONNECTIONS MANAGER VIEWS
function setConnectionTab(tabName) {
    state.activeConnectionTab = tabName;
    
    const btnShortlist = document.getElementById("c-tab-btn-shortlist");
    const btnInterests = document.getElementById("c-tab-btn-interests");
    const btnChats = document.getElementById("c-tab-btn-chats");
    
    btnShortlist.classList.remove("active");
    btnInterests.classList.remove("active");
    btnChats.classList.remove("active");
    
    document.getElementById("c-panel-shortlists").classList.add("hidden");
    document.getElementById("c-panel-interests").classList.add("hidden");
    document.getElementById("c-panel-chats").classList.add("hidden");
    
    if (tabName === "shortlists") {
        btnShortlist.classList.add("active");
        document.getElementById("c-panel-shortlists").classList.remove("hidden");
        renderShortlistsTab();
    } else if (tabName === "interests") {
        btnInterests.classList.add("active");
        document.getElementById("c-panel-interests").classList.remove("hidden");
        renderInterestsTab();
    } else if (tabName === "chats") {
        btnChats.classList.add("active");
        document.getElementById("c-panel-chats").classList.remove("hidden");
        renderChatsTab();
    }
    
    // Sync quantities in connection tab sub headers
    updateConnectionCounts();
}

function updateConnectionCounts() {
    document.getElementById("count-saved-tab").textContent = state.shortlist.length;
    document.getElementById("count-interests-tab").textContent = state.sentInterests.length;
    
    // Number of active chats
    const chatKeys = Object.keys(state.chats);
    document.getElementById("count-chats-tab").textContent = chatKeys.length;
}

// Render Shortlisted Grid
function renderShortlistsTab() {
    const grid = document.getElementById("shortlisted-grid");
    const emptyState = document.getElementById("shortlist-empty");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    if (state.shortlist.length === 0) {
        emptyState.classList.remove("hidden");
        grid.classList.add("hidden");
    } else {
        emptyState.classList.add("hidden");
        grid.classList.remove("hidden");
        
        state.shortlist.forEach(id => {
            const profile = state.profiles.find(p => p.id === id);
            if (profile) {
                const card = createProfileCardDOM(profile, false);
                grid.appendChild(card);
            }
        });
    }
}

// Render Interests Sent Grid
function renderInterestsTab() {
    const grid = document.getElementById("interests-grid");
    const emptyState = document.getElementById("interests-empty");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    if (state.sentInterests.length === 0) {
        emptyState.classList.remove("hidden");
        grid.classList.add("hidden");
    } else {
        emptyState.classList.add("hidden");
        grid.classList.remove("hidden");
        
        state.sentInterests.forEach(id => {
            const profile = state.profiles.find(p => p.id === id);
            if (profile) {
                const card = document.createElement("div");
                card.className = "profile-card";
                card.innerHTML = `
                    <div class="card-img-wrapper">
                        <img src="${profile.image}" alt="${profile.name}">
                        <span class="card-badge">${profile.religion}</span>
                    </div>
                    <div class="card-body">
                        <h4 class="profile-name">${profile.name}</h4>
                        <p class="profile-summary-text">${profile.age} yrs • ${profile.location}</p>
                        <span class="badge badge-success" style="margin-bottom:12px; align-self: flex-start;">Interest Pending</span>
                        <div class="card-actions">
                            <button class="btn btn-outline btn-block" onclick="openQuickChatWidget('${profile.id}')">Send Message</button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            }
        });
    }
}

// Render Chats list and Inbox Layout
function renderChatsTab() {
    const inboxList = document.getElementById("chats-inbox-list");
    if (!inboxList) return;
    
    inboxList.innerHTML = "";
    const activeChatKeys = Object.keys(state.chats);
    
    if (activeChatKeys.length === 0) {
        inboxList.innerHTML = `<div style="padding:20px; text-align:center; font-size:0.9rem; color:var(--text-light)">No active chats. Send a connection interest to start chatting!</div>`;
        document.getElementById("chat-conversation-pane").classList.add("hidden");
        return;
    }
    
    document.getElementById("chat-conversation-pane").classList.remove("hidden");
    
    activeChatKeys.forEach(id => {
        const profile = state.profiles.find(p => p.id === id);
        if (!profile) return;
        
        const history = state.chats[id] || [];
        const lastMsg = history.length > 0 ? history[history.length - 1].text : "Initiate chat session...";
        const lastTime = history.length > 0 ? history[history.length - 1].time : "";
        const activeClass = state.activeChatId === id ? "active" : "";
        
        const item = document.createElement("div");
        item.className = `chat-inbox-item ${activeClass}`;
        item.onclick = () => selectInboxChat(id);
        
        item.innerHTML = `
            <img src="${profile.image}" alt="${profile.name}" class="inbox-avatar">
            <div class="inbox-info">
                <div class="inbox-name-row">
                    <span class="inbox-name">${profile.name.split(" ")[0]}</span>
                    <span class="inbox-time">${lastTime}</span>
                </div>
                <div class="inbox-last-msg">${lastMsg}</div>
            </div>
        `;
        inboxList.appendChild(item);
    });
    
    // Sync current active chat pane content
    if (state.activeChatId) {
        renderActiveChatPane();
    } else {
        document.getElementById("chat-pane-empty-state").classList.remove("hidden");
        document.getElementById("chat-pane-active-state").classList.add("hidden");
    }
}

function selectInboxChat(profileId) {
    state.activeChatId = profileId;
    renderChatsTab(); // Refresh inbox list active styling
}

// Render the actual active messages inside chat manager pane
function renderActiveChatPane() {
    const profile = state.profiles.find(p => p.id === state.activeChatId);
    if (!profile) return;
    
    document.getElementById("chat-pane-empty-state").classList.add("hidden");
    document.getElementById("chat-pane-active-state").classList.remove("hidden");
    
    // Header details
    document.getElementById("chat-pane-avatar").src = profile.image;
    document.getElementById("chat-pane-name").textContent = profile.name;
    
    // Messages scroll
    const messagesContainer = document.getElementById("chat-pane-messages-container");
    messagesContainer.innerHTML = "";
    
    const history = state.chats[state.activeChatId] || [];
    
    if (history.length === 0) {
        messagesContainer.innerHTML = `
            <div style="text-align:center; padding: 20px; font-size:0.85rem; color:var(--text-light)">
                No messages yet. Send a greeting to start chatting with ${profile.name.split(" ")[0]}!
            </div>
        `;
    } else {
        history.forEach(msg => {
            const bubble = document.createElement("div");
            bubble.className = `msg-bubble ${msg.sender === "user" ? "sent" : "received"}`;
            bubble.innerHTML = `
                ${msg.text}
                <span class="msg-meta">${msg.time}</span>
            `;
            messagesContainer.appendChild(bubble);
        });
    }
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle message submission inside Chat Manager
function handleChatSubmit(event) {
    event.preventDefault();
    const inputEl = document.getElementById("chat-message-text");
    const text = inputEl.value.trim();
    if (!text || !state.activeChatId) return;
    
    appendChatMessage(state.activeChatId, "user", text);
    inputEl.value = "";
    
    renderActiveChatPane();
    renderChatsTab(); // update last message in sidebar inbox
    
    // Bot automated trigger reply simulation - only in offline mock mode
    if (!isBackendEnabled) {
        simulateBotReply(state.activeChatId, false);
    }
}

// 15. FLOATING QUICK CHAT WIDGET
function openQuickChatWidget(profileId) {
    const profile = state.profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    // Make sure they have a chat record
    if (!state.chats[profileId]) {
        state.chats[profileId] = [];
        localStorage.setItem("wm_chats", JSON.stringify(state.chats));
    }
    
    state.activeChatId = profileId;
    
    const widget = document.getElementById("quick-chat-widget");
    widget.classList.remove("hidden");
    
    // Widget Header details
    document.getElementById("widget-chat-avatar").src = profile.image;
    document.getElementById("widget-chat-name").textContent = profile.name.split(" ")[0];
    
    renderWidgetMessages();
}

function renderWidgetMessages() {
    const container = document.getElementById("widget-chat-messages-container");
    container.innerHTML = "";
    
    const history = state.chats[state.activeChatId] || [];
    
    if (history.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 12px; font-size:0.8rem; color:var(--text-light)">Introduce yourself! Say hi.</div>`;
    } else {
        history.forEach(msg => {
            const bubble = document.createElement("div");
            bubble.className = `msg-bubble ${msg.sender === "user" ? "sent" : "received"}`;
            bubble.innerHTML = `
                ${msg.text}
                <span class="msg-meta">${msg.time}</span>
            `;
            container.appendChild(bubble);
        });
    }
    
    container.scrollTop = container.scrollHeight;
}

function handleWidgetChatSubmit(event) {
    event.preventDefault();
    const inputEl = document.getElementById("widget-chat-input-text");
    const text = inputEl.value.trim();
    if (!text || !state.activeChatId) return;
    
    appendChatMessage(state.activeChatId, "user", text);
    inputEl.value = "";
    
    renderWidgetMessages();
    
    // Bot reply - only in offline mock mode
    if (!isBackendEnabled) {
        simulateBotReply(state.activeChatId, true);
    }
}

function closeQuickChatWidget() {
    document.getElementById("quick-chat-widget").classList.add("hidden");
}

function openChatPaneFromWidget() {
    closeQuickChatWidget();
    switchView("connections", "chats");
    selectInboxChat(state.activeChatId);
}

// Helper to add chat message to history
function appendChatMessage(profileId, sender, text) {
    if (!state.chats[profileId]) {
        state.chats[profileId] = [];
    }
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    state.chats[profileId].push({
        sender: sender,
        text: text,
        time: timeStr
    });
    
    localStorage.setItem("wm_chats", JSON.stringify(state.chats));
    
    // Send to Supabase if backend active
    if (isBackendEnabled && sender === "user" && state.currentUser) {
        supabaseClient
            .from('messages')
            .insert({
                sender_id: state.currentUser.id,
                receiver_id: profileId,
                text: text,
                time: timeStr
            })
            .then(({error}) => {
                if (error) console.error("Supabase realtime message insert failure:", error);
            });
    }
}

// Bot reply simulation with a 2 second delay
function simulateBotReply(profileId, isWidget = false) {
    const replies = MOCK_CHAT_BOT_REPLIES[profileId] || ["Hello! Thanks for writing."];
    const history = state.chats[profileId] || [];
    
    // Find how many user messages have been sent to decide which bot index to choose
    const userMsgCount = history.filter(m => m.sender === "user").length;
    const replyIndex = (userMsgCount - 1) % replies.length;
    const replyText = replies[replyIndex];
    
    setTimeout(() => {
        // Double check they didn't close or switch active partner in the meantime
        appendChatMessage(profileId, "partner", replyText);
        
        if (isWidget) {
            if (state.activeChatId === profileId && !document.getElementById("quick-chat-widget").classList.contains("hidden")) {
                renderWidgetMessages();
            }
        } else {
            if (state.activeView === "connections" && state.activeConnectionTab === "chats") {
                renderChatsTab(); // Refresh active chat bubble and inbox time
            }
        }
        
        showToast("You received a new message!", "info");
    }, 2000);
}

// 16. USER PROFILE EDITING SCREEN
function loadMyProfileFormData() {
    if (!state.currentUser) return;
    
    document.getElementById("edit-name").value = state.currentUser.name;
    document.getElementById("edit-mothertongue").value = state.currentUser.mothertongue;
    document.getElementById("edit-religion").value = state.currentUser.religion;
    document.getElementById("edit-caste").value = state.currentUser.caste;
    document.getElementById("edit-age").value = state.currentUser.age;
    document.getElementById("edit-height").value = state.currentUser.height;
    document.getElementById("edit-education").value = state.currentUser.education;
    document.getElementById("edit-profession").value = state.currentUser.occupation;
    document.getElementById("edit-income").value = state.currentUser.income;
    document.getElementById("edit-location").value = state.currentUser.location;
    document.getElementById("edit-about").value = state.currentUser.about;
    document.getElementById("edit-pref-age-min").value = state.currentUser.prefAgeMin;
    document.getElementById("edit-pref-age-max").value = state.currentUser.prefAgeMax;
    document.getElementById("edit-pref-religion").value = state.currentUser.prefReligion;
    document.getElementById("edit-pref-location").value = state.currentUser.prefLocation;
}

function handleMyProfileSave(event) {
    event.preventDefault();
    
    if (!state.currentUser) return;
    
    // Save details
    state.currentUser.name = document.getElementById("edit-name").value;
    state.currentUser.mothertongue = document.getElementById("edit-mothertongue").value;
    state.currentUser.religion = document.getElementById("edit-religion").value;
    state.currentUser.caste = document.getElementById("edit-caste").value;
    state.currentUser.age = parseInt(document.getElementById("edit-age").value);
    state.currentUser.height = document.getElementById("edit-height").value;
    state.currentUser.education = document.getElementById("edit-education").value;
    state.currentUser.occupation = document.getElementById("edit-profession").value;
    state.currentUser.income = document.getElementById("edit-income").value;
    state.currentUser.location = document.getElementById("edit-location").value;
    state.currentUser.about = document.getElementById("edit-about").value;
    state.currentUser.prefAgeMin = parseInt(document.getElementById("edit-pref-age-min").value);
    state.currentUser.prefAgeMax = parseInt(document.getElementById("edit-pref-age-max").value);
    state.currentUser.prefReligion = document.getElementById("edit-pref-religion").value;
    state.currentUser.prefLocation = document.getElementById("edit-pref-location").value;
    
    localStorage.setItem("wm_current_user", JSON.stringify(state.currentUser));
    updateHeaderAuthDOM();
    
    showToast("Profile details updated successfully!", "success");
    switchView("dashboard");
}

function openMyProfile() {
    switchView("myprofile");
}

// 17. TOAST NOTIFICATION HELPERS
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    // Icon selection
    let icon = "🔔";
    if (type === "success") icon = "✨";
    if (type === "danger") icon = "⚠️";
    
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Remove after 3.5 seconds
    setTimeout(() => {
        toast.style.animation = "fadeIn 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// 18. ADMIN PROFILE CREATOR CONTROLLER
let adminPhotoBase64 = "";
let editingProfileId = null;

function setupAdminViewListeners() {
    const photoInput = document.getElementById("admin-photo");
    if (photoInput) {
        photoInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    adminPhotoBase64 = evt.target.result;
                    document.getElementById("admin-photo-preview").src = adminPhotoBase64;
                    document.getElementById("admin-photo-preview-container").classList.remove("hidden");
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function handleAdminFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById("admin-name").value;
    const gender = document.getElementById("admin-gender").value;
    const age = parseInt(document.getElementById("admin-age").value);
    const height = document.getElementById("admin-height").value;
    const phone = document.getElementById("admin-phone").value.trim();
    const religion = document.getElementById("admin-religion").value;
    const caste = document.getElementById("admin-caste").value;
    const mothertongue = document.getElementById("admin-mothertongue").value;
    
    let star = "None";
    if (religion === "Hindu") {
        star = document.getElementById("admin-star").value || "None";
    }
    
    let location = document.getElementById("admin-location").value;
    if (location === "Others") {
        location = document.getElementById("admin-location-custom").value.trim() || "Others";
    }
    
    const education = document.getElementById("admin-education").value;
    const college = document.getElementById("admin-college").value;
    
    let occupation = document.getElementById("admin-profession").value;
    if (occupation === "Others") {
        occupation = document.getElementById("admin-profession-custom").value.trim() || "Others";
    }
    const employer = document.getElementById("admin-employer").value;
    const income = document.getElementById("admin-income").value;
    const diet = document.getElementById("admin-diet").value;
    const about = document.getElementById("admin-about").value;
    
    const familyValues = document.getElementById("admin-family-values").value;
    const familyType = document.getElementById("admin-family-type").value;
    const father = document.getElementById("admin-father").value;
    const mother = document.getElementById("admin-mother").value;
    
    const prefAgeMin = parseInt(document.getElementById("admin-pref-age-min").value);
    const prefAgeMax = parseInt(document.getElementById("admin-pref-age-max").value);
    const prefReligion = document.getElementById("admin-pref-religion").value;
    const prefLocation = document.getElementById("admin-pref-location").value;
    
    // Generate or reuse ID
    const isEditMode = editingProfileId !== null;
    const profileId = isEditMode ? editingProfileId : `WM-${Math.floor(10000 + Math.random() * 90000)}`;
    
    let imageSrc = adminPhotoBase64;
    if (!imageSrc) {
        imageSrc = gender === "female" ? "assets/images/profile_female_1.png" : "assets/images/profile_male_1.png";
    }
    
    const newProfile = {
        id: profileId,
        name: name,
        gender: gender,
        age: age,
        height: height,
        religion: religion,
        caste: caste,
        star: star,
        mothertongue: mothertongue,
        education: education,
        college: college,
        occupation: occupation,
        employer: employer,
        income: income,
        location: location,
        image: imageSrc,
        phone: phone,
        about: about,
        familyValues: familyValues,
        familyType: familyType,
        father: father,
        mother: mother,
        brothers: 1,
        sisters: 0,
        diet: diet,
        lifestyle: "No / No",
        prefAgeMin: prefAgeMin,
        prefAgeMax: prefAgeMax,
        prefHeight: "5 ft 5 in",
        prefReligion: prefReligion,
        prefOccupation: "Graduate Professional",
        prefLocation: prefLocation
    };
    
    if (isBackendEnabled) {
        publishAdminProfileSupabase(newProfile, isEditMode);
        return;
    }
    
    // Save to localStorage list
    let savedCustom = localStorage.getItem("wm_custom_profiles");
    let customProfiles = savedCustom ? JSON.parse(savedCustom) : [];
    
    if (isEditMode) {
        // Edit local memory & storage
        const idx = state.profiles.findIndex(p => p.id === newProfile.id);
        if (idx !== -1) state.profiles[idx] = newProfile;
        
        const cIdx = customProfiles.findIndex(p => p.id === newProfile.id);
        if (cIdx !== -1) {
            customProfiles[cIdx] = newProfile;
            localStorage.setItem("wm_custom_profiles", JSON.stringify(customProfiles));
        }
        showToast("Profile updated successfully (local)!", "success");
    } else {
        // Insert new local memory & storage
        customProfiles.push(newProfile);
        localStorage.setItem("wm_custom_profiles", JSON.stringify(customProfiles));
        state.profiles.push(newProfile);
        showToast("Profile published successfully (local)!", "success");
    }
    
    // Reset Edit Mode
    editingProfileId = null;
    const submitBtn = document.getElementById("btn-admin-create");
    if (submitBtn) submitBtn.textContent = "Publish Profile";
    
    // Reset form and variables
    document.getElementById("admin-create-profile-form").reset();
    document.getElementById("admin-photo-preview-container").classList.add("hidden");
    adminPhotoBase64 = "";
    
    showToast(`Profile for ${name} successfully published!`, "success");
    
    // Redirect to browse view
    switchView("browse");
}

function startEditingProfile() {
    const profileId = state.activeProfileDetail;
    if (!profileId) return;
    
    const profile = state.profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    editingProfileId = profileId;
    
    // Switch to Admin view
    switchView("admin");
    
    // Populate form fields
    document.getElementById("admin-name").value = profile.name;
    document.getElementById("admin-gender").value = profile.gender;
    document.getElementById("admin-age").value = profile.age;
    document.getElementById("admin-height").value = profile.height;
    document.getElementById("admin-phone").value = profile.phone || "";
    document.getElementById("admin-religion").value = profile.religion;
    document.getElementById("admin-caste").value = profile.caste;
    
    // Star toggle
    const starSelect = document.getElementById("admin-star");
    if (profile.religion === "Hindu") {
        document.getElementById("admin-star-group").classList.remove("hidden");
        starSelect.value = profile.star || "None";
    } else {
        document.getElementById("admin-star-group").classList.add("hidden");
        starSelect.value = "None";
    }
    
    // Mother tongue
    document.getElementById("admin-mothertongue").value = profile.mothertongue;
    
    // Location
    const locSelect = document.getElementById("admin-location");
    const customLocGroup = document.getElementById("admin-location-custom-group");
    const customLocInput = document.getElementById("admin-location-custom");
    const cities = ["Kochi", "Trivandrum", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kottayam", "Kannur"];
    if (cities.includes(profile.location)) {
        locSelect.value = profile.location;
        customLocGroup.classList.add("hidden");
        customLocInput.value = "";
    } else {
        locSelect.value = "Others";
        customLocGroup.classList.remove("hidden");
        customLocInput.value = profile.location;
    }
    
    // Career/Edu
    document.getElementById("admin-education").value = profile.education;
    document.getElementById("admin-college").value = profile.college;
    
    // Profession
    const profSelect = document.getElementById("admin-profession");
    const customProfGroup = document.getElementById("admin-profession-custom-group");
    const customProfInput = document.getElementById("admin-profession-custom");
    const professions = ["Software Engineer", "Doctor / Medical", "Banker / Finance", "Teacher / Professor", "Business Owner", "Civil Servant", "Engineer (Mech/Civil)", "Nurse / Healthcare"];
    if (professions.includes(profile.occupation)) {
        profSelect.value = profile.occupation;
        customProfGroup.classList.add("hidden");
        customProfInput.value = "";
    } else {
        profSelect.value = "Others";
        customProfGroup.classList.remove("hidden");
        customProfInput.value = profile.occupation;
    }
    
    document.getElementById("admin-employer").value = profile.employer || "";
    document.getElementById("admin-income").value = profile.income || "";
    document.getElementById("admin-diet").value = profile.diet || "Non-Vegetarian";
    document.getElementById("admin-about").value = profile.about || "";
    
    // Family
    document.getElementById("admin-family-values").value = profile.familyValues || "Moderate";
    document.getElementById("admin-family-type").value = profile.familyType || "Nuclear Family";
    document.getElementById("admin-father").value = profile.father || "";
    document.getElementById("admin-mother").value = profile.mother || "";
    
    // Partner Expectations
    document.getElementById("admin-pref-age-min").value = profile.prefAgeMin || 20;
    document.getElementById("admin-pref-age-max").value = profile.prefAgeMax || 45;
    document.getElementById("admin-pref-religion").value = profile.prefReligion || "all";
    document.getElementById("admin-pref-location").value = profile.prefLocation || "all";
    
    // Image Preview
    const imgPreview = document.getElementById("admin-photo-preview");
    const imgPreviewContainer = document.getElementById("admin-photo-preview-container");
    if (profile.image) {
        imgPreview.src = profile.image;
        imgPreviewContainer.classList.remove("hidden");
        adminPhotoBase64 = profile.image;
    } else {
        imgPreview.src = "";
        imgPreviewContainer.classList.add("hidden");
        adminPhotoBase64 = "";
    }
    
    // Update Submit button text
    const submitBtn = document.getElementById("btn-admin-create");
    if (submitBtn) {
        submitBtn.textContent = `Update Profile (${profileId})`;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removeAdminPhoto() {
    const photoInput = document.getElementById("admin-photo");
    if (photoInput) photoInput.value = "";
    
    const imgPreview = document.getElementById("admin-photo-preview");
    if (imgPreview) imgPreview.src = "";
    
    const previewContainer = document.getElementById("admin-photo-preview-container");
    if (previewContainer) previewContainer.classList.add("hidden");
    
    adminPhotoBase64 = "";
    showToast("Photo removed.", "info");
}

async function deletePublishedProfile() {
    const profileId = state.activeProfileDetail;
    if (!profileId) return;
    
    if (!confirm(`Are you sure you want to permanently delete profile ${profileId}? This action cannot be undone.`)) return;
    
    showToast("Deleting profile...", "info");
    
    if (isBackendEnabled) {
        try {
            // 1. Delete from Supabase profiles table
            const { error: dbError } = await supabaseClient
                .from('profiles')
                .delete()
                .eq('id', profileId);
                
            if (dbError) {
                showToast(`Failed to delete profile from database: ${dbError.message}`, "danger");
                return;
            }
            
            // 2. Attempt to delete photo from storage (matches ID + .png extension)
            await supabaseClient.storage
                .from('profile-images')
                .remove([`${profileId}.png`]);
                
        } catch (e) {
            showToast(`Delete failed: ${e.message || e}`, "danger");
            return;
        }
    } else {
        // Local storage fallback path
        let savedCustom = localStorage.getItem("wm_custom_profiles");
        let customProfiles = savedCustom ? JSON.parse(savedCustom) : [];
        customProfiles = customProfiles.filter(p => p.id !== profileId);
        localStorage.setItem("wm_custom_profiles", JSON.stringify(customProfiles));
    }
    
    // 3. Remove from local memory cache
    state.profiles = state.profiles.filter(p => p.id !== profileId);
    
    showToast("Profile deleted successfully!", "success");
    
    // 4. Return to search browseMatches list
    switchView("browse");
}

// =========================================================================
// 19. SUPABASE BACKEND CONTROLLER HELPER FUNCTIONS
// =========================================================================

async function loadSupabaseData() {
    if (!isBackendEnabled) return;
    
    try {
        // 1. Get current session
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            const user = session.user;
            
            // Fetch users_profiles record
            const { data: profile } = await supabaseClient
                .from('users_profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
            if (profile) {
                const isAdminUser = profile.is_admin || (user.email && user.email.trim().toLowerCase() === "admin@westmatrimony.com");
                
                // Admin Single-Session Lock Check
                if (isAdminUser) {
                    const localSessId = localStorage.getItem("wm_admin_session_id");
                    if (profile.last_session_id && localSessId && profile.last_session_id !== localSessId) {
                        setTimeout(() => {
                            handleLogout();
                            showToast("You have been logged out because this admin account was logged in on another device.", "danger");
                        }, 500);
                        return;
                    }
                    setTimeout(() => {
                        setupAdminSessionLock();
                    }, 1000);
                }
                
                state.currentUser = {
                    id: profile.id,
                    name: profile.name,
                    email: user.email,
                    gender: profile.gender,
                    age: profile.age,
                    height: profile.height,
                    religion: profile.religion,
                    caste: profile.caste,
                    star: profile.star || "None",
                    mothertongue: profile.mothertongue,
                    education: profile.education,
                    occupation: profile.occupation,
                    income: profile.income,
                    location: profile.location,
                    about: profile.about,
                    image: profile.image,
                    prefAgeMin: profile.pref_age_min,
                    prefAgeMax: profile.pref_age_max,
                    prefReligion: profile.pref_religion,
                    prefLocation: profile.pref_location,
                    isAdmin: isAdminUser
                };
            } else {
                state.currentUser = {
                    id: user.id,
                    name: user.email.split('@')[0],
                    email: user.email,
                    gender: 'male',
                    age: 28,
                    height: '5 ft 8 in',
                    religion: 'Hindu',
                    location: 'Mumbai',
                    prefLocation: 'Bangalore',
                    prefAgeMin: 20,
                    prefAgeMax: 45,
                    prefReligion: 'Hindu',
                    isAdmin: user.email.trim().toLowerCase().includes("admin")
                };
            }
            
            // Sync with local storage
            localStorage.setItem("wm_current_user", JSON.stringify(state.currentUser));
            
            // 2. Load shortlists
            const { data: shortlistData } = await supabaseClient
                .from('shortlists')
                .select('profile_id')
                .eq('user_id', user.id);
            if (shortlistData) {
                state.shortlist = shortlistData.map(s => s.profile_id);
            }
        }
        
        // 3. Load all profiles (merging mock data and any custom database entries)
        const { data: dbProfiles } = await supabaseClient
            .from('profiles')
            .select('*');
        if (dbProfiles) {
            const mappedProfiles = dbProfiles.map(p => ({
                id: p.id,
                name: p.name,
                gender: p.gender,
                age: p.age,
                height: p.height,
                religion: p.religion,
                caste: p.caste,
                star: p.star || "None",
                mothertongue: p.mothertongue,
                education: p.education,
                college: p.college,
                occupation: p.occupation,
                employer: p.employer,
                income: p.income,
                location: p.location,
                image: p.image,
                about: p.about,
                familyValues: p.family_values,
                familyType: p.family_type,
                father: p.father,
                mother: p.mother,
                brothers: p.brothers,
                sisters: p.sisters,
                diet: p.diet,
                lifestyle: p.lifestyle,
                prefAgeMin: p.pref_age_min,
                prefAgeMax: p.pref_age_max,
                prefHeight: p.pref_height,
                prefReligion: p.pref_religion,
                prefOccupation: p.pref_occupation,
                prefLocation: p.pref_location
            }));
            
            // Keep only unique profiles, prioritizing database entries
            const ids = new Set(mappedProfiles.map(p => p.id));
            const defaultProfiles = MOCK_PROFILES.filter(p => !ids.has(p.id));
            state.profiles = [...defaultProfiles, ...mappedProfiles];
        }
        
        // 4. Set up realtime messaging channel
        setupRealtimeMessages();
        
        // Update header & views
        updateHeaderAuthDOM();
        renderFeaturedProfiles();
        if (state.activeView === "dashboard") {
            renderDashboard();
        } else if (state.activeView === "browse") {
            applyFilters();
        }
    } catch (e) {
        console.error("Supabase data fetch failed:", e);
    }
}

async function loadChatMessages() {
    if (!isBackendEnabled || !state.currentUser) return;
    
    try {
        const userId = state.currentUser.id;
        const { data: msgRows } = await supabaseClient
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: true });
            
        if (msgRows) {
            state.chats = {};
            msgRows.forEach(msg => {
                const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
                if (!state.chats[partnerId]) {
                    state.chats[partnerId] = [];
                }
                state.chats[partnerId].push({
                    sender: msg.sender_id === userId ? 'user' : 'partner',
                    text: msg.text,
                    time: msg.time
                });
            });
        }
        
        if (state.activeView === "connections" && state.activeConnectionTab === "chats") {
            renderChatsTab();
        }
        if (state.activeChatId) {
            renderWidgetMessages();
        }
    } catch (e) {
        console.error("Supabase messages fetch failed:", e);
    }
}

let realtimeChannel = null;
function setupRealtimeMessages() {
    if (!isBackendEnabled || !state.currentUser) return;
    
    if (realtimeChannel) {
        supabaseClient.removeChannel(realtimeChannel);
    }
    
    const userId = state.currentUser.id;
    
    realtimeChannel = supabaseClient
        .channel('public:messages')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages'
        }, payload => {
            const newMsg = payload.new;
            if (newMsg.sender_id === userId || newMsg.receiver_id === userId) {
                const partnerId = newMsg.sender_id === userId ? newMsg.receiver_id : newMsg.sender_id;
                
                if (!state.chats[partnerId]) {
                    state.chats[partnerId] = [];
                }
                
                const isDuplicate = state.chats[partnerId].some(m => m.text === newMsg.text && m.time === newMsg.time);
                if (!isDuplicate) {
                    state.chats[partnerId].push({
                        sender: newMsg.sender_id === userId ? 'user' : 'partner',
                        text: newMsg.text,
                        time: newMsg.time
                    });
                    
                    showToast("New message received!", "info");
                    
                    if (state.activeView === "connections" && state.activeConnectionTab === "chats") {
                        renderChatsTab();
                    }
                    if (state.activeChatId === partnerId) {
                        renderWidgetMessages();
                        renderActiveChatPane();
                    }
                }
            }
        })
        .subscribe();
}

async function handleLoginSubmitSupabase(email, password) {
    showToast("Authenticating via Supabase...", "info");
    
    try {
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (authError) {
            showToast(authError.message, "danger");
            return;
        }
        
        const user = authData.user;
        if (user) {
            await loadSupabaseData();
            
            // Setup single session lock if admin
            if (state.currentUser && state.currentUser.isAdmin) {
                const newSessId = 'sess_' + Math.random().toString(36).substr(2, 9);
                state.adminSessionId = newSessId;
                localStorage.setItem("wm_admin_session_id", newSessId);
                
                await supabaseClient
                    .from('users_profiles')
                    .update({ last_session_id: newSessId })
                    .eq('id', state.currentUser.id);
            }
            
            await loadChatMessages();
            
            showToast("Logged in successfully to Supabase!", "success");
            switchView(state.currentUser.isAdmin ? "admin" : "dashboard");
        }
    } catch (e) {
        showToast("Login failed: server connection error.", "danger");
    }
}

async function handleRegisterSubmitSupabase(newUser, email, password) {
    showToast("Creating account in Supabase...", "info");
    
    const cleanEmail = email.trim().toLowerCase();
    try {
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: cleanEmail,
            password: password
        });
        
        if (authError) {
            showToast(authError.message, "danger");
            return;
        }
        
        const user = authData.user;
        if (user) {
            const isSystemAdmin = cleanEmail === "admin@westmatrimony.com";
            
            // Save to users_profiles
            const { error: profileError } = await supabaseClient
                .from('users_profiles')
                .insert({
                    id: user.id,
                    name: newUser.name,
                    gender: newUser.gender,
                    age: newUser.age,
                    height: newUser.height,
                    religion: newUser.religion,
                    caste: newUser.caste,
                    star: newUser.star || "None",
                    mothertongue: newUser.mothertongue,
                    education: newUser.education,
                    occupation: newUser.occupation,
                    income: newUser.income,
                    location: newUser.location,
                    about: newUser.about,
                    image: newUser.image,
                    pref_age_min: newUser.prefAgeMin,
                    pref_age_max: newUser.prefAgeMax,
                    pref_religion: newUser.prefReligion,
                    pref_location: newUser.prefLocation,
                    is_admin: isSystemAdmin
                });
                
            if (profileError) {
                console.error("Error creating Supabase user profile record:", profileError);
            }
            
            state.currentUser = { ...newUser, id: user.id, email: cleanEmail, isAdmin: isSystemAdmin };
            
            // Save to local storage
            localStorage.setItem("wm_current_user", JSON.stringify(state.currentUser));
            
            updateHeaderAuthDOM();
            setupRealtimeMessages();
            loadChatMessages();
            
            showToast("Registration completed! Profile created in Supabase.", "success");
            switchView(isSystemAdmin ? "admin" : "dashboard");
        }
    } catch (e) {
        showToast("Registration failed: connection error.", "danger");
    }
}

async function publishAdminProfileSupabase(newProfile, isEditMode = false) {
    showToast("Publishing profile...", "info");
    
    try {
        let finalImageUrl = newProfile.image;
        
        // Only upload to storage if it's a newly uploaded base64 data URL
        if (newProfile.image && newProfile.image.startsWith("data:")) {
            showToast("Uploading profile photo...", "info");
            const blob = base64ToBlob(newProfile.image, 'image/png');
            const fileName = `${newProfile.id}.png`;
            
            // Upload photo
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('profile-images')
                .upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: true
                });
                
            if (uploadError) {
                showToast(`Photo upload failed: ${uploadError.message}`, "danger");
                return;
            }
            
            // Retrieve public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from('profile-images')
                .getPublicUrl(fileName);
                
            finalImageUrl = publicUrl;
        }
        
        newProfile.image = finalImageUrl;
        
        if (isEditMode) {
            // Update record
            const { error: dbError } = await supabaseClient
                .from('profiles')
                .update({
                    name: newProfile.name,
                    gender: newProfile.gender,
                    age: newProfile.age,
                    height: newProfile.height,
                    religion: newProfile.religion,
                    caste: newProfile.caste,
                    star: newProfile.star || "None",
                    mothertongue: newProfile.mothertongue,
                    education: newProfile.education,
                    college: newProfile.college,
                    occupation: newProfile.occupation,
                    employer: newProfile.employer,
                    income: newProfile.income,
                    location: newProfile.location,
                    image: newProfile.image,
                    phone: newProfile.phone,
                    about: newProfile.about,
                    family_values: newProfile.familyValues,
                    family_type: newProfile.familyType,
                    father: newProfile.father,
                    mother: newProfile.mother,
                    diet: newProfile.diet,
                    pref_age_min: newProfile.prefAgeMin,
                    pref_age_max: newProfile.prefAgeMax,
                    pref_religion: newProfile.prefReligion,
                    pref_location: newProfile.prefLocation
                })
                .eq('id', newProfile.id);
                
            if (dbError) {
                showToast(`Profile update failed: ${dbError.message}`, "danger");
                return;
            }
            
            // Update local memory cache
            const idx = state.profiles.findIndex(p => p.id === newProfile.id);
            if (idx !== -1) {
                state.profiles[idx] = newProfile;
            }
            
            // Reset Edit Mode
            editingProfileId = null;
            const submitBtn = document.getElementById("btn-admin-create");
            if (submitBtn) submitBtn.textContent = "Publish Profile";
            
            showToast(`Profile for ${newProfile.name} updated successfully!`, "success");
            
        } else {
            // Write new record
            const { error: dbError } = await supabaseClient
                .from('profiles')
                .insert({
                    id: newProfile.id,
                    name: newProfile.name,
                    gender: newProfile.gender,
                    age: newProfile.age,
                    height: newProfile.height,
                    religion: newProfile.religion,
                    caste: newProfile.caste,
                    star: newProfile.star || "None",
                    mothertongue: newProfile.mothertongue,
                    education: newProfile.education,
                    college: newProfile.college,
                    occupation: newProfile.occupation,
                    employer: newProfile.employer,
                    income: newProfile.income,
                    location: newProfile.location,
                    image: newProfile.image,
                    phone: newProfile.phone,
                    about: newProfile.about,
                    family_values: newProfile.familyValues,
                    family_type: newProfile.familyType,
                    father: newProfile.father,
                    mother: newProfile.mother,
                    diet: newProfile.diet,
                    lifestyle: newProfile.lifestyle,
                    pref_age_min: newProfile.prefAgeMin,
                    pref_age_max: newProfile.prefAgeMax,
                    pref_height: newProfile.prefHeight,
                    pref_religion: newProfile.prefReligion,
                    pref_occupation: newProfile.prefOccupation,
                    pref_location: newProfile.prefLocation
                });
                
            if (dbError) {
                showToast(`Publish failed: ${dbError.message}`, "danger");
                return;
            }
            
            state.profiles.push(newProfile);
            showToast(`Profile for ${newProfile.name} published live!`, "success");
        }
        
        // Clear uploader preview and reset form
        document.getElementById("admin-create-profile-form").reset();
        document.getElementById("admin-photo-preview-container").classList.add("hidden");
        adminPhotoBase64 = "";
        switchView("browse");
    } catch (e) {
        console.error("Publishing profile error details:", e);
        showToast(`Publishing profile failed: ${e.message || e}`, "danger");
    }
}

// Convert Base64 dataURL to Blob uploader helper
function base64ToBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
}

// Global helper to show/hide custom text inputs for "Others" select options
function toggleCustomInput(selectEl, customGroupId) {
    const group = document.getElementById(customGroupId);
    if (!group) return;
    
    if (selectEl.value === "Others") {
        group.classList.remove("hidden");
        const input = group.querySelector("input");
        if (input) {
            input.required = true;
            input.focus();
        }
    } else {
        group.classList.add("hidden");
        const input = group.querySelector("input");
        if (input) {
            input.required = false;
            input.value = "";
        }
    }
}

function toggleRegStar(selectEl) {
    const starGroup = document.getElementById("reg-star-group");
    if (!starGroup) return;
    if (selectEl.value === "Hindu") {
        starGroup.classList.remove("hidden");
    } else {
        starGroup.classList.add("hidden");
        document.getElementById("reg-star").value = "None";
    }
}

function toggleAdminStar(selectEl) {
    const starGroup = document.getElementById("admin-star-group");
    if (!starGroup) return;
    if (selectEl.value === "Hindu") {
        starGroup.classList.remove("hidden");
    } else {
        starGroup.classList.add("hidden");
        document.getElementById("admin-star").value = "None";
    }
}

function startBackgroundSlideshows() {
    let heroIndex = 0;
    let authIndex = 0;
    
    // Cycle hero slideshow
    setInterval(() => {
        const heroSlides = document.querySelectorAll("#hero-bg-slideshow .hero-slide");
        if (heroSlides.length > 0) {
            heroSlides[heroIndex].classList.remove("active");
            heroIndex = (heroIndex + 1) % heroSlides.length;
            heroSlides[heroIndex].classList.add("active");
        }
    }, 5000);
    
    // Cycle auth slideshow
    setInterval(() => {
        const authSlides = document.querySelectorAll("#auth-bg-slideshow .auth-slide");
        if (authSlides.length > 0) {
            authSlides[authIndex].classList.remove("active");
            authIndex = (authIndex + 1) % authSlides.length;
            authSlides[authIndex].classList.add("active");
        }
    }, 5000);
}

function setupAdminSessionLock() {
    if (!state.currentUser || !state.currentUser.isAdmin) return;
    
    const currentSessId = localStorage.getItem("wm_admin_session_id") || state.adminSessionId;
    if (!currentSessId) return;
    
    const channel = supabaseClient
        .channel('admin-session-lock')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'users_profiles',
                filter: `id=eq.${state.currentUser.id}`
            },
            (payload) => {
                const updatedProfile = payload.new;
                if (updatedProfile && updatedProfile.last_session_id) {
                    if (updatedProfile.last_session_id !== currentSessId) {
                        channel.unsubscribe();
                        handleLogout();
                        showToast("You have been logged out because this admin account was logged in on another device.", "danger");
                    }
                }
            }
        )
        .subscribe();
}

function showPolicy(type) {
    const modal = document.getElementById("policy-modal");
    const title = document.getElementById("policy-modal-title");
    const content = document.getElementById("policy-modal-content");
    
    if (!modal || !title || !content) return;
    
    let html = "";
    if (type === "privacy") {
        title.textContent = "Privacy Policy";
        html = `
            <h4>1. Information Collection</h4>
            <p>We collect information you provide directly during account registration, including your name, contact details, religion, caste, occupation, and photos. This is necessary to facilitate premium matchmaking.</p>
            
            <h4>2. Data Security & Encryption</h4>
            <p>Your password and sensitive communications are encrypted and safely stored in secure servers on Supabase. We do not sell or lease your personal information to third parties.</p>
            
            <h4>3. Privacy Controls</h4>
            <p>You have full control over who can view your contact information. Shortlisted matches and verified profiles can initiate conversations, while blocked users are instantly restricted from reaching you.</p>
            
            <h4>4. Account Deletion</h4>
            <p>You have the right to request deletion of your account and all associated profile data at any time by contacting our support team at <a href="mailto:westmatrimoney64rm@gmail.com">westmatrimoney64rm@gmail.com</a>.</p>
        `;
    } else if (type === "terms") {
        title.textContent = "Terms of Use";
        html = `
            <h4>1. Eligibility</h4>
            <p>You must be of legal marriageable age according to the laws of India (18 years for females and 21 years for males) to register and use this matchmaking service.</p>
            
            <h4>2. Verification & Authenticity</h4>
            <p>Users are expected to provide genuine, accurate information. While we run basic validation checks, we advise members to independently verify candidate backgrounds before proceeding with marriage alliances.</p>
            
            <h4>3. User Code of Conduct</h4>
            <p>Any form of harassment, fake profile creation, commercial promotion, or offensive messaging will lead to immediate account suspension and IP ban without prior notice.</p>
            
            <h4>4. Single-Screen Limitation</h4>
            <p>To prevent profile misuse and coordinate security, Administrator accounts are restricted to one active session at a time. Concurrent logins from multiple locations are automatically logged out.</p>
        `;
    } else if (type === "safety") {
        title.textContent = "Safety Tips";
        html = `
            <h4>1. Meet in Public Places</h4>
            <p>When meeting a prospective match for the first time, choose public places (like coffee shops or restaurants) during daytime. Never meet in secluded areas or private residences.</p>
            
            <h4>2. Keep Families Informed</h4>
            <p>Always keep your family or close friends informed about your meetings and communication progress. Let them know where you are going and whom you are meeting.</p>
            
            <h4>3. Guard Your Financial Information</h4>
            <p><strong>Crucial Warning:</strong> Never send money, deposit funds, or share bank account details with anyone you meet online, regardless of the reason or emergency they claim to have.</p>
            
            <h4>4. Report Suspicious Profiles</h4>
            <p>If you notice any member asking for money, posting inappropriate content, or behaving suspiciously, immediately report them using the "Block & Report" option or contact support at <a href="https://wa.me/919847695738?text=Hello%20West%20Matrimony%2C%20I%20wish%20to%20report%20a%20profile.">+91 9847695738</a>.</p>
        `;
    }
    
    content.innerHTML = html;
    modal.classList.remove("hidden");
}

function closePolicyModal() {
    const modal = document.getElementById("policy-modal");
    if (modal) modal.classList.add("hidden");
}
