import { Router, type IRouter } from "express";
import healthRouter from "./health";
import audienceRouter from "./audience";

const router: IRouter = Router();

router.use(healthRouter);
router.use(audienceRouter);

export default router;
