import * as admin from "firebase-admin";
import { v4 } from "uuid";

export const createScenario = async (creatorId: string, label: string | null = null) => {
    const id = v4();
    const defaultScenario = {
        creatorId,
        id,
        label,
        stages: []
    }
    await admin.firestore().collection('actions').doc(id).set(defaultScenario, { merge: true });
    return id;
};

export const updateScenarioActions = async (scenarioId: string, stages: any) => {
    await admin.firestore().collection('actions').doc(scenarioId).update({ stages });
};

export const getScenarioListById = async (creatorId: string) => {
    const list = await admin.firestore().collection('actions').listDocuments();
    const result = [];
    for (const doc of list) {
        const item = await (await doc.get()).data() as any;
        if (item.creatorId === creatorId) result.push(item)
    }
    return result;
}