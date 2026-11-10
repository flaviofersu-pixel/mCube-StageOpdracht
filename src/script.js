const RSS_URL = "https://rss.app/feeds/LrTk1cMRxeTKDJHz.xml";
const CACHE_NAME = "news-widget";
const ITEMS_PER_PAGE = 2;
const REFRESH_TIME = 10 * 60 * 1000; // get new news every 10 minutes

const NEWS_LIST = document.querySelector(".news-list");
const PROGRESS = document.querySelector(".progress");

let pages = [];
let currentPage = 0;
// some news have no description if so an empty text is returned
function getText(item, tagName) {
    const ELEMENT = item.querySelector(tagName);
    if (ELEMENT === null) {
        return "";
    }
    return ELEMENT.textContent;
}

//get title, description & img of every news item
function readItems(xmlText) {
    const XML = new DOMParser().parseFromString(xmlText, "text/xml");
    const ITEMS = [];

    for (const ITEM of XML.querySelectorAll("item")) {
        const IMAGE = ITEM.querySelector("enclosure");

        if (IMAGE === null) {
            continue;
        }

        ITEMS.push({
            title: getText(ITEM, "title"),
            description: getText(ITEM, "description"),
            img: IMAGE.getAttribute("url")
        });
    }
    return ITEMS;
}

//save on cache
async function saveFeed(cache) {
    const RESPONSE = await fetch(RSS_URL);

    if (!RESPONSE.ok) {
        throw new Error(`HTTP error! status: ${RESPONSE.status}`);
    }
    const XML_TEXT = await RESPONSE.text();
    await cache.put(RSS_URL, new Response(XML_TEXT));

    return XML_TEXT;
}

async function saveImage(cache, items) {
    for (const ITEM of items) {
        await cache.add(ITEM.img);
    }
}

async function saveNews() {
    const CACHE = await caches.open(CACHE_NAME);
    const XML_TEXT = await saveFeed(CACHE);

    await saveImage(CACHE, readItems(XML_TEXT));
}

//use saved img so it also works offline
async function getSavedImage(cache, imageUrl) {
    const SAVED_IMAGE = await cache.match(imageUrl);
    if (SAVED_IMAGE) {
        return URL.createObjectURL(await SAVED_IMAGE.blob());
    }

    return imageUrl;
}

async function loadNews() {
    const CACHE = await caches.open(CACHE_NAME);
    const SAVED_FEED = await CACHE.match(RSS_URL);
    const ITEMS = readItems(await SAVED_FEED.text());

    for (const ITEM of ITEMS) {
        ITEM.img = await getSavedImage(CACHE, ITEM.img);
    }

    return ITEMS;
}

//free memory by removing old news before new news are made
function removeOldImages() {
    for (const PAGE of pages) {
        for (const ITEM of PAGE) {
            URL.revokeObjectURL(ITEM.img);
        }
    }
}

function splitIntoPages(items) {
    const RESULT = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
        RESULT.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
    return RESULT;
}

async function updateNews() {
    try {
        await saveNews();
    } catch (error) {
        console.error("Error updating news:", error);
    }

    try {
        const ITEMS = await loadNews();
        removeOldImages();
        pages = splitIntoPages(ITEMS);
    } catch (error) {
        console.error("Error loading news:", error);
    }
}

function createNewsItem(item) {
    const NEWS_ITEM = document.createElement("article");
    const IMG = document.createElement("img");
    const TEXT = document.createElement("div");
    const TITLE = document.createElement("h2");
    const DESCRIPTION = document.createElement("p");

    NEWS_ITEM.className = "news-item";
    IMG.className = "news-image";
    TEXT.className = "news-text";
    TITLE.className = "news-title";
    DESCRIPTION.className = "news-description";

    IMG.src = item.img;
    IMG.alt = "";
    TITLE.textContent = item.title;
    DESCRIPTION.textContent = item.description;

    TEXT.append(TITLE, DESCRIPTION);
    NEWS_ITEM.append(IMG, TEXT);

    return NEWS_ITEM;
}

//a new progrss bar starts the css animation from the beginning
function resetProgressBar() {
    const PROGRESS_BAR = document.createElement("div");

    PROGRESS_BAR.className = "progress-bar";
    PROGRESS.replaceChildren(PROGRESS_BAR);
}

function showPage() {
  if (pages.length === 0) {
    NEWS_LIST.textContent = "The news could not be loaded.";
  } else {
    console.log(NEWS_LIST);
    NEWS_LIST.replaceChildren();

    for (const ITEM of pages[currentPage]) {
      NEWS_LIST.append(createNewsItem(ITEM));
    }
  }

  resetProgressBar();
}

//go to next page & back to the first page after the last page
function goToNextPage() {
    currentPage++;
    if (currentPage >= pages.length) {
        currentPage = 0;
    }
}

//if the progress bar is full then show the next page and reset the progress bar
function handleProgressEnd() {
    goToNextPage();
    showPage();
}

async function startWiget() {
    await updateNews();
    showPage();

    PROGRESS.addEventListener("animationend", handleProgressEnd);
    setInterval(updateNews, REFRESH_TIME);
}

startWiget();