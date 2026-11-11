/**@type {boolean} debug toggle */
const debug = true;

/**@type {string} player command string */
const PLAY_PAUSE_CONTROL = "playpause";

/**@type {string} video paused state*/
const PAUSED = "paused";

/**@type {string} video playing state*/
const PLAYING = "playing";


const PLAY_PAUSE_BUTTON = document.getElementById("play-pause");
const VIDEO_PROGRESS_BAR = document.getElementById("html5Progress");


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action == "processData") {
    if (debug) console.log("received progress update", message.data);
    VIDEO_PROGRESS_BAR.value = message.data
  }
})



/**
 * Send message from extension to video source to handle media controls
 * @param {string} controlType
 */
async function sendMediaControl(controlType) {
  // await browser.runtime.sendMessage({ action: "processData", data: controlType})
  const [tab]  = await browser.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) return;

  if (debug) console.log("sending to tab: ", tab.id);

  let response = await browser.tabs.sendMessage(tab.id, { action: "processData", data: controlType });

  if (response) {
    console.log(response.reply)

    //TODO: debug why this calls paused right after a play, the default case executes on plays
    switch (response.reply) {
      case PLAYING:
        if(debug) console.log("changing button state to playing")
        PLAY_PAUSE_BUTTON.textContent = ">"
      case PAUSED:
        if(debug) console.log("changing button state to paused")
        PLAY_PAUSE_BUTTON.textContent = "+";
      default:
        console.log("hi you found something you weren't supposed to")
        console.log(response.reply)
    }
  }
}




document.getElementById("play-pause").addEventListener('click', () => {
  if (debug) {
    console.log("Play pause pressed!")
  }

  sendMediaControl(PLAY_PAUSE_CONTROL)
});
