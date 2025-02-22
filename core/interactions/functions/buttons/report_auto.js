const { PermissionsBitField } = require('discord.js')

const { getReport } = require('../../../database/schemas/Report')
const { badges } = require('../../../data/badges')

module.exports = async ({ client, user, interaction, dados }) => {

    // Gerenciamento de reportes de usuários
    const operacao = parseInt(dados.split(".")[1])

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirma

    if (!operacao)
        return client.tls.report(interaction, user, "menu.botoes.operacao_cancelada", true, 11, interaction.customId)

    // Verificando as permissões para ver membros banidos do servidor
    const bot_member = await client.getMemberGuild(interaction, client.id())

    if (!bot_member.permissions.has([PermissionsBitField.Flags.BanMembers]))
        return interaction.update({
            content: ":octagonal_sign: | Eu não possuo a permissão de `Banir membros` para poder ver o histórico de banimentos do servidor!\nSem essa permissão também não posso fazer a migração de membros.",
            ephemeral: true
        })

    // Reportando os usuários banidos do servidor de forma automática
    let list = [], adicionados = 0

    // Verificando se o usuário possui a badge de reporter e concedendo caso não possua
    client.registryBadge(user, badges.REPORTER)

    // Coletando os usuários que foram banidos no servidor
    interaction.guild.bans.fetch()
        .then(async bans => {
            list = bans.map(user => user)

            for (let i = 0; i < list.length; i++)
                if (list[i].reason) {
                    let alvo = await getReport(list[i].user.id, interaction.guild.id)

                    // Adicionando o usuário caso
                    alvo.relatory = list[i].reason
                    alvo.nick = list[i].user.username
                    alvo.timestamp = client.timestamp()
                    alvo.issuer = interaction.user.id
                    alvo.auto = true

                    adicionados++
                    await alvo.save()
                }

            let msg_feed = client.replace(client.tls.phrase(user, "mode.report.usuarios_reportados", client.defaultEmoji("guard")), adicionados)

            if (adicionados === 1)
                msg_feed = client.tls.phrase(user, "mode.report.usuario_reportado", client.defaultEmoji("guard"))

            if (adicionados < 1)
                msg_feed = client.tls.phrase(user, "mode.report.sem_usuarios", client.defaultEmoji("guard"))

            return interaction.update({
                content: msg_feed,
                embeds: [],
                components: [],
                ephemeral: true
            })
        })
}