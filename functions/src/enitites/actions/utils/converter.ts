import firebase from "firebase";
import { BotActions } from "../../../types/action";
import BotActionManager from "../manager";

export const actionCoverter = {
    toFirestore(action: BotActions.Manager | undefined | null): firebase.firestore.DocumentData {
        if (!action) return {};
        let { lastActionIndex, actionsMap, actions } = {...action as BotActions.Manager};
        actions = actions.map((item: BotActions.Action) => ({...item, stages: JSON.stringify(item.stages as BotActions.Reply[])}));
        return {
            lastActionIndex,
            actionsMap,
            actions
        };
    },
    fromFirestore(
      data: firebase.firestore.DocumentData
    ): BotActions.Manager {
      let { lastActionIndex, actions, actionsMap} = {...data as BotActions.Manager};
      actions = actions.map((item: BotActions.Action) => ({...item, stages: JSON.parse(item.stages as string)}));
      return new BotActionManager(actions, actionsMap, lastActionIndex);
    }
  };