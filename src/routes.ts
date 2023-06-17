import express from "express";
import { fetchTeletextPages } from "./services/fetchTeletextPages";
import { processRequest } from "zod-express-middleware";
import {
  getImageParamsSchema,
  getImageQuerySchema,
} from "./schemas/getImage.schema";
import { getImage } from "./services/getImage";

const router = express.Router();

router.get(
  "/:pageNumber/:subpageNumber.png",
  processRequest({
    params: getImageParamsSchema,
    query: getImageQuerySchema,
  }),
  async (req, res, next) => {
    try {
      const imageResponse = await getImage(
        req.params.pageNumber,
        req.params.subpageNumber,
        new Date(req.query.time * 1000)
      );

      if (imageResponse === undefined) {
        return res.status(404).send({ message: "Image not found" });
      }

      res
        .header("Last-Modified", imageResponse.modifiedDate.toUTCString())
        .header("Content-Type", "image/png")
        .send(imageResponse.image);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/update", async (req, res, next) => {
  try {
    await fetchTeletextPages();
    res.send({ done: true });
  } catch (error) {
    next(error);
  }
});

export default router;
