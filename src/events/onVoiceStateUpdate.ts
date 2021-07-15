import { VoiceState } from 'discord.js'
import BotClient from '../structures/BotClient'
import DatabaseClient from '../structures/DatabaseClient'
import LavalinkClient from '../structures/LavalinkClient'

export default function onVoiceStateUpdate (lavalink: LavalinkClient, db: DatabaseClient) {
  return async function (client: BotClient, oldState: VoiceState, newState: VoiceState) {
    if (oldState.member?.user.bot) return
    if (newState.member?.user.bot) return

    if (oldState.channel && !newState.channel) {
      console.log('Leaving: ' + oldState.channelID)
      const members = oldState.channel.members
      const isHere = members.find((member) => member.id === client.user?.id)
      const many = members.filter((member) => !member.user.bot).size

      if (!isHere) return
      if (many > 0) return

      return await lavalink.stop(oldState.channel)
    }

    if (!oldState.channel && newState.channel) {
      console.log('Joining: ' + newState.channelID)
      const isMarked = await db.isMarked(newState.channel)
      if (!isMarked) return

      const members = newState.channel.members
      const isHere = members.find((member) => member.id === client.user?.id)

      if (isHere) return
      const theme = await db.getThemeURL(newState.channel)
      const track = await lavalink.getTrack(theme)

      lavalink.play(newState.channel, track)
      return
    }

    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      console.log('Moving: ' + oldState.channelID + ' -> ' + newState.channelID)
      const members = oldState.channel.members
      const isHere = members.find((member) => member.id === client.user?.id)
      const many = members.filter((member) => !member.user.bot).size

      if (many < 1 && isHere) lavalink.stop(oldState.channel)

      const isMarked = await db.isMarked(newState.channel)
      if (!isMarked) return

      const members2 = newState.channel.members
      const isHere2 = members2.find((member) => member.id === client.user?.id)

      if (isHere2) return
      const theme = await db.getThemeURL(newState.channel)
      const track = await lavalink.getTrack(theme)
      lavalink.play(newState.channel, track)
    }
  }
}
