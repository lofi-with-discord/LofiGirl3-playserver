# LofiGirl v3 - Playserver
<img src="https://avatars.githubusercontent.com/u/79153360" width="60" height="60" alt="sharp logo" align="right">

Play server part of LofiGirl3

it contains [flowyplay tech.](https://github.com/lofi-with-discord/flowyplay) (aka. 24/7 auto-connect) supports, [lavalink interactions](https://github.com/freyacodes/Lavalink) supports and LofiGirl restapi server.

due to `discord.js v13` and other modules, this repository only supports `node.js v16`.

## Notice
> If you're interested in the translation project, please visit here:\
> https://github.com/lofi-with-discord/LofiGirl-i18n

This repository is a part of `LofiGirl v3` project.

This repository and Discord bot named `lofi girl` is not related to [this youtube channel](https://www.youtube.com/c/LofiGirl).

*Please stop asking me about is this official bot.*

## Installation
if you need self-hosting or debug some stuffs, follow these instructions

### Prerequirements
* `node.js` (version 16.x or later)
* `yarn` (version 1.x)
* `mariadb` or `mysql` (latest)
* `java` (**VERSION MUST BE v11**)

### Clone this repository
```bash
git clone https://github.com/lofi-with-discord/LofiGirl3-playserver.git
cd LofiGirl3-playserver
```

### Install dependencies
```bash
yarn # it will take some times
```

### Install SQL schema
```bash
sudo mariadb

> source database.sql
> exit
```

### Run lavalink server
```bash
mkdir lavalink

wget https://github.com/freyacodes/Lavalink/releases/download/3.3.2.5/Lavalink.jar
wget https://static.pmh.codes/lofigirl/application.yml

java -jar Lavalink.jar &
```

### Edit configuration file
```bash
cp .env.example .env
```

and edit `.env` file:
```
DISCORD_TOKEN=<discord bot token>
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=lofigirl
DATABASE_PASSWORD=
DATABASE_SCHEMA=lofigirl
LAVALINK_HOST=localhost
LAVALINK_PORT=2334
LAVALINK_PASSWORD=youshallnotpass
CONTROL_PORT=<playserver port>
CONTROL_PASSWORD=<playserver password>
```

### Run application
```bash
yarn build # build typescript file to javascript
yarn start # run built javascript file
```

## License
Copyright (c) 2021 Lofi with Discord

see [license](./LICENSE) file.

## Contact
Maintainer: Park Min Hyeok
* Email: pmhstudio.pmh@gmail.com
* Discord: https://discord.gg/WJRtvankkB
