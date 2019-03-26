import { Controller } from "./../../libraries/Controller";
import { Unit } from "./../../models/Unit";
import { User } from "./../../models/User";
import { Request, Response, Router } from "express";
import {
  validateJWT,
  filterOwner,
  appendUser,
  stripNestedObjects,
  filterRoles
} from "./../../policies/General";
import { Op } from "sequelize";

export class UnitController extends Controller {
  constructor() {
    super();
    this.name = "unit";
    this.model = Unit;
  }

  routes(): Router {
    /**
      @api {get} /api/v1/unit/ Get list of Units
      @apiPermission none
      @apiName GetUnits
      @apiGroup Unit

      @apiHeader { String } Content-Type Application/Json

      @apiSuccess {Object[]} body                   List of Units
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Unit name
    */
    this.router.get("/", (req, res) => this.find(req, res));

    /**
      @api {get} /api/v1/unit/details Get list of Units with details
      @apiPermission admin
      @apiName GetUnitsDetails
      @apiGroup Unit

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} body                   List of Units with details
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Unit name
      @apiSuccess {Number} body.memberCount         Number of members of this unit
      @apiSuccess {Object[]} body.leader            Details of the leader
      @apiSuccess {Number} body.leader.id           Id of the leader
      @apiSuccess {String} body.leader.name         Name of the leader
      @apiSuccess {String} body.leader.email        Email of the leader

    */
    this.router.get("/details", validateJWT("access"), filterRoles(["admin"]), (req, res) =>
      this.findWithDetails(req, res)
    );

    /**
      @api {get} /api/v1/unit/:id Get one Unit
      @apiPermission none
      @apiName GetUnit
      @apiGroup Unit

      @apiHeader { String } Content-Type Application/Json

      @apiSuccess {Object} body                     Unit
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Unit name
    */
    this.router.get("/:id", (req, res) => this.findOne(req, res));

    /**
      @api {post} /api/v1/unit/ Create Unit
      @apiPermission admin
      @apiName PostUnit
      @apiGroup Unit

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Unit
      @apiParam {String} body.name                Unit name

      @apiSuccess {Object} body                     Unit
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Unit name
    */
    this.router.post(
      "/",
      validateJWT("access"),
      filterRoles(["admin"]),
      stripNestedObjects(),
      (req, res) => this.create(req, res)
    );

    /**
      @api {put} /api/v1/unit/:id Modify Unit
      @apiPermission admin
      @apiName PutUnit
      @apiGroup Unit

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Unit
      @apiParam {Number} body.id                  Item id
      @apiParam {String} body.name                Unit name

      @apiSuccess {Object} body                     Unit
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Unit name
    */
    this.router.put(
      "/:id",
      validateJWT("access"),
      filterRoles(["admin"]),
      stripNestedObjects(),
      (req, res) => this.update(req, res)
    );

    /**
      @api {delete} /api/v1/unit/:id Delete Unit
      @apiPermission admin
      @apiName DeleteUnit
      @apiGroup Unit

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]
    */
    this.router.delete("/:id", validateJWT("access"), filterRoles(["admin"]), (req, res) =>
      this.destroy(req, res)
    );

    return this.router;
  }

  findWithDetails(req: Request, res: Response) {
    let results: any = {};
    this.model
      .findAndCountAll({
        where: this.parseWhere(req),
        limit: this.parseLimit(req),
        offset: this.parseOffset(req),
        order: this.parseOrder(req),
        include: this.parseInclude(req)
      })
      .then(result => {
        res.set("Content-Count", String(result.count));
        const units = result.rows;
        // Convert sequelize objects to plain objects
        results.units = units.map(unit => unit.toJSON());
        // Get unit leaders
        results.unitIds = units.map(item => item.id);
        return User.findAll({ where: { unitId: { [Op.in]: results.unitIds }, role: "leader" } });
      })
      .then((leaders: User[]) => {
        const unitsWithLeaders = results.units.map(unit => {
          const leader = leaders.find(user => user.unitId === unit.id);
          if (leader != null) {
            unit.leader = {
              id: leader.id,
              name: leader.name,
              email: leader.email
            };
          } else {
            unit.leader = null;
          }
          return unit;
        });
        results.units = unitsWithLeaders;

        // Get unit members
        return User.findAll({ where: { unitId: { [Op.in]: results.unitIds }, role: "scout" } });
      })
      .then((scouts: User[]) => {
        const unitsWithMembers = results.units.map(unit => {
          const members: User[] = scouts.filter(user => user.unitId === unit.id);
          unit.memberCount = members.length;
          return unit;
        });
        results.units = unitsWithMembers;

        res.status(200).json(results.units);
      })
      .catch(err => {
        if (err) Controller.serverError(res, err);
      });
  }
}

const unit = new UnitController();
export default unit;
