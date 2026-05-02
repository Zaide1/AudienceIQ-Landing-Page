import { Router, type IRouter } from "express";
import healthRouter from "./health";
import audienceRouter from "./audience";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(audienceRouter);
router.use(chatRouter);

export default router;
