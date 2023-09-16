function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+') // Convert '-' to '+'
    .replace(/_/g, '/'); // Convert '_' to '/'

  return new Uint8Array([...atob(base64)].map((char) => char.charCodeAt(0)));
}

export async function subscribe(): Promise<void> {
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission === 'denied') {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.getSubscription();

  if (subscription !== null) {
    return;
  }

  const newSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
  });

  console.log('stringify', JSON.stringify(newSubscription));
  console.log('toJSON', newSubscription.toJSON());

  await fetch('/api/subscribe', {
    method: 'POST',
    body: JSON.stringify(newSubscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
