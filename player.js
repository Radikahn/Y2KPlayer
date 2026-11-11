// @ts-check

/**@type {boolean} debug toggle */
//@ts-ignore
const debug = true;

/**@type {string} video paused state*/
//@ts-ignore
const PAUSED = "paused";

/**@type {string} video playing state*/
//@ts-ignore
const PLAYING = "playing";


/**@type {string}  */
var VIDEO_TITLE_SELECTOR = "ytd-watch-metadata h1";

/**@type {string}  */
var VIDEO_SELECTOR = ".html5-video-container video";

/**@type {number}  */
var WAIT_TIMEOUT_MS = 10000;

/**@type {string} */
var videoTitle = ""

/**@type {HTMLVideoElement | undefined}
 * This is the current youtube video's HTML5 video box
 */
var video = undefined;


/**@param {number} ms local sleep function */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


//EVENT LISTENERS TO REGISTER
//@ts-ignore
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (debug) {console.log("recieved a message for video element")}

  if (message.action === "processData") {
    let mediaOperation = message.data;

    if (debug) { console.log(`Received message: ${mediaOperation}`) };

    let currentState = mediaController(mediaOperation)

    sendResponse({ reply: `${currentState}`})
  }
})

//Send the current video progress percentage to the extension when extension is open
waitFor(document, () => {
  //@ts-ignore
  if (video != undefined) {
    video.addEventListener('timeupdate', () => {
        if (!video?.duration) return;

        const percentage = (video.currentTime / video.duration) * 100;

        //@ts-ignore
      browser.runtime.sendMessage({ action: "processData", data: percentage }).catch(error => { })
      })
  }
})

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

  // we need to get the video -> then send it to the extension
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
 * @param {string} mediaOperation
 * @returns {string | undefined} videoState
 */
function mediaController(mediaOperation) {
  video ??= /** @type {HTMLVideoElement | undefined} */ (document.querySelector(VIDEO_SELECTOR) ?? undefined);

  switch (mediaOperation) {
    case "playpause":
      return playPause(video)
      //more cases to come
    default:
      return undefined
  }
}

/**
 *
 * @param {HTMLVideoElement | undefined} video
 * @returns {string} videoState
 */
function playPause(video) {
  if (video === undefined) {
    throw new Error("Cannot applly media operation to undefined video instance")
  }

  if (video.paused) {
    video.play()
    return PLAYING
  }
  else {
    video.pause()
    return PAUSED
  }
}
