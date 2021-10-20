import * as admin from "firebase-admin";

export const createAnalyticSuite = async (id: string) => {
    const defaultAnalyticSuite = {
        basic: {
            messages: 0,
            users: 0,
            leads: 0
        },
        users: {
            total: 0,
            lead: 0,
            active: 0,
            prev: {
                lead: 0,
                active: 0,
            }
        },
        timings: {
            max: 0,
            min: 0,
            count: 0
        },
        scenario: {
            events: []
        }
    }
    await admin.firestore().collection('analytic').doc(id).set(defaultAnalyticSuite);
}
