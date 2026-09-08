import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// NOTE: these are still placeholder values. Push notifications will not work
// until they are replaced with a real Firebase project's config. Until then,
// the initialisation below is wrapped so a missing/invalid config or an
// unsupported browser can never crash the whole app (previously getMessaging()
// could throw at import time and white-screen the entire site).
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

let messaging = null;

try {
  const app = initializeApp(firebaseConfig);
  // getMessaging throws in environments without the required browser APIs,
  // so only call it when messaging is actually supported.
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          messaging = getMessaging(app);
        } catch (err) {
          console.warn("Firebase messaging unavailable:", err?.message || err);
        }
      }
    })
    .catch(() => {
      /* isSupported can reject in some environments; ignore. */
    });
} catch (err) {
  console.warn("Firebase init skipped:", err?.message || err);
}

export { messaging, getToken, onMessage };
