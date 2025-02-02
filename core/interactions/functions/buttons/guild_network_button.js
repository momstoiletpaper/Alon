const { PermissionsBitField } = require('discord.js')

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_network"
    const guild = await client.getGuild(interaction.guild.id)

    // Sem canal de avisos definido, solicitando um canal
    if (!guild.network.link) {
        reback = "panel_guild.1"
        operacao = 3
    }

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques
    // 1 -> Ativar ou desativar o network do servidor
    // 2 -> Escolher os eventos sincronizados no servidor

    if (operacao === 1) { // Ativa ou desativa o network do servidor

        // Verificando as permissões necessárias conforme os casos
        let niveis_permissao = [PermissionsBitField.Flags.ViewAuditLog]

        if (guild.network.member_ban_add) // Banimentos automaticos
            niveis_permissao.push(PermissionsBitField.Flags.BanMembers)

        if (guild.network.member_kick) // Expulsões automaticas
            niveis_permissao.push(PermissionsBitField.Flags.KickMembers)

        if (guild.network.member_punishment) // Castigos automaticos
            niveis_permissao.push(PermissionsBitField.Flags.ModerateMembers)

        // Verificando se o bot possui permissões requeridas conforme os recursos ativos
        const permissoes = await client.permissions(interaction, client.id(), niveis_permissao)

        if (!permissoes)
            return client.reply(interaction, {
                content: client.tls.phrase(user, "manu.painel.sem_permissoes", 7),
                ephemeral: true
            })

        // Ativa ou desativa o network do servidor
        if (typeof guild.conf.network !== "undefined")
            guild.conf.network = !guild.conf.network
        else
            guild.conf.network = true

    } else if (operacao === 2) {

        const eventos = []

        Object.keys(guild.network).forEach(evento => {
            if (evento !== "link")
                eventos.push({ type: evento, status: guild.network[evento] })
        })

        // Definindo os eventos que o network irá sincronizar no servidor
        const data = {
            title: client.tls.phrase(user, "misc.modulo.modulo_escolher", 1),
            alvo: "guild_network#events",
            reback: "browse_button.guild_network_button",
            operation: operacao,
            values: eventos
        }

        const botoes = client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_network" }], interaction)
        const multi_select = true

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina, multi_select }), botoes],
            ephemeral: true
        })
    } else if (operacao === 3) { // Servidor sem um link de network

        await interaction.deferUpdate({ ephemeral: true })

        // Listando todos os servidores que o usuário é moderador
        // Selecionando os servidores para vincular ao network
        const permissions = [PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ModerateMembers]
        const guilds = await client.getMemberGuildsByPermissions({ interaction, user, permissions })

        if (guilds.length < 1)
            return interaction.editReply({
                content: client.tls.phrase(user, "mode.network.sem_servidores"),
                ephemeral: true
            })

        // Listando os servidores para o moderador
        const data = {
            title: client.tls.phrase(user, "mode.network.selecionar_servidores"),
            alvo: "guild_network#link",
            reback: "browse_button.guild_network_button",
            operation: operacao,
            values: guilds
        }

        // Subtrai uma página do total ( em casos de saída de um servidor em cache )
        if (data.values.length < pagina * 24)
            pagina--

        let botoes = [{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback }]
        let row = client.menu_navigation(data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        const multi_select = true

        return interaction.editReply({
            components: [client.create_menus({ client, interaction, user, data, pagina, multi_select }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })
    } else if (operacao === 4) {
        // Quebrando o link do servidor
        guild.conf.network = false
        guild.network.link = null
    }

    await guild.save()

    // Redirecionando a função para o painel do networking
    require('../../chunks/panel_guild_network')({ client, user, interaction, operacao })
}