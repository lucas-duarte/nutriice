import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import patientsRouter from "./patients";
import dietsRouter from "./diets";
import appointmentsRouter from "./appointments";
import bioimpedanceRouter from "./bioimpedance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(patientsRouter);
router.use(dietsRouter);
router.use(appointmentsRouter);
router.use(bioimpedanceRouter);

export default router;
