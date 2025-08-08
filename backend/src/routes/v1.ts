import authRouter from "@/modules/auth/auth.router";
import questionRouter from "@/modules/question/question.router";
import { Router } from "express";

const v1Router = Router();

const routes = [
  { path: "/questions", router: questionRouter },
  { path: "/auth", router: authRouter },
];

routes.forEach((route) => v1Router.use(route.path, route.router));

export default v1Router;
