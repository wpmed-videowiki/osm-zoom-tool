import {
  FeatureGroup,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { GeomanControls } from "react-leaflet-geoman-v2";
import { useEffect, useState } from "react";

const TILE_URL = process.env.NEXT_PUBLIC_TILE_URL;

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

const SetViewEvents = ({ onZoomChange, onMove }) => {
  const map = useMap();

  useMapEvent("zoomend", (e) => {
    onZoomChange && onZoomChange(map.getZoom());
    onMove && onMove(map.getCenter());
  });

  useMapEvent("moveend", (e) => {
    onMove && onMove(map.getCenter());
  });

  return null;
};

const RenderMap = ({
  lat,
  long,
  zoomSnap,
  zoom,
  onZoomChange,
  onMove,
  dimensions,
  mode = "view",
  geojson,
  groupRef,
  onShapeAdd,
  onShapeChange,
  onShapeRemove,
}) => {
  const [viewRef, setViewRef] = useState(null);

  useEffect(() => {
    if (viewRef?.getLayers().length === 0 && geojson) {
      Object.values(geojson).forEach((layer) => {
        /**
         * Circle
         * Marker
         * CircleMarker
         * Line
         * Rectangle
         * Polygon
         */
        switch (layer.shape) {
          case "Circle":
            L.circle(layer.latlng, { radius: layer.radius }).addTo(viewRef);
            break;
          case "Marker":
            L.marker(layer.latlng).addTo(viewRef);
            break;
          case "CircleMarker":
            L.circleMarker(layer.latlng).addTo(viewRef);
            break;
          case "Line":
            L.polyline(layer.latlngs).addTo(viewRef);
            break;
          case "Rectangle":
            L.rectangle(layer.latlngs).addTo(viewRef);
            break;
          case "Polygon":
            L.polygon(layer.latlngs).addTo(viewRef);
            break;
        }
      });
    }
  }, [geojson, viewRef]);

  return (
    <MapContainer
      key={`map-${mode}`}
      center={[lat, long]}
      zoomSnap={zoomSnap}
      zoom={zoom}
      zoomControl={mode === "edit"}
      id="rendered-map"
      style={{ width: dimensions.width, height: dimensions.height }}
      pmIgnore={false}
    >
      <FeatureGroup ref={mode === "edit" ? groupRef : setViewRef}>
        {mode === "edit" && (
          <GeomanControls
            key="geoman-controls"
            options={{
              position: "topright",
              drawText: false,
              rotateMode: false,
              cutPolygon: false,
            }}
            globalOptions={{
              continueDrawing: false,
              editable: true,
              allowCutting: false,
              allowRotation: false,
            }}
            onCreate={onShapeAdd}
            onChange={onShapeChange}
            onLayerRemove={onShapeRemove}
          />
        )}
      </FeatureGroup>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={TILE_URL}
      />
      <SetViewEvents onZoomChange={onZoomChange} onMove={onMove} />
    </MapContainer>
  );
};

export default RenderMap;
