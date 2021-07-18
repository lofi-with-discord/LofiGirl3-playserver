import dotenv from 'dotenv'
import BotClient from './BotClient'
import DatabaseClient from './DatabaseClient'
import LavalinkClient from './LavalinkClient'
import express, { Application, Request, Response, NextFunction } from 'express'
import { VoiceChannel } from 'discord.js'

dotenv.config()

export default class RestServer {
  private app: Application
  private bot: BotClient
  private db: DatabaseClient
  private lavalink: LavalinkClient

  constructor (bot: BotClient, db: DatabaseClient, lavalink: LavalinkClient) {
    this.app = express()
    this.bot = bot
    this.db = db
    this.lavalink = lavalink
  }

  public listen () {
    this.app.use(this.authorization)
    this.app.delete('/cache', this.deleteCache.bind(this))
    this.app.post('/connection', this.createConnection.bind(this))
    this.app.delete('/connection', this.deleteConnection.bind(this))

    this.app.listen(process.env.CONTROL_PORT || '6703')
  }

  private authorization (req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers

    if (authorization === process.env.CONTROL_PASSWORD) {
      return next()
    }

    res.status(401).send({ success: false, message: 'Unauthorized or not valid' })
  }

  private async deleteCache (req: Request, res: Response) {
    await this.db.fetchMarkedChannels()
    res.status(200).send({ success: true })
  }

  private async createConnection (req: Request, res: Response) {
    const { channel } = req.query
    if (!channel || typeof channel !== 'string') {
      res.status(400).send({ success: false, message: 'channel not valid' })
      return
    }

    const voiceChannel = this.bot.channels.resolve(channel) as VoiceChannel
    if (!voiceChannel) {
      res.status(400).send({ success: false, message: 'channel not valid' })
      return
    }

    if (voiceChannel.type !== 'voice') {
      res.status(400).send({ success: false, message: 'channel not valid' })
      return
    }

    const theme = await this.db.getThemeURL(voiceChannel)
    const track = await this.lavalink.getTrack(theme)

    await this.lavalink.play(voiceChannel, track)
    res.status(201).send({ success: true })
  }

  private async deleteConnection (req: Request, res: Response) {
    const { channel } = req.query
    if (!channel || typeof channel !== 'string') {
      res.status(400).send({ success: false, message: 'channel not valid' })
      return
    }

    const voiceChannel = this.bot.channels.resolve(channel) as VoiceChannel
    if (!voiceChannel) {
      res.status(400).send({ success: false, message: 'channel not valid' })
      return
    }

    if (voiceChannel.type !== 'voice') {
      res.status(400).send({ success: false, message: 'channel not valid' })
      return
    }

    await this.lavalink.stop(voiceChannel)
    res.status(200).send({ success: true })
  }
}
