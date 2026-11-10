// @ts-check

/**@type {string}  */
var VIDEO_TITLE_SELECTOR = "ytd-watch-metadata h1";

/**@type {string}  */
var VIDEO_SELECTOR = ".html5-video-container video";

/**@type {number}  */
var WAIT_TIMEOUT_MS = 10000;

/**@type {string} */
var videoTitle = ""

/**@type {HTMLVideoElement | undefined} */
var video = undefined;


/**
 * Once on a youtube watch page, launchY2kPlayer will act as the entry point
 * for initializing and rendering the y2kplayer on screen.
 *
 * YouTube renders the watch page with JS after our content script runs, so
 * everything here waits for the DOM to be ready for the current video.
 *
 * @param {HTMLDocument} document
 */
async function launchY2kPlayer(document) {
  const videoId = new URL(window.location.href).searchParams.get("v");

  // ytd-watch-flexy carries the id of the video it is currently showing.
  // Waiting for it to match the URL avoids reading the previous video's
  // title after an in-app navigation.
  await waitFor(document, () =>
    document.querySelector(`ytd-watch-flexy[video-id="${videoId}"]`));

  videoTitle = await getTitle(document);

  // we need to get the video -> html5 video object is what yt uses for standard
  video = await getVideo(document);

  console.log("---------------------------------------------------------------------------")
  console.log(videoTitle)
  console.log(videoTitle.length)
  console.log(video)
  console.log(typeof(video))
}


/**
 * Resolves with the first truthy value returned by `check`, re-checking on
 * every DOM mutation. Rejects after WAIT_TIMEOUT_MS.
 *
 * @template T
 * @param {HTMLDocument} document
 * @param {() => T | null | undefined} check
 * @returns {Promise<T>}
 */
function waitFor(document, check) {
  return new Promise((resolve, reject) => {
    const initial = check();
    if (initial) return resolve(initial);

    const observer = new MutationObserver(() => {
      const result = check();
      if (result) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(result);
      }
    });
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error("Timed out waiting for YouTube page element"));
    }, WAIT_TIMEOUT_MS);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  });
}


/**
 * @param {HTMLDocument} document
 * @returns {Promise<string>} videoTitle
 */
function getTitle(document) {
  return waitFor(document, () =>
    document.querySelector(VIDEO_TITLE_SELECTOR)?.textContent?.trim());
}


/**
 * @param {HTMLDocument} document
 * @returns {Promise<HTMLVideoElement>} video
 */
function getVideo(document) {
  return waitFor(document, () =>
    /** @type {HTMLVideoElement | null} */ (document.querySelector(VIDEO_SELECTOR)));
}



/**
 * THIS FUNCTION IS FOR USE IN HTML
 */
function pauseVideo() {
  video?.pause();
}
