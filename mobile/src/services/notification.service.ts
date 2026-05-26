import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { userService } from './user.service';

// Configure how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Requests notification permissions from the user and registers the FCM token
   * with the backend. Must be called after the user has logged in.
   * Returns the FCM token on success, or null if permission is denied.
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('[Notifications] Push notifications only work on physical devices.');
      return null;
    }

    // Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission denied by user.');
      return null;
    }

    // Create the default notification channel on Android (required for Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#208AEF',
      });
    }

    try {
      // Retrieve the native FCM device token
      const tokenData = await Notifications.getDevicePushTokenAsync();
      const fcmToken = tokenData.data;

      // Register this token with our backend so the server can send targeted notifications
      await userService.updateFcmToken(fcmToken);

      console.log('[Notifications] FCM token registered:', fcmToken);
      return fcmToken;
    } catch (error) {
      console.error('[Notifications] Failed to get push token:', error);
      return null;
    }
  },

  /**
   * Adds a listener for notifications received while the app is in the foreground.
   * Returns an unsubscribe function — call it in useEffect cleanup to prevent memory leaks.
   */
  addForegroundListener(
    handler: (notification: Notifications.Notification) => void
  ) {
    const subscription = Notifications.addNotificationReceivedListener(handler);
    return () => subscription.remove();
  },

  /**
   * Adds a listener for when the user taps on a notification to open the app.
   * Returns an unsubscribe function — call it in useEffect cleanup.
   */
  addResponseListener(
    handler: (response: Notifications.NotificationResponse) => void
  ) {
    const subscription = Notifications.addNotificationResponseReceivedListener(handler);
    return () => subscription.remove();
  },

  /**
   * Returns the last notification that was tapped when the app was in the background/killed.
   * Useful for deep-linking on cold start.
   */
  async getLastNotificationResponse() {
    return Notifications.getLastNotificationResponseAsync();
  },

  /**
   * Clears all delivered notifications from the notification tray.
   */
  async dismissAll() {
    await Notifications.dismissAllNotificationsAsync();
  },

  /**
   * Resets the app badge count to zero.
   */
  async resetBadge() {
    await Notifications.setBadgeCountAsync(0);
  },
};
