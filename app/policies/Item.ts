import { Request, Response } from "express";
import { Controller } from "./../libraries/Controller";

/*
  Shows only public items to leaders
*/
export function onlyPublicToLeaders() {
  return (req: Request, res: Response, next: Function) => {
    if (req.session == null) req.session = {};
    let role = req.session.jwt.role;
    if (role == null) return Controller.unauthorized(res);
    if (req.session.where == null) req.session.where = {};
    if (role !== "admin") req.session.where.type = "public";
    next();
  };
}
