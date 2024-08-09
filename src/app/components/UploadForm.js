import { Button, Stack, TextField, Typography } from "@mui/material";
import { fetchCommonsImage, uploadFile } from "../actions/commons";
import { useEffect, useState } from "react";
import { UploadFile } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { popupCenter } from "../utils/popupTools";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

const getWikiPageText = ({
  description,
  source,
  date,
  license,
  author,
  permission,
  categories,
}) =>
  `
== {{int:filedesc}} ==
{{Information
|Description=${description}
|Date=${date}
|Source=${source}
|Permission=${permission}
|Author=${author}
}}

== {{int:license-header}} ==
{{${license}}}

[[Category:OSM Zoom]]
${categories.join("\n")}
`.trim();
const UploadForm = ({
  license,
  permission,
  video,
  provider,
  onUploaded,
  disabled,
  categories = [],
  exportType,
}) => {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [fileTitle, setFileTitle] = useState("");
  const [debouncedFileTitle] = useDebounce(fileTitle, 500);
  const outputExtension = exportType === "image" ? "png" : "webm";

  const [pageAlreadyExists, setPageAlreadyExists] = useState(false);
  const [text, setText] = useState(
    getWikiPageText({
      description: `Created by [https://osm-zoom-tool.wmcloud.org/ OSM Zoom Tool].`,
      date: new Date().toISOString().split("T")[0],
      source: `[https://osm-zoom-tool.wmcloud.org/ OSM Zoom Tool]`,
      author: `[https://osm-zoom-tool.wmcloud.org/ OSM Zoom Tool]`,
      license: license,
      permission,
      categories,
    })
  );

  const resetPageText = () => {
    setText(
      getWikiPageText({
        description: `Created by [https://kenburnseffect-tool.wmcloud.org/ OSM Zoom Tool].`,
        date: new Date().toISOString().split("T")[0],
        source: `[https://osm-zoom-tool.wmcloud.org/ OSM Zoom Tool]`,
        author: `[https://osm-zoom-tool.wmcloud.org/ OSM Zoom Tool]`,
        license: license,
        permission,
        categories,
      })
    );
  };

  const onUpload = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("filename", `File:${fileTitle}.${outputExtension}`);
      formData.set("text", text);
      formData.set("file", video);
      formData.set("provider", provider);

      const response = await uploadFile(formData);

      onUploaded(response.imageinfo);
      toast.success("File uploaded successfully");
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!debouncedFileTitle) return;
    async function checkFileExists() {
      const page = await fetchCommonsImage(`File:${debouncedFileTitle}.${outputExtension}`);
      console.log({page})
      if (page && page.pageid) {
        setPageAlreadyExists(true);
      } else {
        setPageAlreadyExists(false);
      }
    }
    checkFileExists();
  }, [debouncedFileTitle]);

  switch (provider) {
    case "commons":
      if (!session?.user?.wikimediaId) {
        return (
          <Stack spacing={1}>
            <Typography variant="body2">
              Please sign in with Wikimedia to upload this file.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{
                minWidth: 200,
              }}
              startIcon={<UploadFile />}
              onClick={() => popupCenter("/login?provider=wikimedia", "Login")}
            >
              Login to Wikimedia
            </Button>
          </Stack>
        );
      }
      break;
    case "nccommons":
      if (!session?.user?.nccommonsId) {
        return (
          <Stack spacing={1}>
            <Typography variant="body2">
              Please sign in with NC Commons to upload this file.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{
                minWidth: 200,
              }}
              startIcon={<UploadFile />}
              onClick={() => popupCenter("/login?provider=nccommons", "Login")}
            >
              Login to NC Commons
            </Button>
          </Stack>
        );
      }
      break;
    default:
      break;
  }

  return (
    <Stack direction="column" spacing={2}>
      <Stack spacing={1}>
        <Typography variant="body2">File name</Typography>
        <TextField
          name="title"
          value={fileTitle}
          onChange={(e) => setFileTitle(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: "File:",
            endAdornment: `.${outputExtension}`,
          }}
        />
        {pageAlreadyExists && (
          <Typography variant="body2" color="orange">
            File with this name already exists. Using this file name will
            override the existing file.
          </Typography>
        )}
        {fileTitle.length >= 230 && (
          <Typography variant="body2" color="red">
            File name is too long. It should be less than 240 characters.
          </Typography>
        )}
      </Stack>
      <Stack spacing={1}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2">File Page source</Typography>
          <Button size="small" onClick={resetPageText}>
            Reset
          </Button>
        </Stack>
        <TextField
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          size="small"
          multiline
          rows={10}
          maxRows={10}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{
            minWidth: 200,
          }}
          startIcon={<UploadFile />}
          onClick={onUpload}
          disabled={
            loading ||
            disabled ||
            fileTitle.length >= 230 ||
            fileTitle.length === 0
          }
        >
          {loading
            ? "Uploading..."
            : `Upload to ${
                provider === "nccommons" ? "NC Commons" : "Wikimedia Commons"
              }`}
        </Button>
      </Stack>
    </Stack>
  );
};

export default UploadForm;
