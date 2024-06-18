import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
const SetViewOnClick = ({ onZoomChange }) => {
  const map = useMapEvent("click", (e) => {
    map.setView(e.latlng, map.getZoom(), {
      animate: true,
      duration: 10,
    });
  });

  useMapEvent("zoomend", (e) => {
    onZoomChange(map.getZoom());
  });

  return null;
};

const Map = () => {
  const [map, setMap] = useState(null);

  const [zoom, setZoom] = useState(1);
  const [initialZoom, setInitialZoom] = useState(1);
  const [finalZoom, setFinalZoom] = useState(1);
  const playAnimation = () => {
    setZoom(initialZoom);
    setTimeout(() => {
      let currentZoom = initialZoom;
      const interval = setInterval(() => {
        let newZoom = currentZoom + 0.005;
        map.setZoom(newZoom);
        console.log({ newZoom });
        currentZoom = newZoom;
        if (currentZoom >= finalZoom) {
          clearInterval(interval);
        }
      }, 1000 / 30);
    }, 100);
  };

  const displayMap = useMemo(
    () => (
      <MapContainer
        center={[12.447, -87.632]}
        zoom={zoom}
        zoomSnap={0.05}
        id="map"
        ref={setMap}
      >
        <TileLayer
          // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnClick onZoomChange={setZoom} />
      </MapContainer>
    ),
    []
  );

  return (
    <>
      <h1>Map</h1>
      <Button onClick={() => setInitialZoom(zoom)}>Mark Initial Zoom</Button>
      <Button onClick={() => setFinalZoom(zoom)}>Mark Final Zoom</Button>
      <Button onClick={playAnimation} id="play">
        Play Animation
      </Button>

      <h3>
        Initial Zoom: {initialZoom}, Final Zoom: {finalZoom}
      </h3>
      {displayMap}
    </>
  );
};

export default Map;
