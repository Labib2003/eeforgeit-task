import authRouter from "@/modules/auth/auth.router";
import configRouter from "@/modules/config/config.router";
import questionRouter from "@/modules/question/question.router";
import submissionRouter from "@/modules/submissoin/submission.router";
import userRouter from "@/modules/user/user.router";
import { Router } from "express";

const v1Router = Router();

const routes = [
  { path: "/auth", router: authRouter },
  { path: "/users", router: userRouter },
  { path: "/config", router: configRouter },
  { path: "/questions", router: questionRouter },
  { path: "/submissions", router: submissionRouter },
];

routes.forEach((route) => v1Router.use(route.path, route.router));

export default v1Router;
