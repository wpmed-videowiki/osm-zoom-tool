export const metadata = {
  title: "OSM Zoom tool",
  description: "a tool to generate videos from openstreetmap locations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
