import * as admin from "firebase-admin";
import { v4 } from "uuid";

export const createScenario = async (creatorId: string, label: string) => {
    const id = v4();
    const defaultScenario = {
        creatorId,
        id,
        label,
        stages: []
    }
    await admin.firestore().collection('actions').doc(id).set(defaultScenario, { merge: true });
};

export const bindScenarioToBot = async (scenarioId: string, botId: string) => {
    await admin.firestore().collection('bots').doc(botId).update({ activeScenario: scenarioId });
    await admin.firestore().collection('actions').doc(scenarioId).update({ bot: botId });
};

export const updateScenarioActions = async (scenarioId: string, stage: any) => {
    const scenario = await (await admin.firestore().collection('actions').doc(scenarioId).get()).data() as any;
    const stages = [...(scenario.stages as any[])];
    if (stages.some(( { id }) => stage.id === id)) {
        const pos = (scenario.stages as any[]).findIndex(( { id }) => stage.id === id)
        stages[pos] = stage;
    } else {
        stages.push(stage);
    }
    await admin.firestore().collection('actions').doc(scenarioId).update({ stages });
};

export const deleteScenarioActions = async (scenarioId: string, stageId: any) => {
    const scenario = await (await admin.firestore().collection('actions').doc(scenarioId).get()).data() as any;
    const patchedStages = scenario.stages.filter(({ id }: any) => id !== stageId).map((stage: any) => ({...stage, triggers: stage.triggers.filter(({destinationId}: any) => destinationId !== stageId )}));
    await admin.firestore().collection('actions').doc(scenarioId).update({ stages: patchedStages });
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