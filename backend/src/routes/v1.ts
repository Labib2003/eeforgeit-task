import postRouter from "@/modules/post/post.router";
import { Router } from "express";

const v1Router = Router();
const routes = [{ path: "/posts", router: postRouter }];
routes.forEach((route) => v1Router.use(route.path, route.router));

export default v1Router;
