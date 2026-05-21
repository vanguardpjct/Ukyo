import { Router, type IRouter } from "express";
import healthRouter from "./health";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.send("Bot online!");
});

router.use(healthRouter);

export default router;
