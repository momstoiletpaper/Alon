const { EmbedBuilder, PermissionsBitField } = require("discord.js")

module.exports = async ({ client, message, guild, user_messages, user, user_guild, guild_bot, tempo_timeout }) => {

    let entradas_spamadas = ""
    const permissions = await client.permissions(message, client.id(), [PermissionsBitField.Flags.ModerateMembers])

    // Verificando se a hierarquia do bot é maior que a do membro e se o bot pode mutar membros
    if (!permissions || guild_bot.roles.highest.position < user_guild.roles.highest.position)
        return client.notify(guild.logger.channel, { content: `${client.defaultEmoji("guard")} | @here ${client.replace(client.tls.phrase(guild, "mode.spam.falta_permissoes_2"), user_guild)}`, embeds: [embed] })

    // Listando as mensagens consideras spam e excluindo elas
    user_messages.forEach(internal_message => {
        entradas_spamadas += `-> ${internal_message.content}\n[ ${new Date(internal_message.createdTimestamp).toLocaleTimeString()} ]\n\n`
    })

    // Criando o embed de aviso para os moderadores
    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(guild, "mode.spam.titulo"))
        .setColor(0xED4245)
        .setDescription(`${client.replace(client.tls.phrase(guild, "mode.spam.spam_aplicado", client.defaultEmoji("guard")), [user_guild, client.locale(tempo_timeout / 60)])}\n\`\`\`${entradas_spamadas.slice(0, 999)}\`\`\``)
        .addFields(
            {
                name: `${client.defaultEmoji("person")} **${client.tls.phrase(guild, "util.server.membro")}**`,
                value: `${client.emoji("icon_id")} \`${user_guild.id}\`\n( ${user_guild} )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(guild, "mode.spam.vigencia")}**`,
                value: `<t:${client.timestamp() + tempo_timeout}:f>\n( <t:${client.timestamp() + tempo_timeout}:R> )`,
                inline: true
            }
        )

    if (user_guild.avatarURL({ dynamic: true, size: 2048 }))
        embed.setThumbnail(user_guild.avatarURL({ dynamic: true, size: 2048 }))

    // Mutando o usuário causador do spam
    user_guild.timeout(tempo_timeout * 1000, client.tls.phrase(guild, "mode.spam.justificativa_mute"))
        .then(async () => {

            const obj = {
                content: client.replace(client.tls.phrase(guild, "mode.spam.ping_expulsao"), user_guild),
                embeds: [embed]
            }

            if (guild.spam.notify) // Servidor com ping de spam ativado
                obj.content = `@here ${obj.content}`

            client.notify(guild.logger.channel, obj)

            let msg_user = `${client.replace(client.tls.phrase(user, "mode.spam.silenciado"), await client.guilds().get(guild.sid).name)} \`\`\`${entradas_spamadas.slice(0, 999)}\`\`\``

            if (user_messages[0].content.includes("http") || user_messages[0].content.includes("www"))
                msg_user += `\n${client.defaultEmoji("detective")} | ${client.tls.phrase(user, "mode.spam.aviso_links")}`

            client.sendDM(user, { data: `${client.defaultEmoji("guard")} | ${msg_user}` }, true)
        })
        .catch(console.error)
}