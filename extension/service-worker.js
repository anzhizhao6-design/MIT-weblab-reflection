// Service Worker for Hamster Daily Edge Extension
// Responsibilities:
//  1. Enable sidePanel (toolbar icon click → side panel opens automatically via manifest)
//  2. Relay userId from content script to side panel

// Listen for userId from content script (running on Hamster Daily website)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'USER_ID' && message.userId) {
    // Store in extension-local storage so side panel can read it
    chrome.storage.local.set({ userId: message.userId }).catch(() => {});
  }
  // Always respond to avoid "message port closed" errors
  sendResponse({ ok: true });
  return true;
});
