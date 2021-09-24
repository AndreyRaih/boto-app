import axios from "axios";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from 'uuid';

const API_INTERACTION_URL: string = 'https://298f55289fa7.ngrok.io/botoapp/us-central1/app/api/interaction/bot/'

export default class BotCreator {
  token: string;
  editToken: string | null;
  name: string;
  id: string;
  userId: string;

  constructor(userId: string, token: string, name: string) {
    this.userId = userId;
    this.token = token;
    this.editToken = null;
    this.name = name;
    this.id = uuidv4();
  }

  get webhookUrl() {
    const url: string = API_INTERACTION_URL + this.id;
    return `https://api.telegram.org/bot${this.token}/setWebhook?url=${url}`
  }

  async createBot(): Promise<void> {
    if (!this.token) throw new Error("[token] is required");

    // 1. Set bot data to database
    this._setBotDataToDB();

    // 2. Create webhook via telegram API 
    this._setBotWebhook()
  }

  private _setBotWebhook(): Promise<any> {
    return axios.get(this.webhookUrl);
  }

  private _setBotDataToDB(): Promise<any> {
    const data = {
      creatorId: this.userId,
      token: this.token,
      name: this.name,
      editToken: this.editToken,
      activeScenario: null,
      admins: [],
      subscribers: [],
      webhookUrl: this.webhookUrl
    };
    console.log(data);
    return admin.firestore().collection('bots').doc(this.id).set(data);
  }
}