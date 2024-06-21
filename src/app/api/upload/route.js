import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import { uploadFileToCommons } from "../utils/uploadUtils";
import UserModel from "../../models/User";

const COMMONS_BASE_URL = "https://commons.wikimedia.org/w/api.php";

const generateRandomId = () => Math.random().toString(36).substring(7);

export const POST = async (req, res) => {
  const appUserId = req.cookies.get("app-user-id")?.value;

  const user = await UserModel.findById(appUserId);

  const data = await req.formData();
  const filename = data.get("filename");
  const text = data.get("text");
  const file = data.get("file");
  const fileId = generateRandomId();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  fs.writeFileSync(`./${fileId}.webm`, fileBuffer);

  const fileStream = fs.createReadStream(`./${fileId}.webm`);

  const response = await uploadFileToCommons(
    COMMONS_BASE_URL,
    user.wikimediaToken,
    {
      filename,
      text,
      file: fileStream,
    }
  );

  fs.unlinkSync(`./${fileId}.webm`);
  return NextResponse.json(response);
};
