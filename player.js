// @ts-check

/**@type {number}  */
var YOUTUBE_VIDEO_TITLE_ROW = 1

/**
 * Once on a youtube watch page, launchY2kPlayer will act as the entry point
 * for initializing and rendering the y2kplayer on screen.
 *
 * @param {HTMLDocument} document
 */
function launchY2kPlayer(document) {

  //youtube does not have class IDs that we can directly grab the title from
  // Therefore, we have to grab the "above fold" H1 to capture the title of the video
  // Thankfully the title is labled under a custom HTML class
  // We need to parse for title="
  let videoTitle = getTitle(document);


  console.log("---------------------------------------------------------------------------")
  console.log(videoTitle)
  console.log(videoTitle.length)
}


/**
 * @param {HTMLDocument} document
 * @returns {string} videoTitle
 */
function getTitle(document) {
  let aboveFoldSection = document.getElementsByClassName("style-scope ytd-watch-metadata")
  let dirtyTitle = aboveFoldSection.item(YOUTUBE_VIDEO_TITLE_ROW)?.textContent;

  return cleanTitle(dirtyTitle);
}

/**
 *
 * @param {string | undefined} textContent
 * @returns {string} title
 */
function cleanTitle(textContent) {
  if (textContent == undefined) {
    throw new Error("Failed to retrieve youtube video title row text content it was undefined");
  }
  let parse = textContent.replaceAll("\n", "")

  //parse until first instance of character that is not space
  for (let i = 0; i < parse.length; i++) {
    if (parse.charAt(i) != " ") {
      parse = parse.substring(i);
      break;
    }
  }

  //parse backwards until first instance of character that is not space
  for (let i = parse.length - 1; i > 0; i--) {
    if (parse.charAt(i) != " ") {
      parse = parse.substring(0, i + 1);
      break;
    }
  }

  return parse

}
