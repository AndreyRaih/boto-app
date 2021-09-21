import * as admin from "firebase-admin";

export const createAnalyticSuite = async (id: string) => {
    const defaultAnalyticSuite = {
        basic: {
            messages: 0,
            users: 0,
            invoices: 0,
            effectivity: 0
        },
        users: {
            total: 0,
            ordered: 0,
            active: 0,
            prev: {
                ordered: 0,
                active: 0,
            }
        },
        timings: {
            session: 0,
            steps: 0
        },
        scenario: {
            events: []
        }
    }
    await admin.firestore().collection('analytic').doc(id).set(defaultAnalyticSuite);
}

export const getAnalyticSuiteById = async (id: string) => {
    const data = await (await admin.firestore().collection('analytic').doc(id).get()).data();
    return data;
}
