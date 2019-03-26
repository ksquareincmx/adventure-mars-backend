import { Controller } from "./../../libraries/Controller";
import { User } from "./../../models/User";
import { Request, Response, Router } from "express";
import { validateJWT, isSelfUser, filterRoles } from "./../../policies/General";
import { filterUnit } from "./../../policies/Unit";

export class UserController extends Controller {
  constructor() {
    super();
    this.name = "user";
    this.model = User;
  }

  routes(): Router {
    /**
      @api {get} /api/v1/user/ Get list of users
      @apiPermission admin, leader (admin gets all users, leader gets only users from his unit)
      @apiName GetUsers
      @apiGroup User

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} users                  List of users
      @apiSuccess {Number} users.id                 User id
      @apiSuccess {String} users.name               User name
      @apiSuccess {String} users.email              User email
      @apiSuccess {String} users.role               User role ("scout", "leader", "admin")
      @apiSuccess {Object} users.currentLocation    User current location (GeoJson Point)
      @apiSuccess {Number} users.unitId             User unit Id
    */
    this.router.get(
      "/",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      filterUnit(),
      (req, res) => this.find(req, res)
    );

    /**
      @api {get} /api/v1/user/:id Get user details
      @apiPermission access (only getting currently authenticated user is supported)
      @apiName GetUser
      @apiGroup User

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object} user                    User
      @apiSuccess {Number} user.id                 User id
      @apiSuccess {String} user.name               User name
      @apiSuccess {String} user.email              User email
      @apiSuccess {String} user.role               User role ("scout", "leader", "admin")
      @apiSuccess {Object} user.currentLocation    User current location (GeoJson Point)
      @apiSuccess {Number} user.unitId             User unit Id
    */
    this.router.get("/:id", validateJWT("access"), isSelfUser(), (req, res) =>
      this.findOne(req, res)
    );

    /**
      @api {put} /api/v1/user/:id Modify user details
      @apiPermission admin
      @apiName PutUser
      @apiGroup User

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} user                    User
      @apiParam {Number} user.id                 User id
      @apiParam {String} user.name               User name
      @apiParam {String} user.email              User email
      @apiParam {String} user.role               User role ("scout", "leader", "admin")
      @apiParam {Object} user.currentLocation    User current location (GeoJson Point)
      @apiParam {Number} user.unitId             User unit Id

      @apiSuccess {Object} user                    User
      @apiSuccess {Number} user.id                 User id
      @apiSuccess {String} user.name               User name
      @apiSuccess {String} user.email              User email
      @apiSuccess {String} user.role               User role ("scout", "leader", "admin")
      @apiSuccess {Object} user.currentLocation    User current location (GeoJson Point)
      @apiSuccess {Number} user.unitId             User unit Id
    */
    this.router.put("/:id", validateJWT("access"), filterRoles(["admin", "leader"]), (req, res) =>
      this.update(req, res)
    ); // only admin can edit user

    /**
      @api {delete} /api/v1/user/:id Delete user
      @apiPermission admin
      @apiName DeleteUser
      @apiGroup User

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]
    */
    this.router.delete("/:id", validateJWT("access"), filterRoles(["admin"]), (req, res) =>
      this.destroy(req, res)
    ); // only admin can delete user

    /**
      @api {post} /api/v1/user/:id/location Report User Location
      @apiPermission access
      @apiName ReportUserLocation
      @apiGroup User

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} data                   Location Data
      @apiParam {Object} data.currentLocation   User current location (GeoJson Point)

      @apiSuccess {Object} user                    User
      @apiSuccess {Number} user.id                 User id
      @apiSuccess {String} user.name               User name
      @apiSuccess {String} user.email              User email
      @apiSuccess {String} user.role               User role ("scout", "leader", "admin")
      @apiSuccess {Object} user.currentLocation    User current location (GeoJson Point)
      @apiSuccess {Number} user.unitId             User unit Id
    */
    this.router.post("/:id/location", validateJWT("access"), isSelfUser(), (req, res) =>
      this.reportLocation(req, res)
    );

    return this.router;
  }

  reportLocation(req: Request, res: Response) {
    const { id } = req.params;
    const { currentLocation } = req.body;
    if (id == null) return Controller.badRequest(res, "No id in url");
    if (currentLocation == null) return Controller.badRequest(res, "No currentLocation in body");
    // Update
    User.findOne({
      where: { id }
    })
      .then(result => {
        if (!result) {
          res.status(404).end();
          throw null;
        }
        return result.update({ currentLocation });
      })
      .then(result => {
        if (!result) res.status(404).end();
        else res.status(200).json(result);
        return null;
      })
      .catch(err => {
        if (err) Controller.serverError(res, err);
      });
  }
}

const controller = new UserController();
export default controller;
