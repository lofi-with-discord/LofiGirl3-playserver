import dotenv from 'dotenv'
import { get } from 'superagent'
import BotClient from './BotClient'
import { Manager } from '@lavacord/discord.js'
import { StageChannel, VoiceChannel } from 'discord.js'

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
    client.once('ready', () => {
      this.connect()
        .catch(() => {
          console.log('cannot resolve lavalink instance')
          process.exit(1)
        })
    })
  }

  public async getTrack (search: string) {
    if (this.trackCache[search]) return this.trackCache[search]
    console.log('s :: ', search)

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

  public async play (channel: VoiceChannel | StageChannel, track: string) {
    await this.stop(channel, true)
    console.log('p -> ', channel.id)

    setTimeout(async () => {
      const player = await this.join({ guild: channel.guild.id, channel: channel.id, node: 'main' })
      await player.play(track)

      player.once('end', (data) => data.reason === 'FINISHED' && this.play(channel, track))

      if (channel.type !== 'GUILD_STAGE_VOICE') return
      player.once('start', async () => {
        await channel.createStageInstance({ topic: 'Lo-Fi' }).catch(() => {})
        await (await channel.guild.members.fetch(channel.guild.me?.id!)).voice.setSuppressed(false).catch((e) => {
          console.log(e)
          channel.guild.me?.voice.setRequestToSpeak(true).catch(() => {})
        })
      })
    }, 1000)
  }

  public async stop (channel: VoiceChannel | StageChannel, fromPlay = false) {
    if (!fromPlay) console.log('l <- ', channel.id)

    await this.leave(channel.guild.id)
    if (channel.type === 'GUILD_STAGE_VOICE' && channel.members.filter((v) => !v.user.bot).size < 1 && channel.stageInstance) {
      await channel.stageInstance.delete().catch(() => {})
    }
  }
}
