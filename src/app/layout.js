import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VideoWiki: OSM Zoom Tool",
  description:
    "A tool to create OSM Zoom videos from static images on Wikimedia Commons and NC Commons.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
