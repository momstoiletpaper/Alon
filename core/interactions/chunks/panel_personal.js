const { EmbedBuilder } = require('discord.js')

const { emoji_button, type_button } = require('../../functions/emoji_button')

module.exports = async ({ client, user, interaction, operador, pagina_guia }) => {

    const pagina = pagina_guia || 0

    if (operador) { // Função usada com um atalho
        const dados = `${interaction.user.id}.${operador}`
        return require('../functions/buttons/user_panel_button')({ client, user, interaction, dados })
    }

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "manu.painel.cabecalho_menu_pessoal"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "manu.painel.descricao"))
        .setFooter({
            text: client.tls.phrase(user, "manu.painel.rodape"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (pagina === 0)
        embed.addFields(
            {
                name: `${emoji_button(user?.conf.ghost_mode)} **${client.tls.phrase(user, "manu.data.ghostmode")}**`,
                value: `\`${client.tls.phrase(user, "manu.painel.desc_ghostmode")}\``,
                inline: true
            },
            {
                name: `${emoji_button(user?.conf.notify)} **${client.tls.phrase(user, "manu.data.notificacoes")}**`,
                value: `\`${client.tls.phrase(user, "manu.painel.desc_notificacoes")}\``,
                inline: true
            },
            {
                name: `${emoji_button(user?.conf.ranking)} **${client.tls.phrase(user, "manu.data.ranking")}**`,
                value: `\`${client.tls.phrase(user, "manu.painel.desc_ranking")}\``,
                inline: true
            }
        )

    if (pagina === 1)
        embed.addFields(
            {
                name: `${emoji_button(user?.conf.public_badges)} ${client.tls.phrase(user, "manu.data.badges_publicas")}**`,
                value: `\`${client.tls.phrase(user, "manu.painel.desc_badges_publicas")}\``,
                inline: true
            },
            {
                name: `${emoji_button(!user?.misc.weather)} **${client.tls.phrase(user, "manu.data.clima_resumido")}**`,
                value: client.tls.phrase(user, "manu.painel.desc_clima_resumido"),
                inline: true
            },
            {
                name: `${emoji_button(user?.conf.global_tasks)} **${client.tls.phrase(user, "manu.data.tarefas_globais")}**`,
                value: `\`${client.tls.phrase(user, "manu.painel.desc_tarefas_globais")}\``,
                inline: true
            }
        )

    if (pagina === 2)
        embed.addFields(
            {
                name: `${emoji_button(user?.conf.resumed)} **Modo compacto**`,
                value: `\`O Modo compacto remove todos os emojis do início das frases.\``,
                inline: true
            },
            {
                name: `${emoji_button(0)} **${client.tls.phrase(user, "manu.painel.misterioso")}**`,
                value: `\`${client.tls.phrase(user, "manu.painel.desc_misterioso")}\``,
                inline: true
            },
            {
                name: `${emoji_button(0)} **${client.tls.phrase(user, "manu.painel.misterioso")}**`,
                value: `\`${client.tls.phrase(user, "manu.painel.desc_misterioso")}\``,
                inline: true
            }
        )

    const c_menu = [false, false]

    if (pagina == 0) // Botão de voltar
        c_menu[0] = true
    if (pagina == 3) // Botão para avançar
        c_menu[1] = true

    let botoes = [{ id: "navigation_button_panel", name: '◀️', type: 0, data: `${pagina}.0.panel_personal`, disabled: c_menu[0] }]

    // Primeira página de botões de configuração do usuário
    // Modo fantasma, notificações em DM e Ranking
    if (pagina === 0)
        botoes = botoes.concat([
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.ghostmode"), type: type_button(user?.conf.ghost_mode), emoji: emoji_button(user?.conf.ghost_mode), data: '0' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.notificacoes"), type: type_button(user?.conf.notify), emoji: emoji_button(user?.conf.notify), data: '1' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.ranking"), type: type_button(user?.conf.ranking), emoji: emoji_button(user?.conf.ranking), data: '2' }
        ])

    // Segunda página de botões de configuração do Alon
    // Badges visiveis públicamente, clima resumido e tarefas globais
    if (pagina === 1)
        botoes = botoes.concat([
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.badges_publicas"), type: type_button(user?.conf.public_badges), emoji: emoji_button(user?.conf.public_badges), data: '3' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.clima_resumido"), type: type_button(!user?.misc.weather), emoji: emoji_button(!user?.misc.weather), data: '4' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.tarefas_globais"), type: type_button(user?.conf.global_tasks), emoji: emoji_button(user?.conf.global_tasks), data: '5' }
        ])

    if (pagina === 2)
        botoes = botoes.concat([
            { id: "user_panel_button", name: "Compacto", type: type_button(user?.conf.resumed), emoji: emoji_button(user?.conf.resumed), data: '6' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.painel.misterioso"), type: type_button(0), emoji: emoji_button(3), data: '7', disabled: true },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.painel.misterioso"), type: type_button(0), emoji: emoji_button(3), data: '8', disabled: true }
        ])

    botoes.push({ id: "navigation_button_panel", name: '▶️', type: 0, data: `${pagina}.1.panel_personal`, disabled: c_menu[1] })

    client.reply(interaction, {
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}