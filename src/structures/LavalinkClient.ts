import dotenv from 'dotenv'
import { get } from 'superagent'
import BotClient from './BotClient'
import { VoiceChannel } from 'discord.js'
import { Manager } from '@lavacord/discord.js'

dotenv.config()

export default class LavalinkClient extends Manager {
  private trackCache: { [search: string]: string }

  constructor (client: BotClient) {
    const nodeConfig = {
      id: 'main',
      host: process.env.LAVALINK_HOST || 'localhost',
      port: process.env.LAVALINK_PORT,
      password: process.env.LAVALINK_PASSWORD
    }

    super(client, [nodeConfig])

    this.trackCache = {}
    client.once('ready', () =>
      this.connect().catch(() => {
        console.log('cannot resolve lavalink instance')
        process.exit(1)
      }))
  }

  public async getTrack (search: string) {
    if (this.trackCache[search]) return this.trackCache[search]

    const node = this.idealNodes[0]
    const url = new URL(`http://${node.host}:${node.port}/loadtracks`)
    url.searchParams.append('identifier', search)

    const res = await get(url.toString())
      .set('Authorization', node.password)

    const trackData = res.body.tracks?.[0]?.track
    if (!trackData) return ''

    this.trackCache[search] = trackData

    return trackData
  }

  public async play (channel: VoiceChannel, track: string) {
    await this.stop(channel)
    setTimeout(async () => {
      const player = await this.join({ guild: channel.guild.id, channel: channel.id, node: 'main' })
      await player.play(track)
      player.once('end', (data) => data.reason === 'FINISHED' && this.play(channel, track))
    }, 1000)
  }

  public async stop (channel: VoiceChannel) {
    await this.leave(channel.guild.id)
  }
}
