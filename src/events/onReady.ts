import BotClient from '../structures/BotClient'
import DatabaseClient from '../structures/DatabaseClient'
import LavalinkClient from '../structures/LavalinkClient'

export default function onReady (lavalink: LavalinkClient, db: DatabaseClient) {
  return async function (client: BotClient) {
    const guilds = client.guilds.cache.filter((g) => !!g.me?.voice)

    lavalink.on('ready', async () => {
      for (const [, guild] of guilds) {
        if (!guild.me?.voice?.channel) continue

        const voiceChannel = guild.me?.voice.channel
        const membersIn = voiceChannel.members.filter((m) => !m.user.bot).size

        if (membersIn < 1) {
          await lavalink.stop(voiceChannel)
          continue
        }

        const theme = await db.getThemeURL(voiceChannel)
        const track = await lavalink.getTrack(theme)
        if (!track) continue

        lavalink.play(voiceChannel, track)
      }

      console.log('ready...')
    })
  }
}
