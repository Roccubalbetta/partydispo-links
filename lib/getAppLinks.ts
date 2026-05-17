// lib/getAppLink.ts

export const IOS_APP_STORE_URL =
  process.env.NEXT_PUBLIC_IOS_APP_STORE_URL ||
  "https://apps.apple.com/it/app/echo-events/id6759982492";

export const ANDROID_PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL ||
  "https://play.google.com/store/apps/details?id=com.partydispo.app";

export const HUAWEI_APPGALLERY_URL =
  process.env.NEXT_PUBLIC_HUAWEI_APPGALLERY_URL ||
  "https://echo-app.it/scarica";

export const DOWNLOAD_FALLBACK_URL = "https://echo-app.it/scarica";

export type DetectedPlatform = "iphone" | "android" | "huawei" | "other";

export function detectPlatform(ua?: string): DetectedPlatform {
  const agent =
    ua ?? (typeof navigator !== "undefined" ? navigator.userAgent || "" : "");
  if (!agent) return "other";

  const lower = agent.toLowerCase();

  // Huawei PRIMA di Android: HarmonyOS contiene "Android" nello UA ma non ha Play Store
  if (/huawei|harmonyos|hmscore/.test(lower)) return "huawei";

  // Solo iPhone/iPod: gli iPad non sono supportati dall'app
  if (/iphone|ipod/i.test(agent)) return "iphone";

  if (/android/i.test(agent)) return "android";

  return "other";
}

export function getAppStoreUrl(ua?: string): string {
  switch (detectPlatform(ua)) {
    case "iphone":
      return IOS_APP_STORE_URL;
    case "android":
      return ANDROID_PLAY_STORE_URL;
    case "huawei":
      return HUAWEI_APPGALLERY_URL;
    default:
      return DOWNLOAD_FALLBACK_URL;
  }
}

export function redirectToAppStore(): void {
  if (typeof window === "undefined") return;
  const target = getAppStoreUrl();
  try {
    window.location.assign(target);
  } catch {
    window.location.href = target;
  }
}