import { signInWithGoogle, signOutUser, onAuthStateChangedListener } from './firebase.js';

// Main UI setup
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', () => {
    const shown = nav.style.display === 'flex';
    nav.style.display = shown ? '' : 'flex';
  });

  // Gallery lightbox
  const gallery = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (gallery) {
    gallery.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightbox.style.display = 'flex';
      lightbox.setAttribute('aria-hidden', 'false');
    });
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Smooth scroll offset for anchored links (if fixed header)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); const y = target.getBoundingClientRect().top + window.scrollY - 64; window.scrollTo({ top: y, behavior: 'smooth' }); }
    });
  });

  // Auth UI elements
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userPhoto = document.getElementById('userPhoto');
  const accessDenied = document.getElementById('accessDenied');

  const ALLOWED_EMAIL = 'ashleysolomonvascular@gmail.com';

  function showUser(user) {
    userName.textContent = user.displayName || user.email;
    userPhoto.src = user.photoURL || '';
    userInfo.hidden = false;
    loginBtn.hidden = true;
    accessDenied.hidden = true;
  }

  function clearUser() {
    userName.textContent = '';
    userPhoto.src = '';
    userInfo.hidden = true;
    loginBtn.hidden = false;
  }

  function showAccessDenied() {
    accessDenied.hidden = false;
    clearUser();
    setTimeout(() => { accessDenied.hidden = true; }, 4000);
  }

  // Login flow
  loginBtn.addEventListener('click', async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      if (!user || user.email !== ALLOWED_EMAIL) {
        await signOutUser();
        showAccessDenied();
      } else {
        showUser(user);
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  });

  // Logout flow
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOutUser();
      clearUser();
    } catch (err) {
      console.error('Logout failed', err);
    }
  });

  // Listen for auth state changes to persist UI
  onAuthStateChangedListener(async (user) => {
    if (user) {
      if (user.email !== ALLOWED_EMAIL) {
        await signOutUser();
        showAccessDenied();
        return;
      }
      showUser(user);
    } else {
      clearUser();
    }
  });
});
