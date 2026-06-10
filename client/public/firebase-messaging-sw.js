// public/firebase-messaging-sw.js
// Place this file in your /public folder (React serves it from root)

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCl9-PpeaorGdO-yYOoR1z8-zPfLxjeShA",
  authDomain: "oneapp-b8d69.firebaseapp.com",
  projectId: "oneapp-b8d69",
  storageBucket: "oneapp-b8d69.appspot.com",
  messagingSenderId: "420056611761",
  appId: "1:420056611761:web:ce9acdf69edbf708f71b90",
  measurementId: "G-FK63KDCG0L",
});

const messaging = firebase.messaging();

// Handle background push notifications (app not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload.data?.title ?? "Habit Tracker";
  const body = payload.data?.body ?? "Time to check in!";
  const icon = payload.data?.icon ?? "/logo192.png";

  self.registration.showNotification(title ?? "Habit Tracker", {
    body: body ?? "Time to check in on your habits!",
    icon: icon ?? "/logo192.png", // use your PWA icon
    badge: "/logo192.png",
    tag: "habit-reminder", // replaces duplicate notifications
    renotify: true,
    data: payload.data ?? {},
  });
});

// Optional: handle notification click → open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow("/");
      }),
  );
});
