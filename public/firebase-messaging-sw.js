/* eslint-disable no-undef */
importScripts(
    "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyDXSKuacUxiGkEraG772OCAivOdoftCE6I",
    authDomain: "matayehuda.firebaseapp.com",
    projectId: "matayehuda",
    storageBucket: "matayehuda.firebasestorage.app",
    messagingSenderId: "264845791661",
    appId: "1:264845791661:web:bac32332d00b6323671124"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const title =
        payload.notification?.title ||
        payload.data?.title ||
        "מטה יהודה";
    const body =
        payload.notification?.body || payload.data?.body || "";

    self.registration.showNotification(title, {
        body,
        icon: "/favicon.svg",
        data: payload.data || {}
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data?.link || "/"));
});
