const { ChannelType } = require('discord.js')

const { spamTimeoutMap } = require('../../../database/schemas/Strikes')

const guildActions = {
    "member_mute": 0,
    "member_kick_2": 1,
    "member_ban": 2
}

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_warns"
    const guild = await client.getGuild(interaction.guild.id)

    // Sem canal de avisos definido, solicitando um canal
    if (!guild.warn.channel) {
        reback = "panel_guild.2"
        operacao = 5
    }

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques
    // 1 -> Ativar ou desativar o warn
    // 2 -> Tempo de mute
    // 3 -> Escolher penalidade
    // 4 -> Escolher quantidade de repetências
    // 5 -> Escolher canal de avisos

    if (operacao === 1) {

        // Ativa ou desativa o log de eventos do servidor
        if (typeof guild.conf.warn !== "undefined")
            guild.conf.warn = !guild.conf.warn
        else
            guild.conf.warn = true

    } else if (operacao === 2) {

        const valores = []

        Object.keys(spamTimeoutMap).forEach(key => {
            valores.push(spamTimeoutMap[key])
        })

        // Definindo o tempo mínimo que um usuário deverá ficar mutado no servidor
        const data = {
            title: client.tls.phrase(user, "misc.modulo.modulo_escolher", 1),
            alvo: "guild_warns_timeout",
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_warns"
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })

    } else if (operacao === 3) {

        const operacoes = []

        // Listando todas as operações com exceção da ativa no momento
        Object.keys(guildActions).forEach(acao => {
            if (guild.warn.action !== acao)
                operacoes.push({ type: acao, value: guildActions[guild.warn.action] })
        })

        // Definindo o evento que será realizado pelo warn
        const data = {
            title: client.tls.phrase(user, "misc.modulo.modulo_escolher", 1),
            alvo: "guild_warns#events",
            values: operacoes
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_warns"
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })

    } else if (operacao === 4) {

        // Definindo a quantia de warns que os usuários precisam receber no servidor
        const data = {
            title: client.tls.phrase(user, "misc.modulo.modulo_escolher", 1),
            alvo: "guild_warns_strikes",
            values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_warns"
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })



    } else if (operacao === 5) {

        // Definindo o canal de avisos dos warns
        const data = {
            title: client.tls.phrase(user, "misc.modulo.modulo_escolher", 1),
            alvo: "guild_warns#channel",
            reback: "browse_button.guild_warns_button",
            operation: operacao,
            values: await client.getGuildChannels(interaction, ChannelType.GuildText, guild.logger.channel)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24)
            pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback },
            { id: "guild_logger_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "3" }
        ]

        let row = client.menu_navigation(data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })
    }

    await guild.save()

    // Redirecionando a função para o painel do log de eventos
    require('../../chunks/panel_guild_warns')({ client, user, interaction, operacao })
}