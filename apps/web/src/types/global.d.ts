export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_TELEGRAM_BOT_USERNAME?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }

  interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    showAlert: (message: string, callback?: () => void) => void;
    showPopup: (
      params: {
        title?: string;
        message: string;
        buttons?: Array<{ id?: string; text: string; type?: string }>;
      },
      callback?: (id: string) => void,
    ) => void;
    HapticFeedback?: {
      notificationOccurred: (type: "success" | "warning" | "error") => void;
      impactOccurred?: (style: "light" | "medium" | "heavy") => void;
    };
    openLink?: (url: string) => void;
    initDataUnsafe?: {
      user?: {
        id?: number;
        first_name?: string;
        last_name?: string;
        username?: string;
      };
    };
  }
}
