import { useEffect, useRef, useState } from 'react';

const AGE_GATE_KEY = 'who-took-it:age-confirmed:v1';

function readConfirmed() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(AGE_GATE_KEY) === 'confirmed';
  } catch {
    return false;
  }
}

function writeConfirmed() {
  try {
    window.localStorage.setItem(AGE_GATE_KEY, 'confirmed');
  } catch {
    // Private browsing can block localStorage. Continue for this session.
  }
}

export default function AgeGate({ children }) {
  const [confirmed, setConfirmed] = useState(() => readConfirmed());
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('age-gate-open', !confirmed);
    return () => document.body.classList.remove('age-gate-open');
  }, [confirmed]);

  useEffect(() => {
    if (!confirmed) confirmButtonRef.current?.focus({ preventScroll: true });
  }, [confirmed]);

  function confirmAge() {
    writeConfirmed();
    setConfirmed(true);
  }

  return (
    <>
      {children}
      {!confirmed ? (
        <section className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
          <div className="age-gate-card">
            <p className="age-gate-kicker">THC · Teaching Healthy Cultivation</p>
            <h1 id="age-gate-title">Adult party game. 21+ only.</h1>
            <p>Who Took It? is intended for adults. Confirm you are 21 or older to continue.</p>
            <div className="age-gate-actions">
              <button ref={confirmButtonRef} type="button" onClick={confirmAge}>Yes, I am 21+</button>
              <a href="/games/">Leave</a>
            </div>
            <small>For entertainment purposes only.</small>
          </div>
        </section>
      ) : null}
    </>
  );
}
