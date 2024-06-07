document.addEventListener("DOMContentLoaded", function () {
  const bookmarkBtn = document.getElementById("bookmarkBtn");
  const bookmarksList = document.getElementById("bookmarksList");

  // Load saved bookmarks
  chrome.storage.sync.get(["bookmarks"], function (result) {
    if (result.bookmarks) {
      result.bookmarks.forEach((bookmark) => {
        addBookmarkToList(bookmark);
      });
    }
  });

  bookmarkBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab && tab.url.includes("youtube.com/watch")) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: () => document.querySelector("video").currentTime,
          },
          (results) => {
            if (results && results[0]) {
              const timestamp = results[0].result;
              const bookmark = {
                url: tab.url,
                timestamp: Math.floor(timestamp),
              };
              saveBookmark(bookmark);
              addBookmarkToList(bookmark);
            }
          }
        );
      }
    });
  });

  function saveBookmark(bookmark) {
    chrome.storage.sync.get(["bookmarks"], function (result) {
      const bookmarks = result.bookmarks || [];
      bookmarks.push(bookmark);
      chrome.storage.sync.set({ bookmarks });
    });
  }

  function addBookmarkToList(bookmark) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = `Bookmark at ${new Date(bookmark.timestamp * 1000)
      .toISOString()
      .substr(11, 8)}`;
    link.addEventListener("click", () => {
      chrome.tabs.create({ url: `${bookmark.url}&t=${bookmark.timestamp}s` });
    });
    li.appendChild(link);
    bookmarksList.appendChild(li);
  }
});
