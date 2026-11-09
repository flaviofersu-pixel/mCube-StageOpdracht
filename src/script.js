const RSS_URL = "https://rss.app/feeds/LrTk1cMRxeTKDJHz.xml";
const CACHE_NAME = "rss-widget";

// html-content
const STATUS = document.getElementById("status");
const ITEMS_BOX = document.getElementById("items");
//fetch
fetch(RSS_URL)
    .then(function(resp) {
        console.log("Status:", resp.status);
        if (!resp.ok) {
            throw new Error("HTTP error " + resp.status);
        }
        return resp.text();
    })
    .then(function(data) {
        // console.log(data);

        let parser = new DOMParser(),
            xmlDoc = parser.parseFromString(data, "text/xml");
        console.log(xmlDoc.getElementsByTagName("title")[0].textContent);
    })
    .catch(function (error) {
        console.error("Fetch failed:", error);
    });
