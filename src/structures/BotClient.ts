import dotenv from 'dotenv'
import { Client } from 'discord.js'

dotenv.config()

export default class BotClient extends Client {
  constructor () {
    super()

    this.token = process.env.DISCORD_TOKEN!
    this.login()
  }

  public registEvent = (event: string, handler: (...args: any[]) => void) =>
    this.on(event, (...args) => handler(this, ...args))
}
