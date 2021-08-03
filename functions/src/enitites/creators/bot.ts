import axios from "axios";
import * as admin from "firebase-admin";
// import { v4 as uuidv4 } from 'uuid';

const API_INTERACTION_URL: string = 'https://298f55289fa7.ngrok.io/botoapp/us-central1/app/api/interaction/bot/'

export default class BotCreator {
  token: string;
  name: string;
  id: string;

  constructor(token: string, name: string) {
    this.token = token;
    this.name = name;
    this.id = '1' // uuidv4();
  }

  async createBot(): Promise<void> {
    if (!this.token) throw new Error("[token] is required");

    // 1. Set bot data to database
    this._setBotDataToDB();

    // 2. Create webhook via telegram API 
    this._setBotWebhook()
  }

  private _setBotWebhook(): Promise<any> {
    const url: string = API_INTERACTION_URL + this.id;
    return axios.get(`https://api.telegram.org/bot${this.token}/setWebhook?url=${url}`);
  }

  private _setBotDataToDB(): Promise<any> {
    const data = {
      token: this.token,
      name: this.name,
      state: 'IDLE',
      admins: [],
      subscribers: []
    };
    return admin.firestore().collection('bots').doc(this.id).set(data);
  }
}