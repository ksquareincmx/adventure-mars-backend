import { Controller } from "./../../libraries/Controller";
import { ItemInstance } from "./../../models/ItemInstance";
import { FoundItem } from "./../../models/FoundItem";
import { Request, Response, Router } from "express";
import { Op } from "sequelize";
import {
  validateJWT,
  filterOwner,
  appendUser,
  stripNestedObjects,
  filterRoles
} from "./../../policies/General";
import { appendUnit, filterUnit } from "./../../policies/Unit";

export class ItemInstanceController extends Controller {
  constructor() {
    super();
    this.name = "iteminstance";
    this.model = ItemInstance;
  }

  routes(): Router {
    /**
      @api {get} /api/v1/iteminstance/ Get list of item instances
      @apiPermission access (leaders and scouts only get items from their units)
      @apiName GetItemInstances
      @apiGroup ItemInstance

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} body                   List of Item Instances
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {Number} body.name                Item name
      @apiSuccess {Number} body.description         Item description
      @apiSuccess {Number} body.itemId              Associated Item id
      @apiSuccess {Number} body.questId             Associated Quest id
      @apiSuccess {Number} body.unitId              Associated Unit id
      @apiSuccess {GeoPoint} body.location          Location of the item (GeoJson point)
    */
    this.router.get("/", validateJWT("access"), filterUnit(), (req, res) => this.find(req, res));

    /**
      @api {get} /api/v1/iteminstance/scout Get list of item instances with details for a certain scout
      @apiPermission scout
      @apiName GetItemInstancesScout
      @apiGroup ItemInstance

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} body                   List of Item Instances
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {Number} body.name                Item name
      @apiSuccess {Number} body.description         Item description
      @apiSuccess {Number} body.itemId              Associated Item id
      @apiSuccess {Number} body.questId             Associated Quest id
      @apiSuccess {Number} body.unitId              Associated Unit id
      @apiSuccess {GeoPoint} body.location          Location of the item (GeoJson point)
      @apiSuccess {Boolean} body.found              If the current user has found this item
      @apiSuccess {Date} body.foundTime             When the current user found this item
    */
    this.router.get(
      "/scout",
      validateJWT("access"),
      filterRoles(["scout"]),
      filterUnit(),
      (req, res) => this.findFromScout(req, res)
    );

    /**
      @api {get} /api/v1/iteminstance/:id Get one Item instance
      @apiPermission access (leaders and scouts only get items from their units)
      @apiName GetItemInstance
      @apiGroup ItemInstance

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object} body                     Item Instance
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {Number} body.name                Item name
      @apiSuccess {Number} body.description         Item description
      @apiSuccess {Number} body.itemId              Associated Item id
      @apiSuccess {Number} body.questId             Associated Quest id
      @apiSuccess {Number} body.unitId              Associated Unit id
      @apiSuccess {GeoPoint} body.location          Location of the item (GeoJson point)
    */
    this.router.get("/:id", validateJWT("access"), filterUnit(), (req, res) =>
      this.findOne(req, res)
    );

    /**
      @api {post} /api/v1/iteminstance/ Create Item Instance
      @apiPermission admin, leader (leaders can only add items to their units)
      @apiName PostItemInstance
      @apiGroup ItemInstance

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Item Instance
      @apiParam {Number} body.itemId              Associated Item id
      @apiParam {Number} body.name              Associated Item name
      @apiParam {Number} body.description              Associated Item description
      @apiParam {Number} body.questId             Associated Quest id
      @apiParam {Number} body.unitId              Associated Unit id
      @apiParam {GeoPoint} body.location          Location of the item (GeoJson point)

      @apiSuccess {Object} body                     Item Instance
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {Number} body.name                Item name
      @apiSuccess {Number} body.description         Item description
      @apiSuccess {Number} body.itemId              Associated Item id
      @apiSuccess {Number} body.questId             Associated Quest id
      @apiSuccess {Number} body.unitId              Associated Unit id
      @apiSuccess {GeoPoint} body.location          Location of the item (GeoJson point)
    */
    this.router.post(
      "/",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      stripNestedObjects(),
      appendUnit(),
      (req, res) => this.create(req, res)
    );

    /**
      @api {put} /api/v1/iteminstance/:id Modify Item Instance
      @apiPermission admin, leader (leaders can only modify items from their units)
      @apiName PutItemInstance
      @apiGroup ItemInstance

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Item Instance
      @apiParam {Number} body.id                  Item id
      @apiParam {Number} body.itemId              Associated Item id
      @apiParam {Number} body.name              Associated Item name
      @apiParam {Number} body.description              Associated Item description
      @apiParam {Number} body.questId             Associated Quest id
      @apiParam {Number} body.unitId              Associated Unit id
      @apiParam {GeoPoint} body.location          Location of the item (GeoJson point)

      @apiSuccess {Object} body                     Item Instance
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {Number} body.name                Item name
      @apiSuccess {Number} body.description         Item description
      @apiSuccess {Number} body.itemId              Associated Item id
      @apiSuccess {Number} body.questId             Associated Quest id
      @apiSuccess {Number} body.unitId              Associated Unit id
      @apiSuccess {GeoPoint} body.location          Location of the item (GeoJson point)
    */
    this.router.put(
      "/:id",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      stripNestedObjects(),
      filterUnit(),
      appendUnit(),
      (req, res) => this.update(req, res)
    );

    /**
      @api {delete} /api/v1/iteminstance/:id Delete Item Instance
      @apiPermission admin, leader (leaders can only delete items from their units)
      @apiName DeleteItemInstance
      @apiGroup ItemInstance

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]
    */
    this.router.delete(
      "/:id",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      filterUnit(),
      (req, res) => this.destroy(req, res)
    );

    return this.router;
  }

  findFromScout(req: Request, res: Response) {
    // Append found and foundTime information to iteminstance
    let userId = req.session.jwt.id;
    let itemInstances: any = null;
    ItemInstance.findAndCountAll({
      where: this.parseWhere(req),
      limit: this.parseLimit(req),
      offset: this.parseOffset(req),
      order: this.parseOrder(req),
      include: this.parseInclude(req)
    })
      .then(result => {
        res.set("Content-Count", String(result.count));
        itemInstances = result.rows;
        const itemInstanceIds: number[] = itemInstances.map(item => item.id);
        return FoundItem.findAll({
          where: {
            itemInstanceId: { [Op.in]: itemInstanceIds },
            userId
          }
        });
      })
      .then((foundItems: FoundItem[]) => {
        itemInstances = itemInstances.map(itemInstance => {
          // Convert Sequelize object to plain object
          itemInstance = itemInstance.toJSON();
          // Prepare new schema
          itemInstance.found = false;
          itemInstance.foundTime = null;
          const foundItem = foundItems.find(item => item.itemInstanceId === itemInstance.id);
          if (foundItem != null) {
            itemInstance.found = true;
            itemInstance.foundTime = foundItem.time;
          }
          return itemInstance;
        });
        res.status(200).json(itemInstances);
        return null;
      })
      .catch(err => {
        if (err) Controller.serverError(res, err);
      });
  }
}

const iteminstance = new ItemInstanceController();
export default iteminstance;
