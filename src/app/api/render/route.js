import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { renderPage } from "../utils/renderPage";

const generateRandomId = () => Math.random().toString(36).substring(7);

export const POST = async (req, res) => {
  const { lat, long, initialZoom, finalZoom, duration, geojson } = await req.json();

  console.log("GOt reque  ", { lat, long, initialZoom, finalZoom, duration });
  if (!lat || !long || !initialZoom || !finalZoom || !duration) {
    return NextResponse.error("Invalid request");
  }

  const outputDir = path.join(__dirname, generateRandomId());

  // create output directory
  fs.mkdirSync(outputDir);
  console.log("Created directory: ", outputDir);

  console.log("Rendering page");
  const outputFilePath = await renderPage({
    initialZoom,
    finalZoom,
    lat,
    long,
    duration,
    outputDir,
    geojson
  });

  console.log("Rendered page: ", outputFilePath);

  const file = fs.readFileSync(outputFilePath, "base64");

  // cleanup output directory
  fs.rmdirSync(outputDir, { recursive: true });

  return NextResponse.json({ file });
};
