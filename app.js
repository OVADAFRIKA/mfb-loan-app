const SUPABASE_URL = "https://akfalevsehmeonlhajhp.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzIiwicmVmIjoiYWtmYWxldnNlaG1lb25saGFqaHAiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4ODYzMTkyNSwiZXhwIjoyMTA0MjA3OTI1fQ.nMzx0lWJPI3kdBHpIRK9ACS7039asjTmdyINPLYkv28";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const root = document.getElementById("root");

async function loadApplication() {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    await showDashboard(session.user);
  } else {
    showLogin();
  }
}

function showLogin() {
  root.innerHTML = `
    <div class="login-container">
      <div class="login-card">

        <h1>MFB Loan Appraisal System</h1>

        <p>
          Secure staff login
        </p>

        <form id="loginForm">

          <div class="form-group">
            <label>Email Address</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label>Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            class="primary-btn"
          >
            Sign In
          </button>

          <p id="loginMessage"></p>

        </form>

      </div>
    </div>
  `;

  document
    .getElementById("loginForm")
    .addEventListener("submit", login);
}

async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("loginMessage");

  message.textContent = "Signing in...";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  await showDashboard(data.user);
}

async function showDashboard(authUser) {

  const { data: user, error } = await supabase
    .from("users")
    .select(`
      id,
      staff_id,
      full_name,
      email,
      role,
      status
    `)
    .eq("id", authUser.id)
    .single();

  if (error) {
    root.innerHTML = `
      <div class="login-container">
        <div class="login-card">

          <h1>Account Error</h1>

          <p>
            Your authentication account was found,
            but your staff profile could not be loaded.
          </p>

          <p>
            ${error.message}
          </p>

          <button
            class="primary-btn"
            onclick="logout()"
          >
            Sign Out
          </button>

        </div>
      </div>
    `;

    return;
  }

  if (user.status !== "active") {
    await supabase.auth.signOut();

    root.innerHTML = `
      <div class="login-container">
        <div class="login-card">

          <h1>Account Inactive</h1>

          <p>
            Your staff account is currently inactive.
            Please contact the administrator.
          </p>

        </div>
      </div>
    `;

    return;
  }

  root.innerHTML = `
    <div class="app-header">

      <h1>MFB Loan Appraisal System</h1>

      <div>
        ${user.full_name}
        &nbsp; | &nbsp;
        ${formatRole(user.role)}

        <button
          class="secondary-btn"
          onclick="logout()"
          style="margin-left:15px;"
        >
          Sign Out
        </button>
      </div>

    </div>

    <div class="app-container">

      <aside class="sidebar">

        <button class="active">
          Dashboard
        </button>

        <button>
          Customers
        </button>

        <button>
          New Customer
        </button>

        <button>
          Loan Applications
        </button>

        <button>
          New Loan
        </button>

        <button>
          Credit Appraisal
        </button>

        <button>
          Approvals
        </button>

        <button>
          Portfolio
        </button>

        <button>
          Reports
        </button>

      </aside>

      <main class="main-content">

        <h2>Welcome, ${user.full_name}</h2>

        <p style="margin:8px 0 25px;">
          Staff ID: ${user.staff_id}
          &nbsp; | &nbsp;
          Role: ${formatRole(user.role)}
        </p>

        <div class="dashboard-grid">

          <div class="stat-card">
            <h3>Customers</h3>
            <div class="value" id="customerCount">
              -
            </div>
          </div>

          <div class="stat-card">
            <h3>Loan Applications</h3>
            <div class="value" id="loanCount">
              -
            </div>
          </div>

          <div class="stat-card">
            <h3>Under Review</h3>
            <div class="value" id="reviewCount">
              -
            </div>
          </div>

          <div class="stat-card">
            <h3>Approved</h3>
            <div class="value" id="approvedCount">
              -
            </div>
          </div>

        </div>

        <div class="card">

          <h2>Loan Officer Dashboard</h2>

          <p style="margin-top:10px;">
            Your secure MFB loan appraisal workspace is ready.
          </p>

        </div>

      </main>

    </div>
  `;

  await loadDashboardStatistics(user);
}

async function loadDashboardStatistics(user) {

  const { count: customerCount } = await supabase
    .from("customers")
    .select("*", {
      count: "exact",
      head: true
    });

  const { count: loanCount } = await supabase
    .from("loan_applications")
    .select("*", {
      count: "exact",
      head: true
    });

  const { count: reviewCount } = await supabase
    .from("loan_applications")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("status", "under_review");

  const { count: approvedCount } = await supabase
    .from("loan_applications")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("status", "approved");

  document.getElementById("customerCount").textContent =
    customerCount ?? 0;

  document.getElementById("loanCount").textContent =
    loanCount ?? 0;

  document.getElementById("reviewCount").textContent =
    reviewCount ?? 0;

  document.getElementById("approvedCount").textContent =
    approvedCount ?? 0;
}

function formatRole(role) {

  const roles = {
    loan_officer: "Loan Officer",
    supervisor: "Supervisor",
    management: "Management",
    administrator: "Administrator"
  };

  return roles[role] || role;
}

async function logout() {

  await supabase.auth.signOut();

  showLogin();
}

supabase.auth.onAuthStateChange((event, session) => {

  if (event === "SIGNED_OUT") {
    showLogin();
  }

});

loadApplication();
