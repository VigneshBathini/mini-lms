import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { reportError } from './errorReporter';

let notificationsInitialized = false;
let notificationsAvailable = true;

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  (Constants as { appOwnership?: string | null }).appOwnership === 'expo';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModulePromise: Promise<NotificationsModule> | null = null;

const getNotificationsModule = async (): Promise<NotificationsModule | null> => {
  if (Platform.OS === 'web' || isExpoGo || !notificationsAvailable) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications');
  }

  try {
    return await notificationsModulePromise;
  } catch (error) {
    reportError('notifications.moduleUnavailable', error);
    notificationsAvailable = false;
    return null;
  }
};

const normalizeTrigger = async (trigger: any) => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return trigger;
  }

  if (typeof trigger === 'number') {
    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: trigger,
      repeats: false,
    };
  }

  if (trigger && typeof trigger === 'object' && typeof trigger.seconds === 'number') {
    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: trigger.seconds,
      repeats: Boolean(trigger.repeats),
    };
  }

  return trigger;
};

export const initializeNotifications = async () => {
  if (Platform.OS === 'web' || isExpoGo || notificationsInitialized || !notificationsAvailable) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    notificationsInitialized = true;
  } catch (error) {
    reportError('notifications.initialize', error);
    notificationsAvailable = false;
  }
};

export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web' || isExpoGo || !notificationsAvailable) {
    return false;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    reportError('notifications.permissions', error);
    notificationsAvailable = false;
    return false;
  }
};

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  trigger: any
) => {
  if (Platform.OS === 'web' || isExpoGo || !notificationsAvailable) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    await initializeNotifications();
    if (!notificationsAvailable) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: await normalizeTrigger(trigger),
    });
  } catch (error) {
    reportError('notifications.schedule', error);
    notificationsAvailable = false;
  }
};

export const cancelAllScheduled = async () => {
  if (Platform.OS === 'web' || isExpoGo || !notificationsAvailable) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    await initializeNotifications();
    if (!notificationsAvailable) {
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    reportError('notifications.cancelAll', error);
    notificationsAvailable = false;
  }
};
