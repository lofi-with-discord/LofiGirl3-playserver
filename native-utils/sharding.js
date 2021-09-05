const io = require('@pm2/io')
const dotenv = require('dotenv')
const { ShardingManager } = require('discord.js')

dotenv.config()
const channelCount = io.metric({ name: 'Realtime User' })

const manager = new ShardingManager('./dist/index.js', {
  token: process.env.DISCORD_TOKEN,
  respawn: true
})

manager.on('shardCreate', (shard) => console.log(`Launched shard #${shard.id}`))
manager.spawn()

setInterval(async () => {
  const channelCounts =
    await manager.broadcastEval((c) =>
      c.guilds.cache.reduce((prev, curr) =>
        prev + (curr.me?.voice?.channel
          ? curr.me.voice.channel.members.filter((m) => !m.user.bot).size
          : 0), 0))

  channelCount.set(channelCounts)
}, 1000)
