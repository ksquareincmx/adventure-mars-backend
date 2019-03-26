import { Controller } from "./../../libraries/Controller";
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

export class QuestRunController extends Controller {
  constructor() {
    super();
    this.name = "questrun";
    this.model = QuestRun;
  }

  routes(): Router {
    /**
      @api {get} /api/v1/questrun/ Get list of completed quests
      @apiPermission access (scout gets only own completed quests, leader gets all from his unit)
      @apiName GetQuestRuns
      @apiGroup QuestRun

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} body                   List of completed quests
      @apiSuccess {Number} body.id                  Completed Quest id
      @apiSuccess {Number} body.questId             Associated Quest Id
      @apiSuccess {Number} body.userId              Id of the User that completed this quest
      @apiSuccess {Date} body.startTime             Time when the Quest was started
      @apiSuccess {Date} body.finishTime            Time when the Quest was completed
      @apiSuccess {Boolean} body.completed          If the Quest was successfully completed
    */
    this.router.get("/", validateJWT("access"), filterOwnerOrLeaderOfOwner(), (req, res) =>
      this.find(req, res)
    );

    /**
      @api {get} /api/v1/questrun/:id Get a completed quest
      @apiPermission access (scout gets only own completed quest, leader gets any from his unit)
      @apiName GetQuestRun
      @apiGroup QuestRun

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object} body                     Completed Quest
      @apiSuccess {Number} body.id                  Completed Quest id
      @apiSuccess {Number} body.questId             Associated Quest Id
      @apiSuccess {Number} body.userId              Id of the User that completed this quest
      @apiSuccess {Date} body.startTime             Time when the Quest was started
      @apiSuccess {Date} body.finishTime            Time when the Quest was completed
      @apiSuccess {Boolean} body.completed          If the Quest was successfully completed
    */
    this.router.get("/:id", validateJWT("access"), filterOwnerOrLeaderOfOwner(), (req, res) =>
      this.findOne(req, res)
    );

    /**
      @api {post} /api/v1/questrun/ Create a completed quest
      @apiPermission admin
      @apiName PostQuestRun
      @apiGroup QuestRun

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Completed Quest
      @apiParam {Number} body.questId             Associated Quest Id
      @apiParam {Number} body.userId              Id of the User that completed this quest
      @apiParam {Date} body.startTime             Time when the Quest was started
      @apiParam {Date} body.finishTime            Time when the Quest was completed
      @apiParam {Boolean} body.completed          If the Quest was successfully completed

      @apiSuccess {Object} body                     Completed Quest
      @apiSuccess {Number} body.id                  Completed Quest id
      @apiSuccess {Number} body.questId             Associated Quest Id
      @apiSuccess {Number} body.userId              Id of the User that completed this quest
      @apiSuccess {Date} body.startTime             Time when the Quest was started
      @apiSuccess {Date} body.finishTime            Time when the Quest was completed
      @apiSuccess {Boolean} body.completed          If the Quest was successfully completed
    */
    this.router.post(
      "/",
      validateJWT("access"),
      filterRoles(["admin"]),
      stripNestedObjects(),
      (req, res) => this.create(req, res)
    );

    /**
      @api {put} /api/v1/questrun/:id Modify a completed quest
      @apiPermission admin
      @apiName PutQuestRun
      @apiGroup QuestRun

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Completed Quest
      @apiParam {Number} body.id                  Completed Quest id
      @apiParam {Number} body.questId             Associated Quest Id
      @apiParam {Number} body.userId              Id of the User that completed this quest
      @apiParam {Date} body.startTime             Time when the Quest was started
      @apiParam {Date} body.finishTime            Time when the Quest was completed
      @apiParam {Boolean} body.completed          If the Quest was successfully completed

      @apiSuccess {Object} body                     Completed Quest
      @apiSuccess {Number} body.id                  Completed Quest id
      @apiSuccess {Number} body.questId             Associated Quest Id
      @apiSuccess {Number} body.userId              Id of the User that completed this quest
      @apiSuccess {Date} body.startTime             Time when the Quest was started
      @apiSuccess {Date} body.finishTime            Time when the Quest was completed
      @apiSuccess {Boolean} body.completed          If the Quest was successfully completed
    */
    this.router.put(
      "/:id",
      validateJWT("access"),
      filterRoles(["admin"]),
      stripNestedObjects(),
      (req, res) => this.update(req, res)
    );

    /**
      @api {delete} /api/v1/questrun/:id Delete a completed quest
      @apiPermission admin
      @apiName DeleteQuestRun
      @apiGroup QuestRun

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]
    */
    this.router.delete("/:id", validateJWT("access"), filterRoles(["admin"]), (req, res) =>
      this.destroy(req, res)
    );

    return this.router;
  }
}

const questrun = new QuestRunController();
export default questrun;
