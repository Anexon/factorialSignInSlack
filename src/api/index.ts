import express, { Router } from "express";
import commandsController from "./controllers/commands";

const router = Router();

router.use(commandsController);

export default router;
