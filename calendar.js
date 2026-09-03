import { db, onAuthStateChangedListener } from './firebase.js';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const ADMIN_EMAIL = 'ashleysolomonvascular@gmail.com';
// Placeholder — replace with the real WhatsApp number (country code, no + or spaces).
const WHATSAPP_NUMBER = '919876543210';

document.addEventListener('DOMContentLoaded', () => {
  const monthLabel = document.getElementById('calMonthLabel');
  const grid = document.getElementById('calendarGrid');
  const prevBtn = document.getElementById('calPrevBtn');
  const nextBtn = document.getElementById('calNextBtn');
  const selectionText = document.getElementById('calSelectionText');
  const bookBtn = document.getElementById('calBookBtn');
  const clearBtn = document.getElementById('calClearBtn');
  const adminHint = document.getElementById('calAdminHint');
  const errorText = document.getElementById('calError');

  if (!grid) return;

  let viewDate = new Date();
  viewDate.setDate(1);

  let blockedDates = new Set(); // 'YYYY-MM-DD' strings
  let isAdmin = false;
  let checkIn = null;
  let checkOut = null;

  function fmt(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDisplay(date) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function startOfDay(d) {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
  }

  function isPast(date) {
    return startOfDay(date) < startOfDay(new Date());
  }

  function rangeHasBlocked(start, end) {
    const cur = new Date(start);
    cur.setDate(cur.getDate() + 1);
    while (cur < end) {
      if (blockedDates.has(fmt(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  function hideError() {
    errorText.hidden = true;
  }

  function showError(message) {
    errorText.textContent = message;
    errorText.hidden = false;
  }

  async function toggleBlocked(dateStr, blocked) {
    try {
      const ref = doc(db, 'blockedDates', dateStr);
      if (blocked) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { blocked: true });
      }
    } catch (err) {
      console.error('Failed to update availability', err);
      showError('Could not update that date — check your connection and try again.');
    }
  }

  function handleDayClick(date, dateStr, blocked) {
    hideError();

    if (isAdmin) {
      toggleBlocked(dateStr, blocked);
      return;
    }

    if (blocked) return;

    if (!checkIn || checkOut) {
      checkIn = date;
      checkOut = null;
      render();
      return;
    }

    if (date <= checkIn) {
      checkIn = date;
      render();
      return;
    }

    if (rangeHasBlocked(checkIn, date)) {
      showError('Your selected range includes dates that are already booked. Please choose different dates.');
      return;
    }

    checkOut = date;
    render();
  }

  function updateSelectionUI() {
    if (checkIn && checkOut) {
      selectionText.textContent = `Check-in: ${formatDisplay(checkIn)} → Check-out: ${formatDisplay(checkOut)}`;
      bookBtn.disabled = false;
    } else if (checkIn) {
      selectionText.textContent = `Check-in: ${formatDisplay(checkIn)} — now select a check-out date.`;
      bookBtn.disabled = true;
    } else {
      selectionText.textContent = 'Select a check-in date to get started.';
      bookBtn.disabled = true;
    }
  }

  function render() {
    monthLabel.textContent = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    grid.classList.toggle('admin-mode', isAdmin);
    grid.innerHTML = '';

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const pad = document.createElement('div');
      pad.className = 'cal-day empty';
      grid.appendChild(pad);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = fmt(date);
      const past = isPast(date);
      const blocked = blockedDates.has(dateStr);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = String(d);
      btn.dataset.date = dateStr;

      if (past) {
        btn.classList.add('past');
        btn.disabled = true;
        btn.title = `${formatDisplay(date)} — past`;
      } else if (blocked) {
        btn.classList.add('booked');
        btn.title = `${formatDisplay(date)} — booked`;
        btn.addEventListener('click', () => handleDayClick(date, dateStr, blocked));
      } else {
        btn.classList.add('available');
        btn.title = `${formatDisplay(date)} — available`;
        btn.addEventListener('click', () => handleDayClick(date, dateStr, blocked));
      }

      if (checkIn && dateStr === fmt(checkIn)) btn.classList.add('selected');
      if (checkOut && dateStr === fmt(checkOut)) btn.classList.add('selected');
      if (checkIn && checkOut && date > checkIn && date < checkOut) btn.classList.add('in-range');

      grid.appendChild(btn);
    }

    adminHint.hidden = !isAdmin;
    updateSelectionUI();
  }

  prevBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    render();
  });

  nextBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    render();
  });

  clearBtn.addEventListener('click', () => {
    checkIn = null;
    checkOut = null;
    hideError();
    render();
  });

  bookBtn.addEventListener('click', () => {
    if (!checkIn || !checkOut) return;
    const message = `Hi Chateau Dif Pondy, I'd like to book a stay from ${formatDisplay(checkIn)} to ${formatDisplay(checkOut)}. Is this available?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  });

  onSnapshot(collection(db, 'blockedDates'), (snap) => {
    blockedDates = new Set(snap.docs.map((d) => d.id));
    render();
  }, (err) => {
    console.error('Failed to load availability', err);
    showError('Could not load the latest availability. Showing cached data.');
  });

  onAuthStateChangedListener((user) => {
    isAdmin = !!user && user.email === ADMIN_EMAIL;
    render();
  });

  render();
});
