import { Alert, AlertButton, Platform } from 'react-native';

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
) {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    if (!buttons || buttons.length === 0) {
      if (typeof window !== 'undefined') {
        window.alert(text);
      }
      return;
    }

    // Single button alert
    if (buttons.length === 1) {
      if (typeof window !== 'undefined') {
        window.alert(text);
      }
      buttons[0]?.onPress?.();
      return;
    }

    // Confirmation dialog (2 or more buttons)
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(text);
      if (confirmed) {
        // Find destructive or default action (non-cancel)
        const actionBtn =
          buttons.find((b) => b.style === 'destructive' || b.style === 'default') ||
          buttons.find((b) => b.style !== 'cancel') ||
          buttons[buttons.length - 1];
        actionBtn?.onPress?.();
      } else {
        const cancelBtn = buttons.find((b) => b.style === 'cancel');
        cancelBtn?.onPress?.();
      }
    }
    return;
  }

  // Native iOS / Android
  Alert.alert(title, message, buttons);
}
