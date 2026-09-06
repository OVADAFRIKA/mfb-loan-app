document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

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

          <button type="submit" class="primary-btn">
            Sign In
          </button>

          <p id="loginMessage" style="margin-top:15px;"></p>
        </form>
      </div>
    </div>
  `;

  document
    .getElementById("loginForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const message = document.getElementById("loginMessage");

      message.textContent =
        "Authentication connection will be added next.";
    });
});
