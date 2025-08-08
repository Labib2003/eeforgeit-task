import questionRouter from "@/modules/question/question.router";
import { Router } from "express";

const v1Router = Router();

const routes = [{ path: "/questions", router: questionRouter }];

routes.forEach((route) => v1Router.use(route.path, route.router));

export default v1Router;
