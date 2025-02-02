const { PermissionsBitField } = require('discord.js')

module.exports = async (client, dados) => {

    const guild = await client.getGuild(dados[0].guild.id)

    if (guild.network.member_punishment && guild.conf.network) // Network de servidores
        client.network(guild, "mute", dados[0].user.id)

    // Verificando se a guild habilitou o logger
    if (!guild.conf.logger) return

    // Permissão para ver o registro de auditoria, desabilitando o logger
    const permissoes = await client.permissions(dados[0], client.id(), PermissionsBitField.Flags.ViewAuditLog)
    if (!permissoes) {

        guild.logger.member_role = false
        await guild.save()

        return client.notify(guild.logger.channel, { content: `@here\n${client.tls.phrase(guild, "mode.logger.permissao", 7)}` })
    }

    // Alterando os cargos do usuário
    if (dados[0]._roles !== dados[1]._roles && dados[0]._roles.length > 0 && guild.logger.member_role)
        return require('./member_role')({ client, guild, dados })

    const user = await client.getUser(dados[0].user.id)

    // Usuário atualizou a foto de perfil
    if (user.profile.avatar !== dados[1].user.avatarURL({ dynamic: true }) && guild.logger.member_image)
        return require('./member_avatar')({ client, guild, user, dados })
}