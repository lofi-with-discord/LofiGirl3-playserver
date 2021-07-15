import dotenv from 'dotenv'
import knex, { Knex } from 'knex'
import { VoiceChannel } from 'discord.js'

dotenv.config()

export default class DatabaseClient {
  private db: Knex
  private markCache: string[] = []

  constructor () {
    this.db = knex({
      client: 'mysql',
      connection: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT || 3306),
        user: process.env.DATABASE_USER || 'lofigirl',
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_SCHEMA || 'lofigirl'
      }
    })
  }

  public async getThemeURL (channel: VoiceChannel): Promise<string> {
    const [{ theme } = []] = await this.db.select('theme').where('guild', channel.guild.id).from('channels').limit(1)
    const [{ url } = []] = await this.db.select('url').where('id', theme || 1).from('themes').limit(1)

    return url
  }

  public async isMarked (channel: VoiceChannel) {
    if (this.markCache.includes(channel.id)) return true

    const [isMarked] = await this.db.select('*').where('id', channel.id).from('channels').limit(1)
    if (isMarked) this.markCache.push(channel.id)

    return !!isMarked
  }

  public async clearCache (channelID: string) {
    const index = this.markCache.indexOf(channelID)
    this.markCache.splice(index)
  }
}
