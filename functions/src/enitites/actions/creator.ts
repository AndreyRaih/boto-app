import * as admin from "firebase-admin";
import { BotActions } from "../../types/action";
import { actionCoverter } from "./utils/converter";
import BotActionManager from "./manager";

const DEFAULT_ACTIONS_LIST: BotActions.Action[] = [
  {
    id: "1",
    trigger: '/action_one',
    stages: [
      {
        text: 'Reply from actions 1 trigger'
      },
      {
        text: 'Reply from actions 1 command',
        picture: 'https://ryady.ru/upload/resize_cache/iblock/6c2/600_600_1/000000000000060033_0.jpg',
        keyboard: {
          isInline: true,
          buttons: [
            {
              text: 'button one',
              callback_data: 'test 1'
            },
            {
              text: 'button two',
              callback_data: 'test 2'
            }
          ]
        }
      }
    ]
  },
  {
    id: "2",
    trigger: '/action_two',
    stages: [
      {
        text: 'Reply from actions 2 trigger'
      },
      {
        text: 'Reply from actions 2 trigger',
        keyboard: {
          isInline: true,
          buttons: [
            {
              text: 'button one',
              callback_data: 'test 1'
            },
            {
              text: 'button two',
              callback_data: 'test 2'
            }
          ]
        }
      }
    ]
  }
]

const DEFAULT_ACTION_MANAGER: BotActions.Manager = new BotActionManager(DEFAULT_ACTIONS_LIST);

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

    const patchedManager: BotActions.Manager = {
      ...existManager,
      // actions: this._patchExistActions(existManager.actions, this.action)
    }

    return admin.firestore().collection('actions').doc(this.id).withConverter(actionCoverter).set(patchedManager, { merge: true });
  }

  private _getExistDataById(id: string): Promise<BotActions.Manager | null | undefined>  {
    return Promise.resolve(null); // admin.firestore().collection('actions').doc(id).withConverter(actionCoverter).get().then(data => data.data());
  }

  //@ts-ignore
  private _patchExistActions(actions: BotActions.Action[], newAction: BotActions.Action): BotActions.Action[] {
    const existActions = [...actions];

    if (existActions.some(({ id }) => newAction?.id === id)) {
      const pos = existActions.findIndex(({ id }) => newAction?.id === id);
      existActions.splice(pos, 1, newAction);
      return existActions;
    }
    return [...existActions, newAction];
  }
}