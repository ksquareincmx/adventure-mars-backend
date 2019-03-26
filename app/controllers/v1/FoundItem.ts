import { Controller } from "./../../libraries/Controller";
import { FoundItem } from "./../../models/FoundItem";
import { ItemInstance } from "./../../models/ItemInstance";
import { QuestRun } from "../../models/QuestRun";
import { Request, Response, Router } from "express";
import {
  validateJWT,
  filterOwner,
  appendUser,
  stripNestedObjects,
  filterRoles
} from "./../../policies/General";
import { filterOwnerOrLeaderOfOwner } from "./../../policies/Unit";
import * as _ from "lodash";
import { log } from "../../libraries/Log";

export class FoundItemController extends Controller {
  constructor() {
    super();
    this.name = "founditem";
    this.model = FoundItem;
  }

  routes(): Router {
    /**
      @api {get} /api/v1/founditem/ Get list of found items
      @apiPermission access (scout gets only own items, leader gets all from his unit)
      @apiName GetFoundItems
      @apiGroup FoundItem

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} body                   List of completed quests
      @apiSuccess {Number} body.id                  Found Item id
      @apiSuccess {Number} body.itemInstanceId      Associated Item Id
      @apiSuccess {Number} body.questId             Associated Quest Id
      @apiSuccess {Number} body.userId              Id of the User that found this item
      @apiSuccess {Date} body.time                  Time when the Item was found
    */
    this.router.get("/", validateJWT("access"), filterOwnerOrLeaderOfOwner(), (req, res) =>
      this.find(req, res)
    );

    /**
      @api {get} /api/v1/founditem/:id Get one Found Item
      @apiPermission access (scout gets only own item, leader gets any from his unit)
      @apiName GetFoundItem
      @apiGroup FoundItem

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object} body                     Found Item
      @apiSuccess {Number} body.id                  Found Item id
      @apiSuccess {Number} body.itemInstanceId      Associated Item Id
      @apiSuccess {Number} body.questId             Associated Quest Id
      @apiSuccess {Number} body.userId              Id of the User that found this item
      @apiSuccess {Date} body.time                  Time when the Item was found
    */
    this.router.get("/:id", validateJWT("access"), filterOwnerOrLeaderOfOwner(), (req, res) =>
      this.findOne(req, res)
    );

    /**
      @api {post} /api/v1/founditem/ Create Found Item
      @apiPermission admin
      @apiName PostFoundItem
      @apiGroup FoundItem

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Found Item
      @apiParam {Number} body.itemInstanceId      Associated Item Id
      @apiParam {Number} body.questId             Associated Quest Id
      @apiParam {Number} body.userId              Id of the User that found this item
      @apiParam {Date} body.time                  Time when the Item was found

      @apiSuccess {Object} body                     Found Item
      @apiSuccess {Number} body.id                  Found Item id
      @apiSuccess {Number} body.itemInstanceId      Associated Item Id
      @apiSuccess {Number} body.questId             Associated Quest Id
      @apiSuccess {Number} body.userId              Id of the User that found this item
      @apiSuccess {Date} body.time                  Time when the Item was found
    */
    this.router.post(
      "/",
      validateJWT("access"),
      filterRoles(["admin"]),
      stripNestedObjects(),
      (req, res) => this.create(req, res)
    );

    /**
      @api {delete} /api/v1/founditem/:id Delete Found Item
      @apiPermission admin
      @apiName DeleteFoundItem
      @apiGroup FoundItem

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]
    */
    this.router.delete("/:id", validateJWT("access"), filterRoles(["admin"]), (req, res) =>
      this.destroy(req, res)
    );

    /**
      @api {post} /api/v1/founditem/found Report that an Item was found
      @apiPermission access
      @apiName ReportFoundItem
      @apiGroup FoundItem

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Found Data
      @apiParam {Number} body.itemInstanceId      Associated Item Id

      @apiSuccess {Object} body                     Found Data Response
      @apiSuccess {Number} body.id                  Found Item id
      @apiSuccess {Date} body.time                  Time when the Item was found
      @apiSuccess {Boolean} body.questComplete      If the quest was completed with this item find
    */
    this.router.post(
      "/found",
      validateJWT("access"),
      stripNestedObjects(),
      filterOwner(),
      appendUser(),
      (req, res) => this.found(req, res)
    );

    return this.router;
  }

  found(req: Request, res: Response) {
    console.log(req.body);
    if (req.body.itemInstanceId == null) {
      return Controller.badRequest(res, new Error("itemInstanceId missing in body"));
    }
    const { itemInstanceId } = req.body;
    let values: any = {
      itemInstanceId
    };

    ItemInstance.findOne({ where: { id: itemInstanceId } })
      .then(
        (itemInstance: ItemInstance): PromiseLike<FoundItem> => {
          if (!itemInstance) {
            Controller.notFound(res);
            throw null;
          }
          values.questId = itemInstance.questId;
          values.userId = req.body.userId;
          values.time = new Date();
          return FoundItem.create(values);
        }
      )
      .then((founditem: FoundItem) => {
        values.id = founditem.id;
        return this.checkQuestCompleted(values.questId, values.userId);
      })
      .then(questComplete => {
        const response = {
          id: values.id,
          time: values.time,
          questComplete
        };
        res.status(201).json(response);
        return null;
      })
      .catch(err => {
        if (err) Controller.serverError(res, err);
      });
  }

  checkQuestCompleted(questId: number, userId: number): PromiseLike<boolean> {
    return QuestRun.findOne({ where: { userId, questId } })
      .then((questRun: QuestRun) => {
        if (questRun == null) return false;
        if (questRun.completed) return true;

        let results = {
          questItems: [],
          foundItems: []
        };
        // Get all quest and found items to compare
        return ItemInstance.findAll({ where: { questId } })
          .then((items: ItemInstance[]) => {
            results.questItems = items;
            return FoundItem.findAll({ where: { questId, userId } });
          })
          .then((items: FoundItem[]) => {
            results.foundItems = items;
            let questItemIds: number[] = results.questItems.map(item => item.id);
            let foundItemIds: number[] = results.foundItems.map(item => item.itemInstanceId);
            let remaining: number[] = questItemIds.filter(
              item => -1 === foundItemIds.indexOf(item)
            );
            if (remaining.length) {
              return false;
            } else {
              // Mark Quest Run as completed
              questRun.completed = true;
              questRun.finishTime = new Date();
              return questRun.save().then(() => true);
            }
          });
      })
      .catch(err => {
        log.error(err);
        return false;
      });
  }
}

const founditem = new FoundItemController();
export default founditem;
