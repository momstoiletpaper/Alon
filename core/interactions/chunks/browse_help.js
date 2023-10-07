const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, user, interaction }) => {

    const row = client.create_buttons([
        { name: client.tls.phrase(user, "inic.ping.site"), type: 4, emoji: "🌐", value: 'http://alonsal.glitch.me/' },
        { name: client.tls.phrase(user, "inic.inicio.suporte"), type: 4, emoji: client.emoji("icon_rules_channel"), value: process.env.url_support },
        { id: "language", name: "Change language", type: 0, emoji: client.defaultEmoji("earth") }
    ], interaction)

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "inic.ping.titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setImage("https://i.imgur.com/NqmwCA9.png")
        .setDescription(`${client.tls.phrase(user, "inic.ping.boas_vindas")}\n\n${client.defaultEmoji("earth")} | ${client.tls.phrase(user, "inic.ping.idioma_dica")}`)

    if (!interaction.customId)
        interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        })
    else
        interaction.update({
            embeds: [embed],
            components: [row],
            ephemeral: true
        })
}