import * as admin from "firebase-admin";
import { BotActions } from "../../types/action";
import { actionCoverter } from "../../utils/converter";
import BotActionManager from "../actions/manager";
import { BotInteraction } from "../../types/interaction";

const DEFAULT_ACTIONS_LIST: BotActions.Action[] = [
  {
    trigger: '/action_one',
    greetingMessage: 'begin of action none',
    stages: [
      {
        text: 'Reply 1 from test input action',
        type: "INPUT",
        step: 0,
        description: 'Test input'
      },
      {
        text: 'Reply 2 from test action form with picture and keyboard',
        type: 'SELECT',
        step: 1,
        picture: 'https://ryady.ru/upload/resize_cache/iblock/6c2/600_600_1/000000000000060033_0.jpg',
        optionsAppearance: 'KEYBOARD',
        options: [
          {
            text: 'Button one',
            value: 'test1'
          },
          {
            text: 'Button two',
            value: 'test2'
          }
        ]
      }
    ]
  },
  {
    trigger: '/action_two',
    stages: [
      {
        text: 'Reply 1 from test action form with picture and keyboard',
        type: 'SELECT',
        step: 1,
        picture: 'https://ryady.ru/upload/resize_cache/iblock/6c2/600_600_1/000000000000060033_0.jpg',
        optionsAppearance: 'BUTTON',
        description: 'test select',
        options: [
          {
            text: 'Button one',
            value: 'test1'
          },
          {
            text: 'Button two',
            value: 'test2'
          }
        ]
      }
    ]
  }
]

const DEFAULT_ACTION_MANAGER: BotInteraction.IManager = new BotActionManager(DEFAULT_ACTIONS_LIST);

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

  private _getExistDataById(id: string): Promise<BotInteraction.IManager | null | undefined>  {
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