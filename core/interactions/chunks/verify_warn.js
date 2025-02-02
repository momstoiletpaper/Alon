const { EmbedBuilder } = require("discord.js")

const { getUserWarns } = require("../../database/schemas/Warns")
const { listAllGuildWarns } = require("../../database/schemas/Warns_guild")
const { loggerMap } = require("../../database/schemas/Guild")

module.exports = async ({ client, user, interaction, dados }) => {

    const id_alvo = dados.split(".")[0]
    const pagina = dados.split(".")[2]

    const user_warns = await getUserWarns(id_alvo, interaction.guild.id)
    const member_guild = await client.getMemberGuild(interaction, id_alvo)
    const guild_warns = await listAllGuildWarns(interaction.guild.id)

    let indice_matriz = client.verifyGuildWarns(guild_warns) // Indice marcador do momento de expulsão/banimento do membro pelas advertências

    // Verificando se existem advertências para as próximas punições do usuário
    let indice_warn = user_warns.total + 1

    if (!guild_warns[user_warns.total + 1])
        indice_warn = guild_warns.length - 1

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.warn.verificando_advertencia")} :inbox_tray:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${client.tls.phrase(user, "mode.warn.advertencias_registradas")}\n\`\`\`fix\n${client.tls.phrase(user, "mode.warn.ultima_descricao", 51)}\n\n${user_warns.relatory}\`\`\``)
        .addFields(
            {
                name: `:bust_in_silhouette: **${client.tls.phrase(user, "mode.report.usuario")}**`,
                value: `${client.emoji("icon_id")} \`${id_alvo}\`\n\`@${user_warns.nick}\`\n( <@${id_alvo}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(user, "mode.logger.entrada_original")}**`,
                value: `<t:${parseInt(member_guild.joinedTimestamp / 1000)}:F> )`,
                inline: true
            },
            {
                name: `${client.emoji(47)} **Advertências**`,
                value: `\`${indice_warn} / ${indice_matriz}\``,
                inline: true
            }
        )
        .addFields(
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.warn.aplicador_ultima_advertencia")}**`,
                value: `${client.emoji("icon_id")} \`${user_warns.assigner}\`\n( <@${user_warns.assigner}> )`,
                inline: true
            },
            {
                name: `${client.emoji("banidos")} **Próxima penalidade**`,
                value: client.verifyWarnAction(guild_warns[indice_warn], user),
                inline: true
            },
            { name: "⠀", value: "⠀", inline: true }
        )
        .setFooter({
            text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
            iconURL: client.avatar()
        })

    // Criando os botões para as funções de advertência
    let botoes = [
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `warn_browse_user|${pagina}` },
        { id: "warn_remove_user", name: client.tls.phrase(user, "menu.botoes.remover_warns"), type: 1, emoji: client.emoji(42), data: `2|${id_alvo}.${interaction.guild.id}` }
    ]

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}