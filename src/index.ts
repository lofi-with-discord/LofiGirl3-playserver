import BotClient from './structures/BotClient'
import RestServer from './structures/RestServer'
import DatabaseClient from './structures/DatabaseClient'
import LavalinkClient from './structures/LavalinkClient'

import onReady from './events/onReady'
import onVoiceStateUpdate from './events/onVoiceStateUpdate'

const bot = new BotClient()
const db = new DatabaseClient()
const lavalink = new LavalinkClient(bot)
const rest = new RestServer(bot, db, lavalink)

bot.registEvent('ready', onReady(lavalink, db))
bot.registEvent('voiceStateUpdate', onVoiceStateUpdate(lavalink, db))

rest.listen()
db.fetchMarkedChannels()
