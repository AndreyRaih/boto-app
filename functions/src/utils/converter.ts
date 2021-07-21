import firebase from "firebase";
import { BotActions } from "../types/action";
import { BotInteraction } from "../types/interaction";
import BotActionManager from "../enitites/actions/manager";

export const actionCoverter = {
    toFirestore(action: BotInteraction.IManager | undefined | null): firebase.firestore.DocumentData {
        if (!action) return {};
        let { actionsProgressMap, actions } = {...action as BotInteraction.IManager};
        actions = actions.map((item: BotActions.Action) => ({
          ...item,
          stages: JSON.stringify(item.stages as BotActions.Stage[])
        }));
        return {
          actionsProgressMap,
            actions
        };
    },
    fromFirestore(
      data: firebase.firestore.DocumentData
    ): BotInteraction.IManager {
      let { actions, actionsProgressMap } = {...data as BotInteraction.IManager};
      actions = actions.map((item: BotActions.Action) => ({
        ...item,
        stages: JSON.parse(item.stages as string)
      }));
      return new BotActionManager(actions, actionsProgressMap);
    }
  };