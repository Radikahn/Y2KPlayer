let lastUrl = null;

function checkUrl() {
  const currentUrl = window.location.href;
  if (currentUrl === lastUrl) return;
  lastUrl = currentUrl;

  console.log(`-------------------------------`);
  console.log(`Currently viewing ${currentUrl}`);

  // Only launch when the user is on a `/watch` page
  if (window.location.pathname === "/watch") {
    launchY2kPlayer(document);
  }
}

// Initial page load
checkUrl();

// YouTube is a single page app: it changes the URL without reloading the page,
// so listen for its navigation event to catch later moves to `/watch`.
document.addEventListener("yt-navigate-finish", checkUrl);
