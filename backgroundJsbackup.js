chrome.webNavigation.onCompleted.addListener((details) => {
    const tabId = details.tabId;
  
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
            console.error('Error fetching tab:', chrome.runtime.lastError);
            return;
        }
  
        if (tab.url) {
            // Check if the URL contains the desired pattern
            if (tab.url.indexOf('meroshare') !== -1) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['contentScript.js']
                });
  
                fetch('https://dummyjson.com/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Send data to the content script
                    chrome.tabs.sendMessage(tabId, { data: data });
                    chrome.storage.local.set({ apiData: data });
                })
                .catch(error => console.error('Error fetching API:', error));
            } else {
                console.warn('URL does not match.');
            }
        } else {
            console.warn('Tab URL is undefined.');
        }
    });
  }, { url: [{ urlContains: 'meroshare' }] });