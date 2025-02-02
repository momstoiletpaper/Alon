const { readdirSync } = require('fs')
const mongoose = require("mongoose")

const colorsMap = {
    "red": ["D62D20", 1, "🎈"],
    "brown": ["66401D", 1, "🐶"],
    "orange": ["F27D0C", 1, "🎃"],
    "yellow": ["FFD319", 1, "🎁"],
    "green": ["36802D", 1, "🎄"],
    "blue": ["7289DA", 1, "💎"],
    "cyan": ["29BB8E", 1, "🧪"],
    "purple": ["44008B", 1, "🔮"],
    "magenta": ["FF2EF1", 1, "🌸"],
    "white": ["FFFFFF", 2, "🧻"],
    "gray": ["2D2D31", 2, "🛒"],
    "black": ["000000", 2, "🎮"],
    "random": ["random", 3, "💥"]
}

const colorsPriceMap = {
    0: 200,
    1: 300,
    2: 400,
    3: 500,
    4: 50
}

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    lang: { type: String, default: null },
    social: {
        steam: { type: String, default: null },
        lastfm: { type: String, default: null },
        pula_predios: { type: String, default: null }
    },
    profile: {
        avatar: { type: String, default: null },
        about: { type: String, default: null },
        join: { type: Boolean, default: true },
        creation: { type: Boolean, default: true },
        bank: { type: Boolean, default: true },
        lastfm: { type: Boolean, default: false },
        steam: { type: Boolean, default: false },
        thumbnail: { type: String, default: null }
    },
    misc: {
        color: { type: String, default: "#29BB8E" },
        daily: { type: String, default: null },
        money: { type: Number, default: 0 },
        embed: { type: String, default: "#29BB8E" },
        locale: { type: String, default: null },
        weather: { type: Boolean, default: true },
        fixed_badge: { type: Number, default: null }
    },
    conf: {
        banned: { type: Boolean, default: false },
        ghost_mode: { type: Boolean, default: false },
        notify: { type: Boolean, default: true },
        ranking: { type: Boolean, default: true },
        global_tasks: { type: Boolean, default: true },
        public_badges: { type: Boolean, default: true },
        resumed: { type: Boolean, default: false }
    }
})

const model = mongoose.model("User", schema)

async function getUser(uid) {
    if (!await model.exists({ uid: uid }))
        await model.create({
            uid: uid
        })

    return model.findOne({
        uid: uid
    })
}

async function getRankMoney() {
    return model.find({
        "misc.money": { $gt: 0.01 }
    }).sort({
        "misc.money": -1
    }).limit(25)
}

async function migrateUsers() {

    for (const file of readdirSync(`./files/data/user/`)) {
        const { id, lang, social, misc, badges, conquistas } = require(`../../../files/data/user/${file}`)

        let steam = "", lastfm = "", pula_predios = ""
        if (social) {
            if (typeof social.steam !== 'undefined')
                steam = social.steam

            if (typeof social.lastfm !== 'undefined')
                lastfm = social.lastfm

            if (typeof social.pula_predios !== 'undefined')
                pula_predios = social.pula_predios
        }

        await model.create({
            uid: id,
            lang: lang || "pt-br",
            social: {
                steam: social.steam || "",
                lastfm: social.lastfm || "",
                pula_predios: social.pula_predios || ""
            }, misc: {
                daily: misc.daily || "",
                color: misc.color || "#29BB8E",
                money: misc.money || 0,
                embed: misc.embed || "#29BB8E",
                locale: misc.locale || ""
            }, badges: {
                badges: badges.fixed_badge || "",
                badge_list: badges.badge_list || [{ key: String, value: Number }]
            }, conquistas: conquistas || [{ key: String, value: Number }]
        })
    }
}

module.exports.User = model
module.exports = {
    getUser,
    migrateUsers,
    getRankMoney,
    colorsMap,
    colorsPriceMap
}