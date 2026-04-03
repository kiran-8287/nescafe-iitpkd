import { useState, useCallback } from 'react';

/**
 * usePushNotifications
 * A shared hook that manages browser Notification permission and
 * provides a helper to fire OS-level push notifications.
 *
 * Usage:
 *   const { permission, requestPermission, sendNotification } = usePushNotifications();
 */
const usePushNotifications = () => {
    const [permission, setPermission] = useState(
        'Notification' in window ? Notification.permission : 'unsupported'
    );

    /**
     * requestPermission — MUST be called from a user gesture (button click).
     * Returns the resulting permission string: 'granted' | 'denied' | 'default'
     */
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return 'unsupported';
        if (Notification.permission === 'granted') {
            setPermission('granted');
            return 'granted';
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    }, []);

    const sendNotification = useCallback(async (title, body, icon = '/favicon.ico', tag) => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        // Try Service Worker first for "real app" behavior on mobile
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                if (registration.showNotification) {
                    registration.showNotification(title, {
                        body,
                        icon,
                        tag,
                        badge: '/favicon.ico', // Android specific: small icon for status bar
                        vibrate: [100, 50, 100],
                        data: { dateOfArrival: Date.now() }
                    });
                    return;
                }
            } catch (err) {
                console.error('Service Worker notification failed:', err);
            }
        }

        // Fallback to basic Notification API
        try {
            new Notification(title, { body, icon, tag });
        } catch (err) {
            console.error('Browser notification fallback failed:', err);
        }
    }, []);


    return { permission, requestPermission, sendNotification };
};

export default usePushNotifications;
