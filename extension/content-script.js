// Content Script — injected into Hamster Daily website (localhost:3000)
// Reads userId from the website's localStorage and sends it to the extension.

(function () {
  try {
    const userId = window.localStorage.getItem('userId');
    if (userId) {
      chrome.runtime.sendMessage({ type: 'USER_ID', userId }).catch(() => {
        // Extension context may not be ready — retry once
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: 'USER_ID', userId }).catch(() => {});
        }, 1000);
      });
    }
  } catch {
    // localStorage access denied or extension not available
  }
})();
