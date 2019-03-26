import { Request, Response } from "express";
import { Controller } from "./../libraries/Controller";
import { filterOwner } from "./General";
import { User } from "./../models/User";
import { log } from "./../libraries/Log";
import { Op } from "sequelize";

/*
  Enforces access only to members of a unit
    key: key to compare unit id
*/
export function filterUnit(key: string = "unitId") {
  return (req: Request, res: Response, next: Function) => {
    if (req.session == null) req.session = {};
    let role = req.session.jwt.role;
    if (role === "admin") return next();
    let unitId = req.session.jwt.unitId;
    if (unitId == null) return Controller.unauthorized(res);
    if (req.session.where == null) req.session.where = {};
    req.session.where[key] = unitId;
    next();
  };
}

export function filterOwnerOrLeaderOfOwner() {
  return (req: Request, res: Response, next: Function) => {
    if (req.session == null) req.session = {};
    let unitId = req.session.jwt.unitId;
    let role = req.session.jwt.role;
    if (unitId == null || role == null) return Controller.unauthorized(res);
    if (role === "admin") return next();
    if (role === "scout") return filterOwner()(req, res, next);
    if (role === "leader") {
      return User.findAll({ where: { unitId } })
        .then((users: User[]) => {
          const userIds: number[] = users.map((user: User) => {
            return user.id;
          });
          if (req.session.where == null) req.session.where = {};
          req.session.where.userId = {
            $in: userIds
          };
          return next();
        })
        .catch(err => {
          log.error(err);
          return Controller.unauthorized(res);
        });
    }
    return Controller.unauthorized(res);
  };
}

/*
  Appends unitId to body (useful for enforcing ownership when creating items)
*/
export function appendUnit() {
  return (req: Request, res: Response, next: Function) => {
    if (req.session == null) req.session = {};
    let unitId = req.session.jwt.unitId;
    let role = req.session.jwt.role;
    // If admin, do nothing
    if (role === "admin") return next();
    if (unitId == null) return Controller.unauthorized(res);
    if (!req.body) req.body = {};
    req.body.unitId = unitId;
    next();
  };
}
