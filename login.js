
// This script handles the login and sign-up functionality for a web application.
// It uses localStorage to store user credentials and manage user sessions.
const formTitle = document.getElementById('form-title');
const authForm = document.getElementById('auth-form');
const switchLink = document.getElementById('switch-link');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

let isLogin = true;

switchLink.addEventListener('click', () => {
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    switchLink.textContent = isLogin ? 'Sign Up' : 'Login';
    document.querySelector('.switch-text').innerHTML =
        isLogin ? "Don't have an account? <span id=\"switch-link\">Sign Up</span>" :
                  "Already have an account? <span id=\"switch-link\">Login</span>";
    document.getElementById('switch-link').addEventListener('click', () => switchLink.click());
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (isLogin) {
        // Check credentials in localStorage
        const storedUser = localStorage.getItem(username);
        if (!storedUser) {
            alert('User not found. Please sign up.');
        } else if (JSON.parse(storedUser).password !== password) {
            alert('Incorrect password.');
        } else {
            alert(`Welcome back, ${username}!`);
            localStorage.setItem('loggedInUser', username); // Store logged-in user
            window.location.href = 'index.html'; // Redirect to dashboard
        }
    } else {
        // Sign up: store user in localStorage
        if (localStorage.getItem(username)) {
            alert('User already exists. Please log in.');
        } else {
            const user = { username, password };
            localStorage.setItem(username, JSON.stringify(user));
            alert(`Account created for ${username}. Redirecting to library...`);
            localStorage.setItem('loggedInUser', username); // Store new user
            window.location.href = 'index.html'; // Redirect to dashboard
        }
    }
    authForm.reset();
});
