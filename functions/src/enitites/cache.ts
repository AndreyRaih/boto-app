import BotData from "./bot/bot";

export default class BotCache {
  cache: Map<string, BotData> = new Map();

  constructor() {
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  set(key: string, bot: BotData): void {
    this.cache.set(key, bot);
  }

  get(key: string): BotData {
    return this.cache.get(key) as BotData;
  }
}