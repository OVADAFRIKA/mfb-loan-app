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

       <button onclick="showLoanApplications()">
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

        <button onclick="showLoanApplications()">
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
  onclick="showKYC('${customer.id}')"
>
  KYC
</button>

           <button
  class="secondary-btn"
  onclick="showNextOfKin('${customer.id}')"
>
  Next of Kin
</button>

           <button
  class="secondary-btn"
  onclick="showBusiness('${customer.id}')"
>
  Business
</button>

            <button
  class="secondary-btn"
  onclick="showGuarantors('${customer.id}')"
>
  Guarantors
</button>
<button
  class="primary-btn"
  onclick="showNewLoan('${customer.id}')"
>
  New Loan
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
async function showKYC(customerId) {

  const { data: customer, error: customerError } =
    await supabaseClient
      .from("customers")
      .select(`
        id,
        customer_code,
        full_name
      `)
      .eq("id", customerId)
      .single();

  if (customerError || !customer) {

    root.innerHTML = `
      <div class="main-content">

        <div class="card">

          <h2>KYC</h2>

          <p style="margin-top:10px;">
            Unable to load customer information.
          </p>

          <p style="margin-top:8px;">
            ${
              customerError
                ? customerError.message
                : "Customer not found."
            }
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


  const { data: kyc, error: kycError } =
    await supabaseClient
      .from("customer_kyc")
      .select(`
        id,
        bvn,
        nin,
        id_type,
        id_number,
        id_issue_date,
        id_expiry_date,
        verification_status,
        verification_date,
        verified_by
      `)
      .eq("customer_id", customerId)
      .maybeSingle();


  root.innerHTML = `

    <div class="app-header">

      <h1>MFB Loan Appraisal System</h1>

      <div>

        KYC Verification

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

            <h2>KYC Verification</h2>

            <p style="margin-top:6px;">
              Customer:
              <strong>${customer.full_name}</strong>
              &nbsp; | &nbsp;
              Customer Code:
              <strong>${customer.customer_code}</strong>
            </p>

          </div>

          <button
            class="secondary-btn"
            onclick="showCustomerProfile('${customer.id}')"
          >
            ← Back to Profile
          </button>

        </div>


        <div class="card">

          <h3>Identity Information</h3>

          <div class="form-grid" style="margin-top:20px;">

            <div class="form-group">

              <label>BVN</label>

              <input
                type="text"
                id="kyc_bvn"
                placeholder="Enter BVN"
                maxlength="11"
                value="${kyc?.bvn || ""}"
              />

            </div>


            <div class="form-group">

              <label>NIN</label>

              <input
                type="text"
                id="kyc_nin"
                placeholder="Enter NIN"
                maxlength="11"
                value="${kyc?.nin || ""}"
              />

            </div>


            <div class="form-group">

              <label>Identification Type</label>

              <select id="kyc_id_type">

                <option value="">
                  Select identification type
                </option>

                <option
                  value="National ID"
                  ${kyc?.id_type === "National ID" ? "selected" : ""}
                >
                  National ID
                </option>

                <option
                  value="International Passport"
                  ${kyc?.id_type === "International Passport" ? "selected" : ""}
                >
                  International Passport
                </option>

                <option
                  value="Driver's Licence"
                  ${kyc?.id_type === "Driver's Licence" ? "selected" : ""}
                >
                  Driver's Licence
                </option>

                <option
                  value="Voter's Card"
                  ${kyc?.id_type === "Voter's Card" ? "selected" : ""}
                >
                  Voter's Card
                </option>

              </select>

            </div>


            <div class="form-group">

              <label>Identification Number</label>

              <input
                type="text"
                id="kyc_id_number"
                placeholder="Enter ID number"
                value="${kyc?.id_number || ""}"
              />

            </div>


            <div class="form-group">

              <label>ID Issue Date</label>

              <input
                type="date"
                id="kyc_id_issue_date"
                value="${kyc?.id_issue_date || ""}"
              />

            </div>


            <div class="form-group">

              <label>ID Expiry Date</label>

              <input
                type="date"
                id="kyc_id_expiry_date"
                value="${kyc?.id_expiry_date || ""}"
              />

            </div>


            <div class="form-group">

              <label>Verification Status</label>

              <select id="kyc_verification_status">

                <option
                  value="pending"
                  ${
                    !kyc ||
                    kyc.verification_status === "pending"
                      ? "selected"
                      : ""
                  }
                >
                  Pending
                </option>

                <option
                  value="verified"
                  ${
                    kyc?.verification_status === "verified"
                      ? "selected"
                      : ""
                  }
                >
                  Verified
                </option>

                <option
                  value="failed"
                  ${
                    kyc?.verification_status === "failed"
                      ? "selected"
                      : ""
                  }
                >
                  Failed
                </option>

              </select>

            </div>

          </div>


          <div style="margin-top:25px;">

            <button
              type="button"
              class="primary-btn"
              onclick="saveKYC('${customer.id}', '${kyc?.id || ""}')"
            >
              Save KYC
            </button>

            <button
              type="button"
              class="secondary-btn"
              onclick="showCustomerProfile('${customer.id}')"
              style="margin-left:10px;"
            >
              Cancel
            </button>

          </div>


          <p
            id="kycMessage"
            style="margin-top:15px;"
          ></p>

        </div>


        ${
          kyc
            ? `
              <div class="card" style="margin-top:20px;">

                <h3>KYC Record</h3>

                <p style="margin-top:10px;">
                  Current verification status:
                  <strong>
                    ${kyc.verification_status || "Pending"}
                  </strong>
                </p>

                ${
                  kyc.verification_date
                    ? `
                      <p style="margin-top:6px;">
                        Verification Date:
                        ${new Date(
                          kyc.verification_date
                        ).toLocaleString()}
                      </p>
                    `
                    : ""
                }

              </div>
            `
            : ""
        }

      </main>

    </div>

  `;
}
async function saveKYC(customerId, kycId) {

  const message =
    document.getElementById("kycMessage");

  message.textContent = "Saving KYC...";


  const {
    data: { session }
  } = await supabaseClient.auth.getSession();


  if (!session) {

    message.textContent =
      "Your session has expired. Please sign in again.";

    return;
  }


  const verificationStatus =
    document.getElementById(
      "kyc_verification_status"
    ).value;


  const kycData = {

    customer_id: customerId,

    bvn:
      document.getElementById("kyc_bvn").value.trim() || null,

    nin:
      document.getElementById("kyc_nin").value.trim() || null,

    id_type:
      document.getElementById("kyc_id_type").value || null,

    id_number:
      document.getElementById("kyc_id_number").value.trim() || null,

    id_issue_date:
      document.getElementById("kyc_id_issue_date").value || null,

    id_expiry_date:
      document.getElementById("kyc_id_expiry_date").value || null,

    verification_status:
      verificationStatus,

    verification_date:
      verificationStatus === "verified"
        ? new Date().toISOString()
        : null,

    verified_by:
      verificationStatus === "verified"
        ? session.user.id
        : null

  };


  let result;


  if (kycId) {

    result = await supabaseClient
      .from("customer_kyc")
      .update(kycData)
      .eq("id", kycId)
      .select()
      .single();

  } else {

    result = await supabaseClient
      .from("customer_kyc")
      .insert([kycData])
      .select()
      .single();

  }


  if (result.error) {

    message.textContent =
      "Unable to save KYC: " +
      result.error.message;

    return;
  }


  message.textContent =
    "KYC information saved successfully.";


  setTimeout(() => {

    showCustomerProfile(customerId);

  }, 1000);

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
async function showNextOfKin(customerId) {
  try {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    // Get customer information
    const { data: customer, error: customerError } = await supabaseClient
      .from("customers")
      .select("id, customer_code, full_name")
      .eq("id", customerId)
      .single();

    if (customerError) {
      throw customerError;
    }

    // Get existing next of kin record
    const { data: nextOfKin, error: nokError } = await supabaseClient
      .from("next_of_kin")
      .select(`
        id,
        customer_id,
        name,
        address,
        phone_number,
        relationship
      `)
      .eq("customer_id", customerId)
      .maybeSingle();

    if (nokError) {
      throw nokError;
    }

    document.getElementById("root").innerHTML = `
      <div class="app-container">

        <div class="page-header">
          <div>
            <h1>Next of Kin</h1>
            <p>
              Customer: <strong>${customer.full_name}</strong>
              (${customer.customer_code})
            </p>
          </div>
        </div>

        <div class="card">

          <h2>Next of Kin Information</h2>

          <div class="form-grid">

            <div class="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                id="nok_name"
                value="${nextOfKin?.name || ""}"
                placeholder="Enter full name"
              />
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                id="nok_phone"
                value="${nextOfKin?.phone_number || ""}"
                placeholder="Enter phone number"
              />
            </div>

            <div class="form-group">
              <label>Relationship</label>
              <select id="nok_relationship">
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Address</label>
              <textarea
                id="nok_address"
                rows="4"
                placeholder="Enter next of kin address"
              >${nextOfKin?.address || ""}</textarea>
            </div>

          </div>

          <div style="margin-top:20px; display:flex; gap:10px;">

            <button
              class="primary-btn"
              onclick="saveNextOfKin(
                '${customerId}',
                '${nextOfKin?.id || ""}'
              )"
            >
              Save Next of Kin
            </button>

            <button
              class="secondary-btn"
              onclick="showCustomerProfile('${customerId}')"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    `;

    // Set existing relationship after rendering
    if (nextOfKin?.relationship) {
      document.getElementById("nok_relationship").value =
        nextOfKin.relationship;
    }

  } catch (error) {
    console.error("Next of Kin error:", error);

    document.getElementById("root").innerHTML = `
      <div class="card">
        <h2>Unable to load Next of Kin</h2>
        <p>${error.message}</p>

        <button
          class="secondary-btn"
          onclick="showCustomerProfile('${customerId}')"
        >
          Back to Customer Profile
        </button>
      </div>
    `;
  }
}


async function saveNextOfKin(customerId, nextOfKinId) {
  try {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    const name = document.getElementById("nok_name").value.trim();
    const phone = document.getElementById("nok_phone").value.trim();
    const relationship =
      document.getElementById("nok_relationship").value;
    const address =
      document.getElementById("nok_address").value.trim();

    if (!name) {
      alert("Please enter the Next of Kin name.");
      return;
    }

    const nextOfKinData = {
      customer_id: customerId,
      name: name,
      phone_number: phone || null,
      relationship: relationship || null,
      address: address || null
    };

    let result;

    if (nextOfKinId) {

      result = await supabaseClient
        .from("next_of_kin")
        .update(nextOfKinData)
        .eq("id", nextOfKinId)
        .eq("customer_id", customerId)
        .select()
        .single();

    } else {

      result = await supabaseClient
        .from("next_of_kin")
        .insert([nextOfKinData])
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    alert("Next of Kin saved successfully.");

    showCustomerProfile(customerId);

  } catch (error) {
    console.error("Save Next of Kin error:", error);

    alert(
      "Unable to save Next of Kin: " +
      error.message
    );
  }
}
async function showBusiness(customerId) {
  try {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    // Get customer information
    const { data: customer, error: customerError } =
      await supabaseClient
        .from("customers")
        .select("id, customer_code, full_name")
        .eq("id", customerId)
        .single();

    if (customerError) {
      throw customerError;
    }

    // Get existing business record
    const { data: business, error: businessError } =
      await supabaseClient
        .from("businesses")
        .select(`
          id,
          customer_id,
          business_name,
          nature_of_business,
          business_type,
          sector,
          business_address,
          state,
          lga,
          landmark,
          date_business_started,
          premises_status,
          time_at_current_premises,
          number_of_employees,
          number_of_locations
        `)
        .eq("customer_id", customerId)
        .maybeSingle();

    if (businessError) {
      throw businessError;
    }

    document.getElementById("root").innerHTML = `
      <div class="app-container">

        <div class="page-header">
          <div>
            <h1>Business Information</h1>
            <p>
              Customer:
              <strong>${customer.full_name}</strong>
              (${customer.customer_code})
            </p>
          </div>
        </div>

        <div class="card">

          <h2>Business Details</h2>

          <div class="form-grid">

            <div class="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                id="business_name"
                value="${business?.business_name || ""}"
                placeholder="Enter business name"
              />
            </div>

            <div class="form-group">
              <label>Nature of Business</label>
              <input
                type="text"
                id="nature_of_business"
                value="${business?.nature_of_business || ""}"
                placeholder="e.g. Trading, Manufacturing, Services"
              />
            </div>

            <div class="form-group">
              <label>Business Type</label>
              <select id="business_type">
                <option value="">Select business type</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Limited Liability Company">Limited Liability Company</option>
                <option value="Cooperative">Cooperative</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Sector</label>
              <select id="sector">
                <option value="">Select sector</option>
                <option value="Trading">Trading</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Services">Services</option>
                <option value="Transportation">Transportation</option>
                <option value="Food & Hospitality">Food & Hospitality</option>
                <option value="Construction">Construction</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Business Address</label>
              <input
                type="text"
                id="business_address"
                value="${business?.business_address || ""}"
                placeholder="Enter business address"
              />
            </div>

            <div class="form-group">
              <label>State</label>
              <input
                type="text"
                id="business_state"
                value="${business?.state || ""}"
                placeholder="Enter state"
              />
            </div>

            <div class="form-group">
              <label>LGA</label>
              <input
                type="text"
                id="business_lga"
                value="${business?.lga || ""}"
                placeholder="Enter LGA"
              />
            </div>

            <div class="form-group">
              <label>Landmark</label>
              <input
                type="text"
                id="business_landmark"
                value="${business?.landmark || ""}"
                placeholder="Enter nearby landmark"
              />
            </div>

            <div class="form-group">
              <label>Date Business Started</label>
              <input
                type="date"
                id="date_business_started"
                value="${business?.date_business_started || ""}"
              />
            </div>

            <div class="form-group">
              <label>Premises Status</label>
              <select id="premises_status">
                <option value="">Select premises status</option>
                <option value="Owned">Owned</option>
                <option value="Rented">Rented</option>
                <option value="Leased">Leased</option>
                <option value="Family Property">Family Property</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Time at Current Premises</label>
              <input
                type="text"
                id="time_at_current_premises"
                value="${business?.time_at_current_premises || ""}"
                placeholder="e.g. 3 years"
              />
            </div>

            <div class="form-group">
              <label>Number of Employees</label>
              <input
                type="number"
                id="number_of_employees"
                min="0"
                value="${business?.number_of_employees ?? ""}"
                placeholder="Enter number"
              />
            </div>

            <div class="form-group">
              <label>Number of Business Locations</label>
              <input
                type="number"
                id="number_of_locations"
                min="1"
                value="${business?.number_of_locations ?? 1}"
              />
            </div>

          </div>

          <div style="margin-top:20px; display:flex; gap:10px;">

            <button
              class="primary-btn"
              onclick="saveBusiness(
                '${customerId}',
                '${business?.id || ""}'
              )"
            >
              Save Business
            </button>

            <button
              class="secondary-btn"
              onclick="showCustomerProfile('${customerId}')"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    `;

    // Set existing select values
    if (business?.business_type) {
      document.getElementById("business_type").value =
        business.business_type;
    }

    if (business?.sector) {
      document.getElementById("sector").value =
        business.sector;
    }

    if (business?.premises_status) {
      document.getElementById("premises_status").value =
        business.premises_status;
    }

  } catch (error) {
    console.error("Business error:", error);

    document.getElementById("root").innerHTML = `
      <div class="card">
        <h2>Unable to load Business Information</h2>
        <p>${error.message}</p>

        <button
          class="secondary-btn"
          onclick="showCustomerProfile('${customerId}')"
        >
          Back to Customer Profile
        </button>
      </div>
    `;
  }
}


async function saveBusiness(customerId, businessId) {
  try {
    const { data: sessionData } =
      await supabaseClient.auth.getSession();

    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    const businessName =
      document.getElementById("business_name").value.trim();

    if (!businessName) {
      alert("Please enter the Business Name.");
      return;
    }

    const businessData = {
      customer_id: customerId,
      business_name: businessName,
      nature_of_business:
        document.getElementById("nature_of_business").value.trim() || null,
      business_type:
        document.getElementById("business_type").value || null,
      sector:
        document.getElementById("sector").value || null,
      business_address:
        document.getElementById("business_address").value.trim() || null,
      state:
        document.getElementById("business_state").value.trim() || null,
      lga:
        document.getElementById("business_lga").value.trim() || null,
      landmark:
        document.getElementById("business_landmark").value.trim() || null,
      date_business_started:
        document.getElementById("date_business_started").value || null,
      premises_status:
        document.getElementById("premises_status").value || null,
      time_at_current_premises:
        document.getElementById("time_at_current_premises").value.trim() || null,
      number_of_employees:
        document.getElementById("number_of_employees").value
          ? Number(document.getElementById("number_of_employees").value)
          : null,
      number_of_locations:
        document.getElementById("number_of_locations").value
          ? Number(document.getElementById("number_of_locations").value)
          : 1
    };

    // Automatically record the authenticated staff member
    businessData.created_by = session.user.id;

    let result;

    if (businessId) {

      result = await supabaseClient
        .from("businesses")
        .update(businessData)
        .eq("id", businessId)
        .eq("customer_id", customerId)
        .select()
        .single();

    } else {

      result = await supabaseClient
        .from("businesses")
        .insert([businessData])
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    alert("Business information saved successfully.");

    showCustomerProfile(customerId);

  } catch (error) {
    console.error("Save Business error:", error);

    alert(
      "Unable to save Business Information: " +
      error.message
    );
  }
}
async function showGuarantors(customerId) {
  try {
    const { data: sessionData } =
      await supabaseClient.auth.getSession();

    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    // Get customer information
    const { data: customer, error: customerError } =
      await supabaseClient
        .from("customers")
        .select("id, customer_code, full_name")
        .eq("id", customerId)
        .single();

    if (customerError) {
      throw customerError;
    }

    // Get existing guarantors for this customer
    const { data: guarantors, error: guarantorError } =
      await supabaseClient
        .from("guarantors")
        .select(`
          id,
          customer_id,
          loan_application_id,
          full_name,
          address,
          phone_number,
          relationship,
          guarantor_number,
          status
        `)
        .eq("customer_id", customerId)
        .order("guarantor_number", { ascending: true });

    if (guarantorError) {
      throw guarantorError;
    }

    const guarantorList = guarantors || [];

    document.getElementById("root").innerHTML = `
      <div class="app-container">

        <div class="page-header">
          <div>
            <h1>Guarantors</h1>
            <p>
              Customer:
              <strong>${customer.full_name}</strong>
              (${customer.customer_code})
            </p>
          </div>
        </div>

        <div class="card">

          <h2>Guarantor Information</h2>

          <p>
            You can add one or more guarantors for this customer.
          </p>

          <div id="guarantor-list">

            ${
              guarantorList.length === 0
                ? `
                  <div style="
                    padding:15px;
                    background:#f8f9fa;
                    border-radius:6px;
                    margin-bottom:20px;
                  ">
                    No guarantor has been added yet.
                  </div>
                `
                : guarantorList.map((guarantor, index) => `
                  <div style="
                    border:1px solid #ddd;
                    border-radius:8px;
                    padding:15px;
                    margin-bottom:15px;
                  ">
                    <h3>
                      Guarantor ${guarantor.guarantor_number || index + 1}
                    </h3>

                    <p>
                      <strong>Name:</strong>
                      ${guarantor.full_name}
                    </p>

                    <p>
                      <strong>Phone:</strong>
                      ${guarantor.phone_number || "Not provided"}
                    </p>

                    <p>
                      <strong>Relationship:</strong>
                      ${guarantor.relationship || "Not provided"}
                    </p>

                    <p>
                      <strong>Address:</strong>
                      ${guarantor.address || "Not provided"}
                    </p>

                    <p>
                      <strong>Status:</strong>
                      ${guarantor.status || "active"}
                    </p>

                    <button
                      class="secondary-btn"
                      onclick="editGuarantor(
                        '${customerId}',
                        '${guarantor.id}'
                      )"
                    >
                      Edit
                    </button>
                  </div>
                `).join("")
            }

          </div>

          <hr style="margin:25px 0;">

          <h2>Add Guarantor</h2>

          <div class="form-grid">

            <div class="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                id="guarantor_name"
                placeholder="Enter guarantor full name"
              />
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                id="guarantor_phone"
                placeholder="Enter phone number"
              />
            </div>

            <div class="form-group">
              <label>Relationship</label>
              <select id="guarantor_relationship">
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
                <option value="Employer">Employer</option>
                <option value="Business Associate">Business Associate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Guarantor Number</label>
              <input
                type="number"
                id="guarantor_number"
                min="1"
                value="${guarantorList.length + 1}"
              />
            </div>

            <div class="form-group full-width">
              <label>Address</label>
              <textarea
                id="guarantor_address"
                rows="4"
                placeholder="Enter guarantor address"
              ></textarea>
            </div>

          </div>

          <div style="
            margin-top:20px;
            display:flex;
            gap:10px;
          ">

            <button
              class="primary-btn"
              onclick="saveGuarantor('${customerId}')"
            >
              Save Guarantor
            </button>

            <button
              class="secondary-btn"
              onclick="showCustomerProfile('${customerId}')"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    `;

  } catch (error) {

    console.error("Guarantor error:", error);

    document.getElementById("root").innerHTML = `
      <div class="card">

        <h2>Unable to load Guarantors</h2>

        <p>${error.message}</p>

        <button
          class="secondary-btn"
          onclick="showCustomerProfile('${customerId}')"
        >
          Back to Customer Profile
        </button>

      </div>
    `;
  }
}


async function saveGuarantor(customerId) {
  try {

    const { data: sessionData } =
      await supabaseClient.auth.getSession();

    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    const name =
      document.getElementById("guarantor_name").value.trim();

    const phone =
      document.getElementById("guarantor_phone").value.trim();

    const relationship =
      document.getElementById("guarantor_relationship").value;

    const address =
      document.getElementById("guarantor_address").value.trim();

    const guarantorNumber =
      Number(document.getElementById("guarantor_number").value);

    if (!name) {
      alert("Please enter the Guarantor's full name.");
      return;
    }

    if (!guarantorNumber || guarantorNumber < 1) {
      alert("Please enter a valid Guarantor Number.");
      return;
    }

    const guarantorData = {
      customer_id: customerId,
      full_name: name,
      phone_number: phone || null,
      relationship: relationship || null,
      address: address || null,
      guarantor_number: guarantorNumber,
      status: "active"
    };

    const { error } = await supabaseClient
      .from("guarantors")
      .insert([guarantorData]);

    if (error) {
      throw error;
    }

    alert("Guarantor saved successfully.");

    showGuarantors(customerId);

  } catch (error) {

    console.error("Save Guarantor error:", error);

    alert(
      "Unable to save Guarantor: " +
      error.message
    );
  }
}


async function editGuarantor(customerId, guarantorId) {
  try {

    const { data: guarantor, error } =
      await supabaseClient
        .from("guarantors")
        .select(`
          id,
          full_name,
          address,
          phone_number,
          relationship,
          guarantor_number,
          status
        `)
        .eq("id", guarantorId)
        .eq("customer_id", customerId)
        .single();

    if (error) {
      throw error;
    }

    document.getElementById("root").innerHTML = `
      <div class="app-container">

        <div class="page-header">
          <div>
            <h1>Edit Guarantor</h1>
          </div>
        </div>

        <div class="card">

          <div class="form-grid">

            <div class="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                id="edit_guarantor_name"
                value="${guarantor.full_name || ""}"
              />
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                id="edit_guarantor_phone"
                value="${guarantor.phone_number || ""}"
              />
            </div>

            <div class="form-group">
              <label>Relationship</label>
              <input
                type="text"
                id="edit_guarantor_relationship"
                value="${guarantor.relationship || ""}"
              />
            </div>

            <div class="form-group">
              <label>Guarantor Number</label>
              <input
                type="number"
                id="edit_guarantor_number"
                min="1"
                value="${guarantor.guarantor_number || 1}"
              />
            </div>

            <div class="form-group full-width">
              <label>Address</label>
              <textarea
                id="edit_guarantor_address"
                rows="4"
              >${guarantor.address || ""}</textarea>
            </div>

          </div>

          <div style="
            margin-top:20px;
            display:flex;
            gap:10px;
          ">

            <button
              class="primary-btn"
              onclick="updateGuarantor(
                '${customerId}',
                '${guarantorId}'
              )"
            >
              Update Guarantor
            </button>

            <button
              class="secondary-btn"
              onclick="showGuarantors('${customerId}')"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    `;

  } catch (error) {

    console.error("Edit Guarantor error:", error);

    alert(
      "Unable to load Guarantor: " +
      error.message
    );
  }
}


async function updateGuarantor(customerId, guarantorId) {
  try {

    const name =
      document.getElementById("edit_guarantor_name").value.trim();

    const phone =
      document.getElementById("edit_guarantor_phone").value.trim();

    const relationship =
      document.getElementById("edit_guarantor_relationship").value.trim();

    const address =
      document.getElementById("edit_guarantor_address").value.trim();

    const guarantorNumber =
      Number(document.getElementById("edit_guarantor_number").value);

    if (!name) {
      alert("Please enter the Guarantor's full name.");
      return;
    }

    const guarantorData = {
      full_name: name,
      phone_number: phone || null,
      relationship: relationship || null,
      address: address || null,
      guarantor_number: guarantorNumber
    };

    const { error } = await supabaseClient
      .from("guarantors")
      .update(guarantorData)
      .eq("id", guarantorId)
      .eq("customer_id", customerId);

    if (error) {
      throw error;
    }

    alert("Guarantor updated successfully.");

    showGuarantors(customerId);

  } catch (error) {

    console.error("Update Guarantor error:", error);

    alert(
      "Unable to update Guarantor: " +
      error.message
    );
  }
}
async function showNewLoan(customerId) {
  try {
    const { data: sessionData } =
      await supabaseClient.auth.getSession();

    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    const { data: customer, error: customerError } =
      await supabaseClient
        .from("customers")
        .select("id, customer_code, full_name")
        .eq("id", customerId)
        .single();

    if (customerError) {
      throw customerError;
    }

    const { data: businesses, error: businessError } =
      await supabaseClient
        .from("businesses")
        .select(`
          id,
          business_name,
          nature_of_business,
          business_type,
          sector
        `)
        .eq("customer_id", customerId)
        .order("business_name");

    if (businessError) {
      throw businessError;
    }

    const { data: purposes, error: purposeError } =
      await supabaseClient
        .from("loan_purpose_types")
        .select("id, name, description")
        .eq("is_active", true)
        .order("name");

    if (purposeError) {
      throw purposeError;
    }

    const businessList = businesses || [];
    const purposeList = purposes || [];

    document.getElementById("root").innerHTML = `
      <div class="app-container">

        <div class="page-header">
          <div>
            <h1>New Loan Application</h1>
            <p>
              Customer:
              <strong>${customer.full_name}</strong>
              (${customer.customer_code})
            </p>
          </div>
        </div>

        <div class="card">

          <h2>Loan Application Details</h2>

          <div class="form-grid">

            <div class="form-group">
              <label>Customer</label>
              <input
                type="text"
                value="${customer.full_name}"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Customer Code</label>
              <input
                type="text"
                value="${customer.customer_code}"
                readonly
              />
            </div>

            <div class="form-group full-width">
              <label>Business *</label>
              <select id="loan_business_id">
                <option value="">Select Business</option>

                ${
                  businessList.map(business => `
                    <option value="${business.id}">
                      ${business.business_name}
                    </option>
                  `).join("")
                }

              </select>

              ${
                businessList.length === 0
                  ? `
                    <small style="color:#b00020;">
                      No business information has been added for this customer.
                      Please complete the Business section first.
                    </small>
                  `
                  : ""
              }

            </div>

            <div class="form-group">
              <label>Loan Type *</label>
              <select id="loan_type">
                <option value="Working Capital Loan">
                  Working Capital Loan
                </option>
                <option value="Business Expansion Loan">
                  Business Expansion Loan
                </option>
                <option value="Asset Acquisition Loan">
                  Asset Acquisition Loan
                </option>
                <option value="Equipment Finance">
                  Equipment Finance
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Requested Amount (₦) *</label>
              <input
                type="number"
                id="requested_amount"
                min="1"
                step="0.01"
                placeholder="Enter requested amount"
              />
            </div>

            <div class="form-group">
              <label>Requested Tenor (Months) *</label>
              <input
                type="number"
                id="requested_tenor"
                min="1"
                placeholder="e.g. 6"
              />
            </div>

            <div class="form-group">
              <label>Repayment Frequency *</label>
              <select id="repayment_frequency">
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly" selected>Monthly</option>
              </select>
            </div>

            <div class="form-group">
              <label>Interest Rate (%)</label>
              <input
                type="number"
                id="interest_rate"
                min="0"
                step="0.01"
                placeholder="Enter interest rate"
              />
            </div>

            <div class="form-group">
              <label>Interest Method</label>
              <select id="interest_method">
                <option value="">Select Method</option>
                <option value="Flat">Flat</option>
                <option value="Reducing Balance">
                  Reducing Balance
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Grace Period (Months)</label>
              <input
                type="number"
                id="grace_period"
                min="0"
                value="0"
              />
            </div>

            <div class="form-group full-width">
              <label>Purpose of Loan *</label>

              <select id="loan_purpose_id">
                <option value="">
                  Select Purpose of Loan
                </option>

                ${
                  purposeList.map(purpose => `
                    <option value="${purpose.id}">
                      ${purpose.name}
                    </option>
                  `).join("")
                }

              </select>
            </div>

          </div>

          <div style="
            margin-top:25px;
            display:flex;
            gap:10px;
          ">

            <button
              class="primary-btn"
              onclick="saveLoanApplication('${customerId}')"
            >
              Save Loan Application
            </button>

            <button
              class="secondary-btn"
              onclick="showCustomerProfile('${customerId}')"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    `;

  } catch (error) {

    console.error("New Loan error:", error);

    document.getElementById("root").innerHTML = `
      <div class="card">

        <h2>Unable to load New Loan Application</h2>

        <p>${error.message}</p>

        <button
          class="secondary-btn"
          onclick="showCustomerProfile('${customerId}')"
        >
          Back to Customer Profile
        </button>

      </div>
    `;
  }
}


async function saveLoanApplication(customerId) {
  try {

    const { data: sessionData } =
      await supabaseClient.auth.getSession();

    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    const businessId =
      document.getElementById("loan_business_id").value;

    const loanType =
      document.getElementById("loan_type").value;

    const requestedAmount =
      Number(document.getElementById("requested_amount").value);

    const requestedTenor =
      Number(document.getElementById("requested_tenor").value);

    const repaymentFrequency =
      document.getElementById("repayment_frequency").value;

    const interestRateValue =
      document.getElementById("interest_rate").value;

    const interestRate =
      interestRateValue === ""
        ? null
        : Number(interestRateValue);

    const interestMethod =
      document.getElementById("interest_method").value;

    const gracePeriod =
      Number(document.getElementById("grace_period").value || 0);

    const purposeId =
      document.getElementById("loan_purpose_id").value;

    if (!businessId) {
      alert("Please select the customer's business.");
      return;
    }

    if (!requestedAmount || requestedAmount <= 0) {
      alert("Please enter a valid loan amount.");
      return;
    }

    if (!requestedTenor || requestedTenor <= 0) {
      alert("Please enter a valid loan tenor.");
      return;
    }

    if (!purposeId) {
      alert("Please select the Purpose of Loan.");
      return;
    }

    const loanCode =
      "LN-" +
      Date.now().toString().slice(-8);

    const loanData = {
      loan_code: loanCode,
      customer_id: customerId,
      business_id: businessId,
      loan_officer_id: session.user.id,
      loan_type: loanType,
      requested_amount: requestedAmount,
      requested_tenor: requestedTenor,
      repayment_frequency: repaymentFrequency,
      interest_rate: interestRate,
      interest_method: interestMethod || null,
      grace_period: gracePeriod,
      loan_purpose_id: purposeId,
      status: "draft"
    };

    const { error } =
      await supabaseClient
        .from("loan_applications")
        .insert([loanData]);

    if (error) {
      throw error;
    }

    alert(
      "Loan application saved successfully. Loan Code: " +
      loanCode
    );

    showCustomerProfile(customerId);

  } catch (error) {

    console.error(
      "Save Loan Application error:",
      error
    );

    alert(
      "Unable to save Loan Application: " +
      error.message
    );
  }
}
async function showLoanApplications() {
  try {
    const { data: sessionData } =
      await supabaseClient.auth.getSession();

    const session = sessionData?.session;

    if (!session) {
      showLogin();
      return;
    }

    const { data: loans, error } =
      await supabaseClient
        .from("loan_applications")
        .select(`
          id,
          loan_code,
          customer_id,
          business_id,
          loan_type,
          requested_amount,
          requested_tenor,
          repayment_frequency,
          interest_rate,
          interest_method,
          status,
          application_date,
          customers (
            full_name,
            customer_code
          ),
          loan_purpose_types (
            name
          )
        `)
        .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const loanList = loans || [];

    document.getElementById("root").innerHTML = `
      <div class="app-container">

        <div class="page-header">
          <div>
            <h1>Loan Applications</h1>
            <p>Manage and review customer loan applications.</p>
          </div>
        </div>

        <div class="card">

          ${
            loanList.length === 0
              ? `
                <p>No loan applications found.</p>
              `
              : `
                <div style="overflow-x:auto;">

                  <table style="
                    width:100%;
                    border-collapse:collapse;
                  ">

                    <thead>
                      <tr>
                        <th style="padding:10px; text-align:left;">
                          Loan Code
                        </th>

                        <th style="padding:10px; text-align:left;">
                          Customer
                        </th>

                        <th style="padding:10px; text-align:right;">
                          Amount
                        </th>

                        <th style="padding:10px; text-align:center;">
                          Tenor
                        </th>

                        <th style="padding:10px; text-align:left;">
                          Purpose
                        </th>

                        <th style="padding:10px; text-align:left;">
                          Status
                        </th>

                        <th style="padding:10px; text-align:center;">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      ${
                        loanList.map(loan => `
                          <tr style="
                            border-top:1px solid #ddd;
                          ">

                            <td style="padding:10px;">
                              <strong>
                                ${loan.loan_code}
                              </strong>
                            </td>

                            <td style="padding:10px;">
                              ${
                                loan.customers?.full_name ||
                                "Unknown Customer"
                              }

                              <br>

                              <small>
                                ${
                                  loan.customers?.customer_code ||
                                  ""
                                }
                              </small>
                            </td>

                            <td style="
                              padding:10px;
                              text-align:right;
                            ">
                              ₦${Number(
                                loan.requested_amount || 0
                              ).toLocaleString()}
                            </td>

                            <td style="
                              padding:10px;
                              text-align:center;
                            ">
                              ${loan.requested_tenor} months
                            </td>

                            <td style="padding:10px;">
                              ${
                                loan.loan_purpose_types?.name ||
                                "Not specified"
                              }
                            </td>

                            <td style="padding:10px;">
                              ${loan.status}
                            </td>

                            <td style="
                              padding:10px;
                              text-align:center;
                            ">
                              <button
                                class="secondary-btn"
                                onclick="showLoanDetails(
                                  '${loan.id}'
                                )"
                              >
                                View
                              </button>
                            </td>

                          </tr>
                        `).join("")
                      }

                    </tbody>

                  </table>

                </div>
              `
          }

        </div>

      </div>
    `;

  } catch (error) {

    console.error(
      "Loan Applications error:",
      error
    );

    document.getElementById("root").innerHTML = `
      <div class="card">

        <h2>Unable to load Loan Applications</h2>

        <p>${error.message}</p>

        <button
          class="secondary-btn"
          onclick="showDashboard()"
        >
          Back to Dashboard
        </button>

      </div>
    `;
  }
}
async function showLoanDetails(loanId) {

  try {

    const { data: loan, error } =
      await supabaseClient
        .from("loan_applications")
        .select(`
          id,
          loan_code,
          customer_id,
          business_id,
          loan_type,
          requested_amount,
          requested_tenor,
          repayment_frequency,
          interest_rate,
          interest_method,
          grace_period,
          first_repayment_date,
          recommended_amount,
          recommended_tenor,
          recommendation,
          recommendation_reason,
          status,
          application_date,
          submitted_at,
          created_at
        `)
        .eq("id", loanId)
        .single();

    if (error) {
      throw error;
    }

    if (!loan) {
      throw new Error("Loan application not found.");
    }

    root.innerHTML = `
      <div class="app-header">

        <h1>MFB Loan Appraisal System</h1>

        <div>
          Loan Application

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

          <button onclick="showCustomerForm()">
            New Customer
          </button>

          <button
            class="active"
            onclick="showLoanApplications()"
          >
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

  <!-- PAGE HEADER -->

  <div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:20px;
  ">

    <div>
      <h2>Loan Appraisal Worksheet</h2>

      <p style="margin-top:6px;">
        Loan Code:
        <strong>${loan.loan_code}</strong>
      </p>
    </div>

    <button
      class="secondary-btn"
      onclick="showLoanApplications()"
    >
      ← Back to Loan Applications
    </button>

  </div>


  <!-- WORKSHEET NAVIGATION -->

  <div class="card">

    <h3>Appraisal Sections</h3>

    <p style="margin-top:8px; margin-bottom:18px;">
      Complete the loan appraisal through the sections below.
    </p>

    <div style="
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
      gap:12px;
    ">

      <button
        class="secondary-btn"
        onclick="document.getElementById('loanInformationSection').scrollIntoView({behavior:'smooth'})"
      >
        1. Loan Information
      </button>

      <button
        class="secondary-btn"
        onclick="document.getElementById('customerSection').scrollIntoView({behavior:'smooth'})"
      >
        2. Customer
      </button>

      <button
        class="secondary-btn"
        onclick="document.getElementById('businessSection').scrollIntoView({behavior:'smooth'})"
      >
        3. Business
      </button>

      <button
        class="secondary-btn"
        onclick="document.getElementById('purposeSection').scrollIntoView({behavior:'smooth'})"
      >
        4. Loan Purpose
      </button>

      <button
        class="secondary-btn"
        onclick="document.getElementById('financialSection').scrollIntoView({behavior:'smooth'})"
      >
        5. Financial Assessment
      </button>

      <button
        class="secondary-btn"
        onclick="document.getElementById('inventorySection').scrollIntoView({behavior:'smooth'})"
      >
        6. Inventory Assessment
      </button>

      <button
        class="secondary-btn"
        onclick="document.getElementById('existingLoansSection').scrollIntoView({behavior:'smooth'})"
      >
        7. Existing Loans
      </button>

      <button
        class="secondary-btn"
        onclick="document.getElementById('guarantorSection').scrollIntoView({behavior:'smooth'})"
      >
        8. Guarantors
      </button>

      <button
        class="secondary-btn"
        onclick="document.getElementById('recommendationSection').scrollIntoView({behavior:'smooth'})"
      >
        9. Recommendation
      </button>

    </div>

  </div>


  <!-- 1. LOAN INFORMATION -->

  <div
    class="card"
    id="loanInformationSection"
    style="margin-top:20px;"
  >

    <h3>1. Loan Information</h3>

    <div
      class="form-grid"
      style="margin-top:20px;"
    >

      <div class="form-group">
        <label>Loan Code</label>

        <input
          type="text"
          value="${loan.loan_code || "-"}"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Loan Type</label>

        <input
          type="text"
          value="${loan.loan_type || "-"}"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Requested Amount</label>

        <input
          type="text"
          value="₦${Number(
            loan.requested_amount || 0
          ).toLocaleString()}"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Requested Tenor</label>

        <input
          type="text"
          value="${loan.requested_tenor || 0} months"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Repayment Frequency</label>

        <input
          type="text"
          value="${loan.repayment_frequency || "-"}"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Interest Rate</label>

        <input
          type="text"
          value="${loan.interest_rate ?? "-"}"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Interest Method</label>

        <input
          type="text"
          value="${loan.interest_method || "-"}"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Grace Period</label>

        <input
          type="text"
          value="${loan.grace_period ?? 0} days"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Application Date</label>

        <input
          type="text"
          value="${loan.application_date || "-"}"
          readonly
        />
      </div>

      <div class="form-group">
        <label>Status</label>

        <input
          type="text"
          value="${loan.status || "-"}"
          readonly
        />
      </div>

    </div>

  </div>


  <!-- 2. CUSTOMER -->

  <div
    class="card"
    id="customerSection"
    style="margin-top:20px;"
  >

    <h3>2. Customer Information</h3>

    <p style="margin-top:8px;">
      Review the customer's KYC, personal information and credit profile.
    </p>

    <div style="margin-top:18px;">

      <button
        class="primary-btn"
        onclick="showCustomerProfile('${loan.customer_id}')"
      >
        Open Customer Profile
      </button>

    </div>

  </div>


  <!-- 3. BUSINESS -->

  <div
    class="card"
    id="businessSection"
    style="margin-top:20px;"
  >

    <h3>3. Business Assessment</h3>

    <p style="margin-top:8px;">
      Review the customer's business information and operating profile.
    </p>

    <div style="
      margin-top:18px;
      padding:18px;
      background:#f8f9fa;
      border-radius:8px;
    ">

      <strong>Business assessment module</strong>

      <p style="margin-top:8px;">
        This section will contain business assessment,
        turnover, operating expenses, profitability and
        repayment capacity analysis.
      </p>

    </div>

  </div>


  <!-- 4. LOAN PURPOSE -->

  <div
    class="card"
    id="purposeSection"
    style="margin-top:20px;"
  >

    <h3>4. Loan Purpose</h3>

    <p style="margin-top:8px;">
      Record and verify the specific purpose for which the loan is requested.
    </p>

    <div style="
      margin-top:18px;
      padding:18px;
      background:#f8f9fa;
      border-radius:8px;
    ">

      <strong>Loan purpose module</strong>

      <p style="margin-top:8px;">
        This section will be connected to the loan purpose
        information already created in the system.
      </p>

    </div>

  </div>


  <!-- 5. FINANCIAL ASSESSMENT -->

  <div
    class="card"
    id="financialSection"
    style="margin-top:20px;"
  >

    <h3>5. Financial Assessment</h3>

    <p style="margin-top:8px;">
      Assess daily sales, operating expenses, profit and repayment capacity.
    </p>

    <div style="
      margin-top:18px;
      padding:18px;
      background:#f8f9fa;
      border-radius:8px;
    ">

      <strong>Financial assessment module</strong>

      <p style="margin-top:8px;">
        Daily sales × number of business days will automatically
        calculate the estimated monthly sales.
      </p>

    </div>

  </div>


  <!-- 6. INVENTORY -->

  <div
    class="card"
    id="inventorySection"
    style="margin-top:20px;"
  >

    <h3>6. Inventory Assessment</h3>

    <p style="margin-top:8px;">
      Assess inventory level, stock movement and inventory rotation.
    </p>

    <div style="
      margin-top:18px;
      padding:18px;
      background:#f8f9fa;
      border-radius:8px;
    ">

      <strong>Inventory assessment module</strong>

      <p style="margin-top:8px;">
        Inventory rotation will be calculated automatically
        to support the credit decision.
      </p>

    </div>

  </div>


  <!-- 7. EXISTING LOANS -->

  <div
    class="card"
    id="existingLoansSection"
    style="margin-top:20px;"
  >

    <h3>7. Existing Loans & Obligations</h3>

    <p style="margin-top:8px;">
      Review existing loans, outstanding obligations and repayment history.
    </p>

    <div style="
      margin-top:18px;
      padding:18px;
      background:#f8f9fa;
      border-radius:8px;
    ">

      <strong>Existing obligations module</strong>

      <p style="margin-top:8px;">
        Existing loans and monthly repayment obligations
        will be incorporated into the repayment capacity calculation.
      </p>

    </div>

  </div>


  <!-- 8. GUARANTORS -->

  <div
    class="card"
    id="guarantorSection"
    style="margin-top:20px;"
  >

    <h3>8. Guarantors</h3>

    <p style="margin-top:8px;">
      Review guarantors attached to this loan application.
    </p>

    <div style="
      margin-top:18px;
      padding:18px;
      background:#f8f9fa;
      border-radius:8px;
    ">

      <strong>Guarantor module</strong>

      <p style="margin-top:8px;">
        Guarantor details and verification will be displayed here.
      </p>

    </div>

  </div>


  <!-- 9. CREDIT RECOMMENDATION -->

  <div
    class="card"
    id="recommendationSection"
    style="margin-top:20px;"
  >

    <h3>9. Credit Recommendation</h3>

    <div
      class="form-grid"
      style="margin-top:20px;"
    >

      <div class="form-group">

        <label>Recommended Amount</label>

        <input
          type="text"
          value="₦${Number(
            loan.recommended_amount || 0
          ).toLocaleString()}"
          readonly
        />

      </div>

      <div class="form-group">

        <label>Recommended Tenor</label>

        <input
          type="text"
          value="${
            loan.recommended_tenor
              ? loan.recommended_tenor + " months"
              : "-"
          }"
          readonly
        />

      </div>

      <div
        class="form-group"
        style="grid-column:1/-1;"
      >

        <label>Recommendation</label>

        <textarea
          rows="3"
          readonly
        >${loan.recommendation || "-"}</textarea>

      </div>

      <div
        class="form-group"
        style="grid-column:1/-1;"
      >

        <label>Recommendation Reason</label>

        <textarea
          rows="4"
          readonly
        >${loan.recommendation_reason || "-"}</textarea>

      </div>

    </div>

  </div>


  <!-- WORKSHEET STATUS -->

  <div
    class="card"
    style="
      margin-top:20px;
      margin-bottom:40px;
    "
  >

    <h3>Appraisal Progress</h3>

    <p style="margin-top:8px;">
      Loan application status:
      <strong>${loan.status || "Draft"}</strong>
    </p>

    <div style="margin-top:20px;">

      <button
        class="secondary-btn"
        onclick="showLoanApplications()"
      >
        Save & Return
      </button>

    </div>

  </div>

</main>
      </div>
    `;

  } catch (error) {

    console.error(
      "Loan Details error:",
      error
    );

    root.innerHTML = `
      <div class="card">

        <h2>Unable to load Loan Application</h2>

        <p style="margin-top:10px;">
          ${error.message}
        </p>

        <button
          class="secondary-btn"
          onclick="showLoanApplications()"
          style="margin-top:20px;"
        >
          ← Back to Loan Applications
        </button>

      </div>
    `;
  }
}
