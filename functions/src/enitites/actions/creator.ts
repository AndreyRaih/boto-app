import * as admin from "firebase-admin";
import { BotActions } from "../../types/action";

export default class ActionsCreator {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  async createAction(): Promise<void> {
    if (!this.id) throw new Error("[id] is required");

    // 1. Set action data to database
    this._setActionToDB();
  }

  private _setActionToDB() {
    const actionDefaultObj: BotActions.Manager = {
      config: {},
      actions: [
        {
          id: "1",
          stages: []
        },
        {
          id: "2",
          stages: []
        }
      ],
      actionsMap: {},
      lastActionIndex: 0
    }
    return admin.firestore().collection('actions').doc(this.id).set(actionDefaultObj);
  }
}