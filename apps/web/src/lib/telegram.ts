const THEME_BG = "#16110e";
const THEME_HEADER = "#241913";

export function getTelegramWebApp() {
  return window.Telegram?.WebApp ?? null;
}

export function initTelegramApp() {
  const telegram = getTelegramWebApp();
  if (!telegram) {
    return null;
  }

  telegram.ready();
  telegram.expand();
  telegram.setBackgroundColor(THEME_BG);
  telegram.setHeaderColor(THEME_HEADER);

  return telegram;
}

export function openExternalLink(url: string) {
  const telegram = getTelegramWebApp();
  if (telegram?.openLink) {
    telegram.openLink(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
