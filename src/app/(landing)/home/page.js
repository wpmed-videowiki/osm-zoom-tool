"use client";

import {
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Header from "../../components/Header";
import RenderProgress from "../../components/RenderProgress";
import UploadForm from "../../components/UploadForm";
import { renderVideo } from "../../actions/render";
import { useEffect, useRef, useState } from "react";
import { PlayCircleOutline } from "@mui/icons-material";
import { useElementWidth } from "../../hooks/useElementWidth";
import { getAppUser } from "../../actions/auth";

// Import Map without ssr
import dynamic from "next/dynamic";
const Map = dynamic(() => import("../../components/RenderMap"), {
  ssr: false,
});

const EXPORT_WIDTH = 1280;
const MIN_DURATION = 1000;
const MAX_DURATION = 10000;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [initialZoom, setInitialZoom] = useState(1);
  const [finalZoom, setFinalZoom] = useState(1);
  const [center, setCenter] = useState([12.447, -87.632]);
  const [finalCenter, setFinalCenter] = useState([]);
  const [duration, setDuration] = useState(2000);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoBlob, setVideoBlob] = useState(null);
  const [shapes, setShapes] = useState({});
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const groupRef = useRef(null);

  const containerWidth = useElementWidth(containerRef);

  const onRender = async () => {
    setLoading(true);
    const data = {
      initialZoom: initialZoom + Math.log2(EXPORT_WIDTH / mapDimensions.width),
      finalZoom: finalZoom + Math.log2(EXPORT_WIDTH / mapDimensions.width),
      duration,
      lat: finalCenter[0],
      long: finalCenter[1],
      geojson: JSON.stringify(shapes),
    };
    try {
      const response = await renderVideo(data);
      const byteArray = Uint8Array.from(
        atob(response.file)
          .split("")
          .map((char) => char.charCodeAt(0))
      );
      const blob = new Blob([byteArray], { type: "video/webm" });
      setVideoUrl(URL.createObjectURL(blob));
      setVideoBlob(blob);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const onVideoUploaded = (imageinfo) => {
    setUploadedUrl(imageinfo.descriptionurl);
  };

  const onShapeAdd = (shape) => {
    const id = shape.layer._leaflet_id;
    const shapeData = {
      shape: shape.shape,
      latlng: shape.layer._latlng,
      latlngs: shape.layer._latlngs,
      radius: shape.layer._mRadius,
    };
    setShapes((shapes) => ({ ...shapes, [id]: shapeData }));
  };

  const onShapeChange = (shape) => {
    const id = shape.layer._leaflet_id;
    const shapeData = {
      shape: shape.shape,
      latlng: shape.layer._latlng,
      latlngs: shape.layer._latlngs,
      radius: shape.layer._mRadius,
    };
    setShapes((shapes) => ({ ...shapes, [id]: shapeData }));
  };

  const onShapeRemove = (shape) => {
    const id = shape.layer._leaflet_id;
    setShapes((shapes) => {
      const newShapes = { ...shapes };
      delete newShapes[id];
      return newShapes;
    });
  };

  useEffect(() => {
    setMapDimensions({
      width: containerWidth,
      height: (containerWidth * 9) / 16,
    });
  }, [containerWidth]);

  useEffect(() => {
    (async () => {
      await getAppUser();
    })();
  }, []);

  return (
    <main className="home">
      <Header />
      <Container maxWidth="xl" sx={{ marginTop: 10 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <div ref={containerRef}>
              <Map
                key="map"
                dimensions={mapDimensions}
                lat={center[0]}
                long={center[1]}
                zoomSnap={0.5}
                zoom={zoom}
                onMove={(data) => setCenter([data.lat, data.lng])}
                onZoomChange={setZoom}
                mode="edit"
                groupRef={groupRef}
                onShapeAdd={onShapeAdd}
                onShapeRemove={onShapeRemove}
                onShapeChange={onShapeChange}
              />
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <h1>Controls</h1>
            <Stack spacing={4}>
              <Stack spacing={3}>
                <Stack
                  spacing={1}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">
                    Start Zoom: {initialZoom}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setInitialZoom(zoom)}
                    variant="contained"
                  >
                    Mark Start Zoom
                  </Button>
                </Stack>
                <Stack
                  spacing={1}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">End Zoom: {finalZoom}</Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setFinalZoom(zoom);
                      setFinalCenter(center);
                    }}
                    variant="contained"
                  >
                    Mark End Zoom
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  <TextField
                    type="number"
                    label="Duration (ms)"
                    variant="outlined"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    InputProps={{
                      min: MIN_DURATION,
                      step: MIN_DURATION,
                      max: MAX_DURATION,
                    }}
                  />
                  {duration < MIN_DURATION && (
                    <Typography variant="caption" color="error">
                      Duration must be at least {MIN_DURATION}ms
                    </Typography>
                  )}
                  {duration > MAX_DURATION && (
                    <Typography variant="caption" color="error">
                      Duration must be at most {MAX_DURATION}ms
                    </Typography>
                  )}
                </Stack>
              </Stack>
              <Stack spacing={2}>
                <Stack spacing={1}>
                  {videoUrl && (
                    <video
                      controls
                      src={videoUrl}
                      style={{ width: "100%" }}
                      autoPlay
                      muted
                    />
                  )}
                  {loading && <RenderProgress duration={duration} />}
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<PlayCircleOutline />}
                    disabled={
                      !finalZoom ||
                      !initialZoom ||
                      finalZoom === initialZoom ||
                      !duration ||
                      duration < MIN_DURATION ||
                      duration > MAX_DURATION ||
                      loading
                    }
                    onClick={onRender}
                  >
                    Render
                  </Button>
                  {uploadedUrl && (
                    <Stack
                      justifyContent="center"
                      alignItems="center"
                      width="100%"
                      spacing={2}
                      mt={2}
                    >
                      <a href={uploadedUrl} target="_blank" rel="noreferrer">
                        <Button variant="outlined" size="small" fullWidth>
                          View on Commons
                        </Button>
                      </a>
                    </Stack>
                  )}
                  {videoUrl && !loading && (
                    <UploadForm
                      license="self|CC-BY-SA-4.0"
                      permission=""
                      provider="commons"
                      video={videoBlob}
                      categories={[]}
                      onUploaded={onVideoUploaded}
                    />
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
