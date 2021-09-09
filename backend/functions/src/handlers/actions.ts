import * as admin from "firebase-admin";
import { v4 } from "uuid";

export const createScenario = async (label: string) => {
    const id = v4();
    const analyticId = v4();
    const defaultScenario = {
        id,
        label,
        analyticId,
        stages: []
    }
    await admin.firestore().collection('actions').doc(id).set(defaultScenario, { merge: true });
    return analyticId;
};

export const bindScenarioToBot = async (scenarioId: string, botId: string) => {
    await admin.firestore().collection('bots').doc(botId).update({ activeScenario: scenarioId });
};

export const updateScenarioActions = async (scenarioId: string, stages: any) => {
    await admin.firestore().collection('actions').doc(scenarioId).update({ stages });
};