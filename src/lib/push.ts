import { supabase } from './supabase';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: OneSignalSDK) => void | Promise<void>>;
  }
}

interface OneSignalSDK {
  init(opts: {
    appId: string;
    notifyButton?: { enable: boolean };
    allowLocalhostAsSecureOrigin?: boolean;
  }): Promise<void>;
  login(externalId: string): Promise<void>;
  logout(): Promise<void>;
  Notifications: {
    requestPermission(): Promise<boolean>;
    permissionNative: NotificationPermission;
  };
}

function deferred(fn: (os: OneSignalSDK) => void | Promise<void>) {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(fn);
}

export function initOneSignal() {
  deferred(async (os) => {
    await os.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID as string,
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: import.meta.env.DEV as boolean,
    });
  });
}

export function loginOneSignal(familyId: string) {
  deferred(async (os) => {
    await os.login(familyId);
  });
}

export function logoutOneSignal() {
  deferred(async (os) => {
    await os.logout();
  });
}

export async function sendPush(params: {
  to: 'family';
  familyId?: string;
  title: string;
  body: string;
  url?: string;
}): Promise<void> {
  try {
    await supabase.functions.invoke('send-push-lcp', { body: params });
  } catch {
    // Push failures are non-critical
  }
}
