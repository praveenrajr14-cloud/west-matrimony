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
const MOCK_PROFILES = [
    {
        id: "WM-10294",
        name: "Sophia Ann Abraham",
        gender: "female",
        age: 25,
        height: "5 ft 4 in (162 cm)",
        religion: "Christian",
        caste: "Syrian Orthodox",
        mothertongue: "Malayalam",
        education: "B.Tech in Computer Science",
        college: "College of Engineering Trivandrum (CET)",
        occupation: "Software Engineer",
        employer: "TCS Kochi",
        income: "₹12 - 15 Lakhs",
        location: "Kochi",
        image: "assets/images/profile_female_1.png",
        about: "A cheerful, career-oriented individual who balances traditional values with a modern outlook. She loves listening to music, traveling, and exploring new cuisines on weekends.",
        familyValues: "Moderate",
        familyType: "Nuclear Family",
        father: "Retired Government Officer",
        mother: "High School Teacher",
        brothers: 1,
        sisters: 0,
        diet: "Non-Vegetarian",
        lifestyle: "No / No",
        prefAgeMin: 26,
        prefAgeMax: 30,
        prefHeight: "5 ft 7 in",
        prefReligion: "Christian",
        prefOccupation: "IT Professional or Doctor",
        prefLocation: "Kochi, Bangalore"
    },
    {
        id: "WM-28190",
        name: "Rahul Sharma",
        gender: "male",
        age: 29,
        height: "5 ft 10 in (178 cm)",
        religion: "Hindu",
        caste: "Brahmin",
        mothertongue: "Hindi",
        education: "MBA in Business Analytics",
        college: "IIM Bangalore",
        occupation: "Software Engineer",
        employer: "Microsoft Bangalore",
        income: "₹24+ Lakhs",
        location: "Bangalore",
        image: "assets/images/profile_male_1.png",
        about: "A simple, down-to-earth person who believes in mutual respect and clear communication. I enjoy working on fintech trends, reading historical fiction, and trekking in the Western Ghats.",
        familyValues: "Traditional",
        familyType: "Joint Family",
        father: "Business Owner",
        mother: "Homemaker",
        brothers: 0,
        sisters: 1,
        diet: "Vegetarian",
        lifestyle: "No / No",
        prefAgeMin: 23,
        prefAgeMax: 28,
        prefHeight: "5 ft 2 in",
        prefReligion: "Hindu",
        prefOccupation: "Graduate Professional",
        prefLocation: "Bangalore, Kochi"
    },
    {
        id: "WM-40192",
        name: "Priya Iyer",
        gender: "female",
        age: 26,
        height: "5 ft 2 in (157 cm)",
        religion: "Hindu",
        caste: "Tamil Brahmin",
        mothertongue: "Tamil",
        education: "B.Des in Product Design",
        college: "NID Ahmedabad",
        occupation: "UI/UX Designer",
        employer: "Freelancer / Startup Consultant",
        income: "₹15 - 18 Lakhs",
        location: "Chennai",
        image: "assets/images/profile_female_2.png",
        about: "A creative mind who loves visual arts, classical music, and visiting heritage spots. Looking for a partner who is passionate about their work and values art and culture.",
        familyValues: "Liberal",
        familyType: "Nuclear Family",
        father: "Senior Advocate",
        mother: "Carnatic Vocalist",
        brothers: 1,
        sisters: 0,
        diet: "Vegetarian",
        lifestyle: "Occasional / No",
        prefAgeMin: 26,
        prefAgeMax: 32,
        prefHeight: "5 ft 6 in",
        prefReligion: "Hindu",
        prefOccupation: "Creative or Tech Professional",
        prefLocation: "Chennai, Bangalore, Kochi"
    },
    {
        id: "WM-89102",
        name: "Ahaan Patel",
        gender: "male",
        age: 28,
        height: "5 ft 8 in (173 cm)",
        religion: "Hindu",
        caste: "Patel",
        mothertongue: "Hindi",
        education: "M.Com & Chartered Accountant",
        college: "HR College Mumbai",
        occupation: "Banker",
        employer: "HDFC Bank Mumbai",
        income: "₹18 - 22 Lakhs",
        location: "Mumbai",
        image: "assets/images/profile_male_2.png",
        about: "An ambitious banker who balances a busy professional life with hobbies like squash, culinary experimentation, and volunteering. Looking for a partner who is independent and family-focused.",
        familyValues: "Moderate",
        familyType: "Nuclear Family",
        father: "Chartered Accountant",
        mother: "Interior Designer",
        brothers: 0,
        sisters: 0,
        diet: "Non-Vegetarian",
        lifestyle: "No / No",
        prefAgeMin: 24,
        prefAgeMax: 28,
        prefHeight: "5 ft 3 in",
        prefReligion: "Hindu",
        prefOccupation: "Finance, Banking or IT Analyst",
        prefLocation: "Mumbai, Bangalore"
    }
];

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
    
    if (state.currentUser) {
        authArea.classList.add("hidden");
        userChip.classList.remove("hidden");
        
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
    const education = document.getElementById("reg-education").value;
    const occupation = document.getElementById("reg-profession").value;
    const income = document.getElementById("reg-income").value;
    const location = document.getElementById("reg-location").value;
    
    // Build user object
    const newUser = {
        name: name,
        gender: gender,
        age: dob ? calculateAgeFromDOB(dob) : 26,
        height: gender === "male" ? "5 ft 8 in" : "5 ft 3 in",
        religion: religion,
        caste: "General",
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
    
    // Fill main header details
    document.getElementById("detail-fullname").textContent = profile.name;
    document.getElementById("detail-primary-occupation").textContent = profile.occupation;
    document.getElementById("detail-primary-city").textContent = `${profile.location}, India`;
    document.getElementById("detail-profile-id").textContent = `ID: ${profile.id}`;
    
    // Tab: About Her
    document.getElementById("detail-about-text").textContent = profile.about;
    document.getElementById("detail-age").textContent = `${profile.age} Years`;
    document.getElementById("detail-height").textContent = profile.height;
    document.getElementById("detail-mothertongue").textContent = profile.mothertongue;
    document.getElementById("detail-marital").textContent = "Never Married";
    document.getElementById("detail-religion").textContent = profile.religion;
    document.getElementById("detail-caste").textContent = profile.caste;
    
    // Tab: Career & Education
    document.getElementById("detail-education").textContent = profile.education;
    document.getElementById("detail-college").textContent = profile.college;
    document.getElementById("detail-occupation").textContent = profile.occupation;
    document.getElementById("detail-employer").textContent = profile.employer;
    document.getElementById("detail-income").textContent = profile.income;
    document.getElementById("detail-work-location").textContent = `${profile.location}, India`;
    
    // Tab: Lifestyle & Family
    document.getElementById("detail-family-values").textContent = profile.familyValues;
    document.getElementById("detail-family-type").textContent = profile.familyType;
    document.getElementById("detail-father").textContent = profile.father;
    document.getElementById("detail-mother").textContent = profile.mother;
    document.getElementById("detail-brothers").textContent = profile.brothers;
    document.getElementById("detail-sisters").textContent = profile.sisters;
    document.getElementById("detail-diet").textContent = profile.diet;
    document.getElementById("detail-lifestyle").textContent = profile.lifestyle;
    
    // Tab: Partner Preferences
    document.getElementById("detail-pref-age").textContent = `${profile.prefAgeMin} - ${profile.prefAgeMax} Years`;
    document.getElementById("detail-pref-height").textContent = profile.prefHeight;
    document.getElementById("detail-pref-religion").textContent = `${profile.prefReligion} (${profile.caste})`;
    document.getElementById("detail-pref-education").textContent = "Graduate or Post Graduate";
    document.getElementById("detail-pref-profession").textContent = profile.prefOccupation;
    document.getElementById("detail-pref-location").textContent = profile.prefLocation;
    
    // Show about tab panel by default
    setProfileTab("about");
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
    
    if (!adminPhotoBase64) {
        showToast("Please upload a profile photo.", "danger");
        return;
    }
    
    const name = document.getElementById("admin-name").value;
    const gender = document.getElementById("admin-gender").value;
    const age = parseInt(document.getElementById("admin-age").value);
    const height = document.getElementById("admin-height").value;
    const religion = document.getElementById("admin-religion").value;
    const caste = document.getElementById("admin-caste").value;
    const mothertongue = document.getElementById("admin-mothertongue").value;
    const location = document.getElementById("admin-location").value;
    const education = document.getElementById("admin-education").value;
    const college = document.getElementById("admin-college").value;
    const occupation = document.getElementById("admin-profession").value;
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
    
    // Generate unique ID
    const newId = `WM-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const newProfile = {
        id: newId,
        name: name,
        gender: gender,
        age: age,
        height: height,
        religion: religion,
        caste: caste,
        mothertongue: mothertongue,
        education: education,
        college: college,
        occupation: occupation,
        employer: employer,
        income: income,
        location: location,
        image: adminPhotoBase64,
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
        publishAdminProfileSupabase(newProfile);
        return;
    }
    
    // Save to localStorage list
    let savedCustom = localStorage.getItem("wm_custom_profiles");
    let customProfiles = savedCustom ? JSON.parse(savedCustom) : [];
    customProfiles.push(newProfile);
    localStorage.setItem("wm_custom_profiles", JSON.stringify(customProfiles));
    
    // Add to active state profiles array
    state.profiles.push(newProfile);
    
    // Reset form and variables
    document.getElementById("admin-create-profile-form").reset();
    document.getElementById("admin-photo-preview-container").classList.add("hidden");
    adminPhotoBase64 = "";
    
    showToast(`Profile for ${name} successfully published!`, "success");
    
    // Redirect to browse view
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
                state.currentUser = {
                    id: profile.id,
                    name: profile.name,
                    gender: profile.gender,
                    age: profile.age,
                    height: profile.height,
                    religion: profile.religion,
                    caste: profile.caste,
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
                    isAdmin: profile.is_admin
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
                    isAdmin: user.email.includes("admin")
                };
            }
            
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
    
    try {
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });
        
        if (authError) {
            showToast(authError.message, "danger");
            return;
        }
        
        const user = authData.user;
        if (user) {
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
                    is_admin: false
                });
                
            if (profileError) {
                console.error("Error creating Supabase user profile record:", profileError);
            }
            
            state.currentUser = { ...newUser, id: user.id, isAdmin: false };
            updateHeaderAuthDOM();
            setupRealtimeMessages();
            loadChatMessages();
            
            showToast("Registration completed! Profile created in Supabase.", "success");
            switchView("dashboard");
        }
    } catch (e) {
        showToast("Registration failed: connection error.", "danger");
    }
}

async function publishAdminProfileSupabase(newProfile) {
    showToast("Uploading photo and publishing profile...", "info");
    
    try {
        // Convert base64 to Blob uploader
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
            
        newProfile.image = publicUrl;
        
        // Write record
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
                mothertongue: newProfile.mothertongue,
                education: newProfile.education,
                college: newProfile.college,
                occupation: newProfile.occupation,
                employer: newProfile.employer,
                income: newProfile.income,
                location: newProfile.location,
                image: publicUrl,
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
        
        // Clear uploader preview
        document.getElementById("admin-create-profile-form").reset();
        document.getElementById("admin-photo-preview-container").classList.add("hidden");
        adminPhotoBase64 = "";
        
        showToast(`Profile for ${newProfile.name} published live!`, "success");
        switchView("browse");
    } catch (e) {
        showToast("Publishing profile failed: connection error.", "danger");
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
