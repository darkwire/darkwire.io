import beepFile from 'audio/beep.mp3';

const showNotification = (title, message, avatarUrl) => {
  const notifBody = {
    body: message,
    tag: 'darkwire',
    silent: true, // we play our own sounds
  };

  const notification = new Notification(title, notifBody);
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // The tab has become visible so clear the now-stale Notification.
      notification.close();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
  // Focus window on click
  notification.onclick = function () {
    window.focus();
    notification.close();
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
};

export const notify = (title, content = '') => {
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notification');
  }
  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === 'granted') {
    // If it's okay let's create a notification
    showNotification(title, content);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        showNotification(title, content);
      }
    });
  }
};

export const beep = (window.Audio && new window.Audio(beepFile)) || { play: () => {} };

export default { notify, beep };
