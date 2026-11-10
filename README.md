# NU.nl News Widget

It shows the latest news from the NU.nl RSS feed on a 1920x1080 screen.

Live version: https://flaviofersu-pixel.github.io/mCube-StageOpdracht/

## How to run

Don't open index.html by double clicking it. The cache doesn't work on file://, so the widget will say the news could not be loaded.

- Run it with a local server instead or use Live Server in VS Code.

## What I did

- Recreated the design with the background, logo and Arial
- The feed and images are saved in the browser cache, so the widget still works offline
- 2 news items per page, the pages loop
- Progress bar for the page duration
- Slide-in animation for the news items

## Some choices

The page changes when the progress bar animation ends (animationend). I did it this way so there is only one timer and the bar and the page change can't get out of sync.

The widget always reads the news from the cache. If fetching the feed fails, it just shows the last saved news.

News items without an image are skipped, because the design always has an image.
