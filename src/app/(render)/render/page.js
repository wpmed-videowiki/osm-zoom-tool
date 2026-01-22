"use client";;
import { use } from "react";
import "./style.css";
import dynamic from "next/dynamic";

const RenderMap = dynamic(() => import("../../components/RenderMap"), {
  ssr: false,
});

const RenderPage = props => {
  const searchParams = use(props.searchParams);
  const zoomSnap = parseFloat(searchParams.zoom_snap);
  const zoom = parseFloat(searchParams.zoom);
  const lat = parseFloat(searchParams.lat);
  const long = parseFloat(searchParams.long);
  const width = parseInt(searchParams.width);
  const height = parseInt(searchParams.height);
  const geojson = searchParams.geojson
    ? JSON.parse(atob(searchParams.geojson))
    : null;

  return (
    <RenderMap
      dimensions={{ width, height }}
      lat={lat}
      long={long}
      zoomSnap={zoomSnap}
      zoom={zoom}
      geojson={geojson}
      mode="view"
    />
  );
};

export default RenderPage;
