// Listens for a message from the content script that contains scraped UYAP data.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message is intended to send data
  if (request.action === "sendData") {
    // Forward the scraped data to the popup UI
    chrome.runtime.sendMessage({ action: "displayData", data: request.data });
    // Optionally, send a response back to the content script
    sendResponse({ status: "success", message: "Data forwarded to popup." });
  }
  // Return true to indicate that you wish to send a response asynchronously
  return true;
});