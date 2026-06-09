// src/hooks/usePushNotifications.js
import { useEffect } from "react";
import { app } from "../firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const messaging = getMessaging(app);

// Your VAPID key — get this from Firebase Console:
// Project Settings → Cloud Messaging → Web Push certificates → Key pair
const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

export function usePushNotifications(firebaseUid) {
  console.log("[FCM] hook called with uid: ", firebaseUid);
  useEffect(() => {
    if (!firebaseUid) return;
    requestAndSaveToken(firebaseUid);

    // Handle foreground notifications (app is open)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground message:", payload);
      // You can show a toast/snackbar here instead of a system notification
      // e.g. toast(payload.notification.body)
    });

    return () => unsubscribe();
  }, [firebaseUid]);
}

async function requestAndSaveToken(firebaseUid) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      console.warn("No FCM token received");
      return;
    }

    console.log("[FCM] Token:", token);

    // Save token to your Express backend → MongoDB
    console.log("FCM Saving token to backend");
    await fetch(`${import.meta.env.VITE_API_URL}/api/users/fcm-token`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseUid, fcmToken: token }),
    });
  } catch (err) {
    console.error("[FCM] Error getting token:", err);
  }
}
