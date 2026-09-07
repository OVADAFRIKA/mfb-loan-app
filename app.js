const SUPABASE_URL = "https://akfalevsehmeonlhajhp.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_taM1rWJIBmXvGmm-eXDtNA_ACwHVdGh";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const root = document.getElementById("root");

async function loadApplication() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

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

        <p>Secure staff login</p>

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

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
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

 const { data: users, error } = await supabaseClient
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
  .limit(1);

const user = users?.[0];

if (error || !user) {

  root.innerHTML = `
    <div class="login-container">

      <div class="login-card">

        <h1>Account Error</h1>

        <p>
          Your authentication account was found,
          but your staff profile could not be loaded.
        </p>

        <p>
          ${error ? error.message : "No matching staff profile was found."}
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

    await supabaseClient.auth.signOut();

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

        <button onclick="showCustomers()">
  Customers
</button>

       <button onclick="showCustomerForm()">
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
            <div class="value" id="customerCount">-</div>
          </div>

          <div class="stat-card">
            <h3>Loan Applications</h3>
            <div class="value" id="loanCount">-</div>
          </div>

          <div class="stat-card">
            <h3>Under Review</h3>
            <div class="value" id="reviewCount">-</div>
          </div>

          <div class="stat-card">
            <h3>Approved</h3>
            <div class="value" id="approvedCount">-</div>
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

  await loadDashboardStatistics();
}

async function loadDashboardStatistics() {

  const { count: customerCount } =
    await supabaseClient
      .from("customers")
      .select("*", {
        count: "exact",
        head: true
      });

  const { count: loanCount } =
    await supabaseClient
      .from("loan_applications")
      .select("*", {
        count: "exact",
        head: true
      });

  const { count: reviewCount } =
    await supabaseClient
      .from("loan_applications")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("status", "under_review");

  const { count: approvedCount } =
    await supabaseClient
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
async function showCustomers() {

  const { data: customers, error } = await supabaseClient
    .from("customers")
    .select(`
      id,
      customer_code,
      customer_type,
      full_name,
      gender,
      primary_phone,
      email,
      state,
      lga,
      customer_status
    `)
    .order("created_at", { ascending: false });

  if (error) {
    root.innerHTML = `
      <div class="main-content">
        <h2>Customers</h2>

        <div class="card">
          <p>Unable to load customers.</p>
          <p>${error.message}</p>
        </div>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="app-header">

      <h1>MFB Loan Appraisal System</h1>

      <div>
        Customer Management

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

        <button onclick="showDashboardAfterNavigation()">
          Dashboard
        </button>

        <button class="active">
          Customers
        </button>

        <button onclick="showCustomerForm()">
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

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">

          <div>
            <h2>Customers</h2>

            <p style="margin-top:6px;">
              Customer registration and management
            </p>
          </div>

          <button
            class="primary-btn"
            onclick="showCustomerForm()"
          >
            + New Customer
          </button>

        </div>

        <div class="card">

          ${
            customers && customers.length > 0
              ? `
                <div style="overflow-x:auto;">

                  <table style="width:100%; border-collapse:collapse;">

                    <thead>
                      <tr>
                        <th style="text-align:left; padding:12px; border-bottom:1px solid #ddd;">
                          Customer Code
                        </th>

                        <th style="text-align:left; padding:12px; border-bottom:1px solid #ddd;">
                          Full Name
                        </th>

                        <th style="text-align:left; padding:12px; border-bottom:1px solid #ddd;">
                          Phone
                        </th>

                        <th style="text-align:left; padding:12px; border-bottom:1px solid #ddd;">
                          State
                        </th>

                        <th style="text-align:left; padding:12px; border-bottom:1px solid #ddd;">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      ${customers.map(customer => `
                        <tr>

                          <td style="padding:12px; border-bottom:1px solid #eee;">
                            ${customer.customer_code || "-"}
                          </td>

                          <td style="padding:12px; border-bottom:1px solid #eee;">
                            ${customer.full_name}
                          </td>

                          <td style="padding:12px; border-bottom:1px solid #eee;">
                            ${customer.primary_phone || "-"}
                          </td>

                          <td style="padding:12px; border-bottom:1px solid #eee;">
                            ${customer.state || "-"}
                          </td>

                          <td style="padding:12px; border-bottom:1px solid #eee;">
                            ${customer.customer_status || "-"}
                          </td>

                        </tr>
                      `).join("")}

                    </tbody>

                  </table>

                </div>
              `
              : `
                <div style="padding:30px; text-align:center;">
                  <h3>No customers registered yet</h3>

                  <p style="margin:10px 0 20px;">
                    Start by registering your first customer.
                  </p>

                  <button
                    class="primary-btn"
                    onclick="showCustomerForm()"
                  >
                    + Register Customer
                  </button>
                </div>
              `
          }

        </div>

      </main>

    </div>
  `;
}
function showDashboardAfterNavigation() {

  loadApplication();

}
async function logout() {

  await supabaseClient.auth.signOut();

  showLogin();
}

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (event === "SIGNED_OUT") {
      showLogin();
    }

  }
);

loadApplication();
