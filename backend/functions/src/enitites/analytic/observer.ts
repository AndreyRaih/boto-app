import * as admin from "firebase-admin";

export const EVENT_MAP = {
    BASIC: {
        SET_USER: 'BASIC_SET_USER',
        SET_MESSAGE: 'BASIC_SET_MESSAGE',
        SET_LEAD: 'BASIC_SET_LEAD'
    },
    TIMING: {
        UPDATE: 'TIMING_UPDATE'
    },
    SCENARIO: {
        ADD_EVENT: 'SCENARIO_ADD_EVENT'
    },
    USER: {
        ADD_ACTIVE: 'USER_ADD_ACTIVE',
        ADD_LEAD: 'USER_ADD_LEAD'
    }
}

export default class BotoAnalyticObserver {
    id: string;
    instance: any;

    constructor(id: string) {
        this.id = id;
    }

    async initialize() {
        this.instance = await (await admin.firestore().collection('analytic').doc(this.id).get()).data();
    }

    updateSuite(event: string, payload: any) {
        switch(event) {
            case EVENT_MAP.BASIC.SET_USER: 
                this._setBasicUserHandler();
                break;
            case EVENT_MAP.BASIC.SET_MESSAGE: 
                this._setBasicMessageHandler();
                break;
            case EVENT_MAP.BASIC.SET_LEAD: 
                this._setBasicLeadHandler();
                break;
            case EVENT_MAP.TIMING.UPDATE: 
                this._setUpdateTimingsHandler(payload);
                break;
            case EVENT_MAP.SCENARIO.ADD_EVENT: 
                this._addScenarioEventHandler(payload);
                break;
            case EVENT_MAP.USER.ADD_ACTIVE: 
                this._addActiveUserHandler();
                break;
            case EVENT_MAP.USER.ADD_LEAD: 
                this._addLeadUserHandler();
                break;
            default: break;
        }
        return this.setSuiteSnapshot();
    }

    async setSuiteSnapshot() {
        return admin.firestore().collection('analytic').doc(this.id).set(this.instance, { merge: true });
    }

    getSuiteSnapshot() {
        return {
            basic: {
                effectivity: this._getEffectivityPercentage(this.instance.basic),
                ...this.instance.basic
            },
            scenario: this.instance.scenario,
            timings: {
                average: this._getTimingAverage(this.instance.timings)
            },
            users: this.instance.users
        };
    }

    _setBasicUserHandler() {
        this.instance.basic.users = this.instance.basic.users + 1;
    }

    _setBasicMessageHandler() {
        this.instance.basic.messages = this.instance.basic.messages + 1;
    }

    _setBasicLeadHandler() {
        this.instance.basic.leads = this.instance.basic.leads + 1;
    }

    _addActiveUserHandler() {
        this.instance.users.prev.active = this.instance.users.active;
        this.instance.users.active += 1;
        this.instance.users.total += 1;
    }

    _addLeadUserHandler() {
        this.instance.users.prev.lead = this.instance.users.lead;
        this.instance.users.lead += 1;
    }

    _setUpdateTimingsHandler(value: number) {
        if (!value || !this.instance.timings.min || this.instance.timings.min > value) this.instance.timings.min = value;
        if (!value || !this.instance.timings.max || this.instance.timings.max < value) this.instance.timings.max = value;
        this.instance.timings.counter = this.instance.timings.counter + 1;
    }

    _addScenarioEventHandler(event: any) {
        if (event.label) this.instance.scenario.events.push(event);
    }

    _getEffectivityPercentage({users, leads}: any) {
        return (leads / users) * 100
    }

    _getTimingAverage({ min, max, count }: any) {
        const step = (max - min) / (count - 1);
        const sequence = [min];
        for (let i = 0; i <= count; i++) {
            sequence.push(step);
        }
        sequence.push(max);
        return sequence.reduce((a: number, b: number) => (a + b)) / sequence.length;
    }

}