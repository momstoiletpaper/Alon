const { readdirSync } = require('fs')
const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    sid: { type: String, default: null },
    lang: { type: String, default: "pt-br" },
    games: {
        channel: { type: String, default: null },
        role: { type: String, default: null }
    },
    tickets: {
        category: { type: String, default: null }
    },
    reports: {
        channel: { type: String, default: null },
    },
    logger: {
        channel: { type: String, default: null },
    },
    conf: {
        games: { type: Boolean, default: false },
        tickets: { type: Boolean, default: false },
        reports: { type: Boolean, default: false },
        public: { type: Boolean, default: false },
        conversation: { type: Boolean, default: true },
        broadcast: { type: Boolean, default: false },
        logger: { type: Boolean, default: false },
        spam: { type: Boolean, default: false },
        auto_ban: { type: Boolean, default: false }
    }
})

const model = mongoose.model("Guild", schema)

async function getGuild(sid) {
    if (!await model.exists({ sid: sid }))
        await model.create({
            sid: sid
        })

    return model.findOne({
        sid: sid
    })
}

async function getGameChannels() {
    // Lista todos os servidores com anúncios de games ativos
    return model.find({
        "conf.games": true
    })
}

async function getGameChannelById(id) {
    return model.findOne({
        "games.channel": id
    })
}

async function getReportChannels() {
    // Lista todos os servidores com reports de usuários ativos
    return model.find({
        "conf.reports": true
    })
}

async function getPublicGuilds() {
    // Lista todos os servidores com visibilidade ativa globalmente
    const servidores = await model.find({
        "conf.public": true
    })
    const lista = []

    servidores.forEach(servidor => {
        lista.push(servidor.sid)
    })

    return lista
}

async function disableGameChannel(sid) {
    // Desliga o anúncio de games para o servidor
    const guild = await getGuild(sid)

    guild.conf.games = false
    await guild.save()
}

async function disableReportChannel(sid) {
    // Desliga o anúncio de games para o servidor
    const guild = await getGuild(sid)

    guild.conf.reports = false
    await guild.save()
}

async function migrateGameChannels() {

    for (const file of readdirSync(`./files/data/games/`)) {
        const { canal, cargo } = require(`../../../files/data/games/${file}`)

        let guild = await getGuild(file.replace(".json", ""))

        guild.games.channel = canal
        guild.games.role = cargo
        guild.conf.games = true

        await guild.save()
    }
}

module.exports.Guild = model
module.exports = {
    getGuild,
    getGameChannels,
    getPublicGuilds,
    disableGameChannel,
    getReportChannels,
    getGameChannelById,
    disableReportChannel,
    migrateGameChannels
}