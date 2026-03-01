import { Router } from "express";
import { audio } from "../controllers/audio.js";
import { upload } from "../utils/fileUpload.js";

const audioRouter = Router();

audioRouter.post("/",upload.single("audio"), audio);

export default audioRouter;