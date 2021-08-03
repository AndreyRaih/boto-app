import * as admin from "firebase-admin";
import { BotActions } from "../../types/action";
import { actionCoverter } from "../../utils/converter";
import BotActionManager from "../actions/manager";
import { BotInteraction } from "../../types/interaction";
import { ACTIONS } from "../../utils/defaults";



const DEFAULT_ACTION_MANAGER: BotInteraction.IManager = new BotActionManager(ACTIONS);

export default class ActionsCreator {
  id: string;
  action: BotActions.Action;

  constructor(id: string, action: BotActions.Action) {
    this.id = id;
    this.action = action;
  }

  async createAction(): Promise<void> {
    if (!this.id) throw new Error("[id] is required");

    // 1. Set action data to database
    this._setActionToDB();
  }

  private async _setActionToDB() {
    let existManager = await this._getExistDataById(this.id);
    if (!existManager) existManager = DEFAULT_ACTION_MANAGER;

    const patchedManager: BotInteraction.IManager = {
      ...existManager,
      // actions: this._patchExistActions(existManager.actions, this.action)
    }

    return admin.firestore().collection('actions').doc(this.id).withConverter(actionCoverter).set(patchedManager, { merge: true });
  }

  private _getExistDataById(id: string): Promise<BotInteraction.IManager | null | undefined> {
    return Promise.resolve(null); // admin.firestore().collection('actions').doc(id).withConverter(actionCoverter).get().then(data => data.data());
  }

  //@ts-ignore
  private _patchExistActions(actions: BotActions.Action[], newAction: BotActions.Action): BotActions.Action[] {
    const existActions = [...actions];

    if (existActions.some(({ trigger }) => newAction?.trigger === trigger)) {
      const pos = existActions.findIndex(({ trigger }) => newAction?.trigger === trigger);
      existActions.splice(pos, 1, newAction);
      return existActions;
    }
    return [...existActions, newAction];
  }
}