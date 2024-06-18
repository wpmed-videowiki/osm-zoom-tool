import AppProviders from "../AppProviders";

export const metadata = {
  title: "OSM Zoom Tool",
  description:
    "A tool to create OSM Zoom videos from static images on Wikimedia Commons and NC Commons.",
};

export default function RootLayout({ children }) {
  return <AppProviders>{children}</AppProviders>;
}
