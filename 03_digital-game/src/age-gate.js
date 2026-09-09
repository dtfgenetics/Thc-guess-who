const AGE_GATE_KEY = 'who-took-it:age-confirmed:v1';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  installAgeGate();
}

function installAgeGate() {
  if (isConfirmed()) return;

  const gate = document.createElement('section');
  gate.className = 'age-gate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-labelledby', 'age-gate-title');
  gate.innerHTML = `
    <div class="age-gate-card">
      <p class="age-gate-kicker">THC · Teaching Healthy Cultivation</p>
      <h1 id="age-gate-title">Adult party game. 21+ only.</h1>
      <p>Who Took It? is intended for adults. Confirm you are 21 or older to continue.</p>
      <div class="age-gate-actions">
        <button type="button" data-age-confirm>Yes, I am 21+</button>
        <a href="/games/">Leave</a>
      </div>
      <small>For entertainment purposes only.</small>
    </div>`;

  document.body.appendChild(gate);
  document.body.classList.add('age-gate-open');

  const confirm = gate.querySelector('[data-age-confirm]');
  confirm?.focus({ preventScroll: true });
  confirm?.addEventListener('click', () => {
    try {
      window.localStorage.setItem(AGE_GATE_KEY, 'confirmed');
    } catch {
      // Private browsing may block localStorage. Continue for this session.
    }
    document.body.classList.remove('age-gate-open');
    gate.remove();
  });
}

function isConfirmed() {
  try {
    return window.localStorage.getItem(AGE_GATE_KEY) === 'confirmed';
  } catch {
    return false;
  }
}
