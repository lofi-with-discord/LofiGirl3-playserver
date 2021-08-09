const dotenv = require('dotenv')
const { ShardingManager } = require('discord.js')

dotenv.config()

const manager = new ShardingManager('./dist/index.js', {
  token: process.env.DISCORD_TOKEN,
  respawn: true
})

manager.on('shardCreate', (shard) => console.log(`Launched shard #${shard.id}`))
manager.spawn()
