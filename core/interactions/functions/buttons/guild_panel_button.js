const { verificar_broadcast } = require('../../../events/broadcast')

module.exports = async ({ client, user, interaction, dados }) => {

    const escolha = parseInt(dados.split(".")[1])
    const guild = await client.getGuild(interaction.guild.id)

    // Tratamento dos cliques
    // 1 -> Alonsal Falador
    // 2 -> Permitir Broadcast
    // 3 -> Anúncio de Games ( Movido para guild_free_games_button )

    // 4 -> Denúncias in-server ( Movido para guild_tickets_button )
    // 5 -> Reportes de usuários mau comportados ( Movido para guild_reports_button )
    // 6 -> Logger do servidor ( Movido para guild_logger_button )

    // 7 -> Módulo anti-spam ( Movido para guild_anti_spam_button )
    // 8 -> Servidor visível globalmente
    // 9 -> AutoBan ( Movido para guild_reports_button )

    if (escolha === 1) {
        // Ativa ou desativa a capacidade do Alonsal falar no servidor livremente ( através do clever )
        if (typeof guild.conf.conversation !== "undefined")
            guild.conf.conversation = !guild.conf.conversation
        else
            guild.conf.conversation = false

    } else if (escolha === 2) {

        // Ativa ou desativa a possibilidade do Alonsal realizar Broadcasting nos chats do servidor
        if (typeof guild.conf.broadcast !== "undefined")
            guild.conf.broadcast = !guild.conf.broadcast
        else
            guild.conf.broadcast = true

        // Broadcast desligado
        if (!guild.conf.broadcast)
            verificar_broadcast(client, interaction)

    } else if (escolha === 8) {

        // Ativa ou desativa a exibição pública no ranking global
        if (typeof guild.conf.public !== "undefined")
            guild.conf.public = !guild.conf.public
        else
            guild.conf.public = false
    }

    await guild.save()

    const operador = 2 // Página
    require('../../chunks/panel_guild')({ client, user, interaction, operador })
}