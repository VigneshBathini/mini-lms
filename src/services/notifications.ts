import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { TimeIntervalTriggerInput } from 'expo-notifications';
import { reportError } from './errorReporter';

let notificationsInitialized = false;
let notificationsAvailable = true;

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  (Constants as { appOwnership?: string | null }).appOwnership === 'expo';

type NotificationsModule = typeof import('expo-notifications');
type LocalNotificationTrigger =
  | number
  | {
      seconds: number;
      repeats?: boolean;
    };

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
  trigger: LocalNotificationTrigger
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

    const normalizedTrigger: TimeIntervalTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: typeof trigger === 'number' ? trigger : trigger.seconds,
      repeats: typeof trigger === 'number' ? false : Boolean(trigger.repeats),
    };

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: normalizedTrigger,
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
