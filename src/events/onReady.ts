import BotClient from '../structures/BotClient'
import DatabaseClient from '../structures/DatabaseClient'
import LavalinkClient from '../structures/LavalinkClient'

export default function onReady (lavalink: LavalinkClient, db: DatabaseClient) {
  return async function (client: BotClient) {
    const guilds = await client.guilds.cache.filter((g) => !!g.voice)
    for (const [, guild] of guilds) {
      if (!guild.voice?.channel) continue

      const voiceChannel = guild.voice.channel
      const membersIn = voiceChannel.members.filter((m) => !m.user.bot).size

      if (membersIn < 1) {
        await lavalink.stop(voiceChannel)
        continue
      }

      const theme = await db.getThemeURL(voiceChannel)
      const track = await lavalink.getTrack(theme)
      lavalink.play(voiceChannel, track)
    }

    console.log('ready...')
  }
}
