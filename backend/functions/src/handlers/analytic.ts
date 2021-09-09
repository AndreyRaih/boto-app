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

export const getInvoicesByBotId = async (botId: string) => {
    const { invoices, subscribers } = await (await admin.firestore().collection('bots').doc(botId).get()).data() as any;
    return invoices.length ? invoices.map((invoice: any) => {
        const subscriber = subscribers.find(({ id }: any) => id === invoice.id)
        return {
            ...invoice,
            ...subscriber
        }
    }) : [];
}