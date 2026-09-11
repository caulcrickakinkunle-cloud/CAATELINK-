// ========================================
// CAATELINK - SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL = "https://mkjvlotgilihlrgtanps.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1iq8mtaSTBmRVhcLTUrlFw_RkQfw6Ix";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ========================================
// MODAL FUNCTIONS
// ========================================

function showModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "none";
  }
}

function openAuth() {
  showModal("authModal");
}

function openRoleSelection() {
  closeModal("authModal");
  showModal("roleModal");
}

function openRequest() {
  showModal("requestModal");
}


// ========================================
// NOTIFICATION
// ========================================

function showNotification(message) {
  alert(message);
}


// ========================================
// AUTHENTICATION
// ========================================

// SIGN IN
async function signInUser() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (!emailInput || !passwordInput) {
    showNotification("Login form not found.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showNotification("Please enter your email and password.");
    return;
  }

  showNotification("Signing you in...");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error(error);
    showNotification(error.message);
    return;
  }

  if (!data.user) {
    showNotification("Unable to sign in.");
    return;
  }

  await routeUser(data.user.id);
}


// ========================================
// SIGN UP
// ========================================

async function signUpUser() {
  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");

  if (!nameInput || !emailInput || !passwordInput) {
    showNotification("Sign-up form not found.");
    return;
  }

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!name || !email || !password) {
    showNotification("Please complete all fields.");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters.");
    return;
  }

  // Role selected from the role selection screen
  const selectedRole =
    localStorage.getItem("caatelink_selected_role");

  if (!selectedRole) {
    showNotification("Please select your account type first.");
    return;
  }

  showNotification("Creating your account...");

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: name
      }
    }
  });

  if (error) {
    console.error(error);
    showNotification(error.message);
    return;
  }

  if (!data.user) {
    showNotification("Account could not be created.");
    return;
  }

  // Save the selected role
  const { error: roleError } = await supabaseClient
    .from("user_roles")
    .insert({
      user_id: data.user.id,
      role: selectedRole
    });

  if (roleError) {
    console.error(roleError);

    showNotification(
      "Account created, but your account type could not be saved. Please contact CAATELINK support."
    );

    return;
  }

  // Email confirmation may be enabled in Supabase.
  if (!data.session) {
    showNotification(
      "Account created successfully. Please check your email and confirm your account before signing in."
    );

    closeModal("authModal");
    localStorage.removeItem("caatelink_selected_role");

    return;
  }

  localStorage.removeItem("caatelink_selected_role");

  await routeUser(data.user.id);
}


// ========================================
// ROLE SELECTION
// ========================================

function selectRole(role) {
  const allowedRoles = [
    "customer",
    "professional",
    "apprentice",
    "store"
  ];

  if (!allowedRoles.includes(role)) {
    showNotification("Invalid account type.");
    return;
  }

  localStorage.setItem(
    "caatelink_selected_role",
    role
  );

  closeModal("roleModal");

  showAuthSignUp();
}


// ========================================
// SHOW SIGN-UP FORM
// ========================================

function showAuthSignUp() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.style.display = "none";
  }

  if (signupForm) {
    signupForm.style.display = "block";
  }

  showModal("authModal");
}


// ========================================
// SHOW LOGIN FORM
// ========================================

function showAuthLogin() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.style.display = "none";
  }

  if (loginForm) {
    loginForm.style.display = "block";
  }

  showModal("authModal");
}


// ========================================
// GET USER ROLE
// ========================================

async function getUserRole(userId) {
  const { data, error } = await supabaseClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Role error:", error);
    return null;
  }

  return data ? data.role : null;
}


// ========================================
// ROUTE USER TO DASHBOARD
// ========================================

async function routeUser(userId) {
  const role = await getUserRole(userId);

  if (!role) {
    showNotification(
      "Your account type has not been set yet."
    );

    return;
  }

  localStorage.setItem(
    "caatelink_user_role",
    role
  );

  if (role === "customer") {
    window.location.href = "customer-dashboard.html";
  }

  else if (role === "professional") {
    window.location.href = "professional-dashboard.html";
  }

  else if (role === "apprentice") {
    window.location.href = "apprentice-dashboard.html";
  }

  else if (role === "store") {
    window.location.href = "store-dashboard.html";
  }

  else {
    showNotification("Unknown account type.");
  }
}


// ========================================
// CHECK EXISTING SESSION
// ========================================

async function checkExistingSession() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session || !session.user) {
    return;
  }

  console.log(
    "Logged in user:",
    session.user.email
  );
}


// ========================================
// CLOSE MODALS
// ========================================

document.querySelectorAll(".modal").forEach((modal) => {

  modal.addEventListener("click", function (event) {

    if (event.target === modal) {
      modal.style.display = "none";
    }

  });

});


// ========================================
// ESCAPE KEY
// ========================================

document.addEventListener("keydown", function (event) {

  if (event.key === "Escape") {

    document
      .querySelectorAll(".modal")
      .forEach((modal) => {
        modal.style.display = "none";
      });

  }

});


// ========================================
// START
// ========================================

checkExistingSession();