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
async function async function showCustomers() {

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

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        ">

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

                  <table style="
                    width:100%;
                    border-collapse:collapse;
                  ">

                    <thead>
                      <tr>

                        <th style="
                          text-align:left;
                          padding:12px;
                          border-bottom:1px solid #ddd;
                        ">
                          Customer Code
                        </th>

                        <th style="
                          text-align:left;
                          padding:12px;
                          border-bottom:1px solid #ddd;
                        ">
                          Full Name
                        </th>

                        <th style="
                          text-align:left;
                          padding:12px;
                          border-bottom:1px solid #ddd;
                        ">
                          Phone
                        </th>

                        <th style="
                          text-align:left;
                          padding:12px;
                          border-bottom:1px solid #ddd;
                        ">
                          State
                        </th>

                        <th style="
                          text-align:left;
                          padding:12px;
                          border-bottom:1px solid #ddd;
                        ">
                          Status
                        </th>

                        <th style="
                          text-align:left;
                          padding:12px;
                          border-bottom:1px solid #ddd;
                        ">
                          Action
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      ${customers.map(customer => `
                        <tr>

                          <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                          ">
                            ${customer.customer_code || "-"}
                          </td>

                          <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                          ">
                            ${customer.full_name || "-"}
                          </td>

                          <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                          ">
                            ${customer.primary_phone || "-"}
                          </td>

                          <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                          ">
                            ${customer.state || "-"}
                          </td>

                          <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                          ">
                            ${customer.customer_status || "-"}
                          </td>

                          <td style="
                            padding:12px;
                            border-bottom:1px solid #eee;
                          ">

                            <button
                              class="primary-btn"
                              onclick="showCustomerProfile('${customer.id}')"
                            >
                              View Profile
                            </button>

                          </td>

                        </tr>
                      `).join("")}

                    </tbody>

                  </table>

                </div>
              `
              : `
                <div style="
                  padding:30px;
                  text-align:center;
                ">

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
async function showCustomerProfile(customerId) {

  const { data: customer, error } = await supabaseClient
    .from("customers")
    .select(`
      id,
      customer_code,
      customer_type,
      full_name,
      other_previous_name,
      gender,
      date_of_birth,
      marital_status,
      dependants,
      nationality,
      primary_phone,
      alternative_phone,
      email,
      residential_address,
      state,
      lga,
      landmark,
      years_at_address,
      residence_status,
      customer_status,
      created_at
    `)
    .eq("id", customerId)
    .single();

  if (error || !customer) {

    root.innerHTML = `
      <div class="main-content">

        <div class="card">

          <h2>Customer Profile</h2>

          <p style="margin-top:10px;">
            Unable to load customer profile.
          </p>

          <p style="margin-top:8px;">
            ${error ? error.message : "Customer not found."}
          </p>

          <button
            class="secondary-btn"
            onclick="showCustomers()"
            style="margin-top:20px;"
          >
            Back to Customers
          </button>

        </div>

      </div>
    `;

    return;
  }

  root.innerHTML = `

    <div class="app-header">

      <h1>MFB Loan Appraisal System</h1>

      <div>

        Customer Profile

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

        <button
          class="active"
          onclick="showCustomers()"
        >
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

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        ">

          <div>

            <h2>${customer.full_name}</h2>

            <p style="margin-top:6px;">
              Customer Code:
              <strong>${customer.customer_code}</strong>
            </p>

          </div>

          <button
            class="secondary-btn"
            onclick="showCustomers()"
          >
            ← Back to Customers
          </button>

        </div>


        <!-- CUSTOMER SUMMARY -->

        <div class="card">

          <h3>Customer Information</h3>

          <div class="form-grid" style="margin-top:20px;">

            <div class="form-group">
              <label>Customer Code</label>
              <input
                type="text"
                value="${customer.customer_code || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Customer Type</label>
              <input
                type="text"
                value="${customer.customer_type || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value="${customer.full_name || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Previous Name</label>
              <input
                type="text"
                value="${customer.other_previous_name || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Gender</label>
              <input
                type="text"
                value="${customer.gender || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Date of Birth</label>
              <input
                type="text"
                value="${customer.date_of_birth || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Marital Status</label>
              <input
                type="text"
                value="${customer.marital_status || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Dependants</label>
              <input
                type="text"
                value="${customer.dependants ?? 0}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Nationality</label>
              <input
                type="text"
                value="${customer.nationality || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Primary Phone</label>
              <input
                type="text"
                value="${customer.primary_phone || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Alternative Phone</label>
              <input
                type="text"
                value="${customer.alternative_phone || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input
                type="text"
                value="${customer.email || "-"}"
                readonly
              />
            </div>

            <div
              class="form-group"
              style="grid-column:1/-1;"
            >
              <label>Residential Address</label>

              <textarea
                rows="3"
                readonly
              >${customer.residential_address || "-"}</textarea>
            </div>

            <div class="form-group">
              <label>State</label>
              <input
                type="text"
                value="${customer.state || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>LGA</label>
              <input
                type="text"
                value="${customer.lga || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Landmark</label>
              <input
                type="text"
                value="${customer.landmark || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Years at Address</label>
              <input
                type="text"
                value="${customer.years_at_address ?? 0}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Residence Status</label>
              <input
                type="text"
                value="${customer.residence_status || "-"}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Customer Status</label>
              <input
                type="text"
                value="${customer.customer_status || "-"}"
                readonly
              />
            </div>

          </div>

        </div>


        <!-- CUSTOMER MODULES -->

        <div class="card" style="margin-top:20px;">

          <h3>Customer Credit File</h3>

          <p style="margin-top:8px; margin-bottom:20px;">
            Complete the customer's credit file through the sections below.
          </p>

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
            gap:12px;
          ">

            <button
              class="secondary-btn"
              onclick="alert('KYC module will be activated next.')"
            >
              KYC
            </button>

            <button
              class="secondary-btn"
              onclick="alert('Next of Kin module will be activated next.')"
            >
              Next of Kin
            </button>

            <button
              class="secondary-btn"
              onclick="alert('Business module will be activated next.')"
            >
              Business
            </button>

            <button
              class="secondary-btn"
              onclick="alert('Guarantors module will be activated next.')"
            >
              Guarantors
            </button>

            <button
              class="secondary-btn"
              onclick="alert('Loans module will be activated next.')"
            >
              Loans
            </button>

          </div>

        </div>

      </main>

    </div>
  `;
}
function showCustomerForm() {

  root.innerHTML = `
    <div class="app-header">
      <h1>MFB Loan Appraisal System</h1>

      <div>
        New Customer
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

        <button onclick="showCustomers()">
          Customers
        </button>

        <button class="active">
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

        <h2>Customer Registration</h2>

        <p style="margin:8px 0 25px;">
          Register a new customer into the MFB loan appraisal system.
        </p>

        <div class="card">

          <form id="customerForm">

            <h3>Customer Information</h3>

            <div class="form-grid">

              <div class="form-group">
                <label>Customer Type *</label>
                <select id="customer_type" required>
                  <option value="">Select customer type</option>
                  <option value="Individual">Individual</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div class="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  id="full_name"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div class="form-group">
                <label>Previous Name</label>
                <input
                  type="text"
                  id="other_previous_name"
                  placeholder="Previous name, if applicable"
                />
              </div>

              <div class="form-group">
                <label>Gender *</label>
                <select id="gender" required>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div class="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  id="date_of_birth"
                  required
                />
              </div>

              <div class="form-group">
                <label>Marital Status</label>
                <select id="marital_status">
                  <option value="">Select marital status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div class="form-group">
                <label>Number of Dependants</label>
                <input
                  type="number"
                  id="dependants"
                  min="0"
                  value="0"
                />
              </div>

              <div class="form-group">
                <label>Nationality</label>
                <input
                  type="text"
                  id="nationality"
                  value="Nigerian"
                />
              </div>

              <div class="form-group">
                <label>Primary Phone *</label>
                <input
                  type="tel"
                  id="primary_phone"
                  placeholder="080XXXXXXXX"
                  required
                />
              </div>

              <div class="form-group">
                <label>Alternative Phone</label>
                <input
                  type="tel"
                  id="alternative_phone"
                  placeholder="080XXXXXXXX"
                />
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="customer@email.com"
                />
              </div>

              <div class="form-group" style="grid-column:1/-1;">
                <label>Residential Address *</label>
                <textarea
                  id="residential_address"
                  rows="3"
                  placeholder="Enter residential address"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label>State *</label>
                <input
                  type="text"
                  id="state"
                  placeholder="Enter state"
                  required
                />
              </div>

              <div class="form-group">
                <label>LGA *</label>
                <input
                  type="text"
                  id="lga"
                  placeholder="Enter LGA"
                  required
                />
              </div>

              <div class="form-group">
                <label>Landmark</label>
                <input
                  type="text"
                  id="landmark"
                  placeholder="Nearest landmark"
                />
              </div>

              <div class="form-group">
                <label>Years at Address</label>
                <input
                  type="number"
                  id="years_at_address"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 3"
                />
              </div>

              <div class="form-group">
                <label>Residence Status</label>
                <select id="residence_status">
                  <option value="">Select status</option>
                  <option value="Owned">Owned</option>
                  <option value="Rented">Rented</option>
                  <option value="Family House">Family House</option>
                  <option value="Employer Provided">Employer Provided</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>

            <div style="margin-top:25px;">

              <button
                type="submit"
                class="primary-btn"
              >
                Save Customer
              </button>

              <button
                type="button"
                class="secondary-btn"
                onclick="showCustomers()"
                style="margin-left:10px;"
              >
                Cancel
              </button>

            </div>

            <p
              id="customerMessage"
              style="margin-top:15px;"
            ></p>

          </form>

        </div>

      </main>

    </div>
  `;

  document
    .getElementById("customerForm")
    .addEventListener("submit", saveCustomer);
}


async function saveCustomer(event) {

  event.preventDefault();

  const message =
    document.getElementById("customerMessage");

  message.textContent = "Saving customer...";

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();
console.log("SESSION:", session);
console.log("AUTH USER ID:", session?.user?.id);
  if (!session) {
    message.textContent =
      "Your session has expired. Please sign in again.";
    return;
  }

  const customerCode =
    "CUS-" + Date.now().toString().slice(-8);

  const customerData = {

    customer_code: customerCode,

    customer_type:
      document.getElementById("customer_type").value,

    full_name:
      document.getElementById("full_name").value.trim(),

    other_previous_name:
      document.getElementById("other_previous_name").value.trim() || null,

    gender:
      document.getElementById("gender").value,

    date_of_birth:
      document.getElementById("date_of_birth").value,

    marital_status:
      document.getElementById("marital_status").value || null,

    dependants:
      Number(document.getElementById("dependants").value || 0),

    nationality:
      document.getElementById("nationality").value.trim() || "Nigerian",

    primary_phone:
      document.getElementById("primary_phone").value.trim(),

    alternative_phone:
      document.getElementById("alternative_phone").value.trim() || null,

    email:
      document.getElementById("email").value.trim() || null,

    residential_address:
      document.getElementById("residential_address").value.trim(),

    state:
      document.getElementById("state").value.trim(),

    lga:
      document.getElementById("lga").value.trim(),

    landmark:
      document.getElementById("landmark").value.trim() || null,

    years_at_address:
      Number(document.getElementById("years_at_address").value || 0),

    residence_status:
      document.getElementById("residence_status").value || null,

    customer_status: "active"

  };

  const { data, error } =
    await supabaseClient
      .from("customers")
      .insert([customerData])
      .select()
      .single();

  if (error) {

    message.textContent =
      "Unable to save customer: " + error.message;

    return;
  }

  message.textContent =
    "Customer registered successfully. Customer Code: " +
    data.customer_code;

  setTimeout(() => {
    showCustomers();
  }, 1200);
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
