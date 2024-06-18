import fs from "fs";
import async from "async";
import child_process from "child_process";
import { exec } from "child_process";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";

const WIDTH = 1280;
const HEIGHT = 720;
const SCREENSHOT_EXTENSION = "png";
const MAP_SELECTOR = "#rendered-map";

const getExecutablePath = () => {
  if (process.env.CHROME_BIN) {
    return process.env.CHROME_BIN;
  }

  let executablePath;
  if (process.platform === "linux") {
    try {
      executablePath = child_process
        .execSync("which chromium-browser")
        .toString()
        .split("\n")
        .shift();
    } catch (e) {
      // NOOP
    }

    if (!executablePath) {
      executablePath = child_process
        .execSync("which chromium")
        .toString()
        .split("\n")
        .shift();
      if (!executablePath) {
        throw new Error("Chromium not found (which chromium)");
      }
    }
  } else if (process.platform === "darwin") {
    executablePath =
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else {
    throw new Error("Unsupported platform: " + process.platform);
  }

  return executablePath;
};

puppeteer.use(StealthPlugin());
// const WIDTH = 1920;
// const HEIGHT = 1080;

export async function renderPage({
  initialZoom,
  finalZoom,
  lat,
  long,
  duration,
  geojson,
  concurrency = 3,
  outputDir,
}) {
  // open pages in parallel to speed up rendering
  const FPS = 30;
  const zoomIncrement = (finalZoom - initialZoom) / ((duration / 1000) * FPS);

  // create configs for each frame to go from initialZoom to finalZoom
  const configs = Array.from({ length: (duration / 1000) * FPS }).map(
    (_, index) => {
      return {
        zoom: initialZoom + index * zoomIncrement,
        index,
        lat,
        long,
      };
    }
  );

  const browsers = await Promise.all(
    Array.from({ length: concurrency }).map(async () => {
      const browser = await puppeteer.launch({
        executablePath: getExecutablePath(),
        headless: true,
        args: [
          "--headless=new",
          "--no-sandbox",
          "--autoplay-policy=no-user-gesture-required",
          `--window-size=${WIDTH},${HEIGHT}`,
          "--start-fullscreen",
        ],
        defaultViewport: {
          width: WIDTH,
          height: HEIGHT,
        },
      });
      return browser;
    })
  );

  const pages = await Promise.all(
    browsers.map(async (browser) => {
      const page = await browser.newPage();
      return page;
    })
  );

  const asyncRender = (cb) => async (config) => {
    try {
      const page = pages.shift();
      await page.goto(
        `http://localhost:3000/render?zoom=${
          config.zoom
        }&zoom_snap=${zoomIncrement}&lat=${config.lat}&long=${
          config.long
        }&width=${WIDTH}&height=${HEIGHT}&geojson=${btoa(geojson)}`
      );
      await page.waitForSelector(MAP_SELECTOR);
      await page.waitForNetworkIdle({ idleTime: 1000 });
      const map = await page.$(MAP_SELECTOR);
      const screenshot = await map.screenshot({ type: SCREENSHOT_EXTENSION });

      await fs.promises.writeFile(
        `${outputDir}/${`0000${config.index}`.slice(
          -5
        )}.${SCREENSHOT_EXTENSION}`,
        screenshot
      );

      pages.push(page);

      cb(null, {
        screenshot,
        index: config.index,
        config,
      });
    } catch (err) {
      console.log(err);
      cb(null);
    }
  };
  const renderFuncArray = [];
  configs.forEach((config) => {
    renderFuncArray.push((cb) => asyncRender(cb)(config));
  });

  await new Promise((resolve, reject) => {
    async.parallelLimit(renderFuncArray, concurrency, (err, results) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      resolve(results);
    });
  });

  // close all pages
  await Promise.all(pages.map((page) => page.close()));
  // close all browsers
  await Promise.all(browsers.map(async (browser) => await browser.close()));

  // create video from screenshots with silent audio track using ffmpeg
  const videoPath = `${outputDir}/video.webm`;
  const ffmpegCommand = `ffmpeg -framerate ${FPS} -pattern_type glob -i "${outputDir}/*.${SCREENSHOT_EXTENSION}" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -c:v libvpx-vp9 -c:a libvorbis -shortest ${videoPath}`;

  await new Promise((resolve, reject) => {
    exec(ffmpegCommand, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      resolve();
    });
  });

  return videoPath;
}
