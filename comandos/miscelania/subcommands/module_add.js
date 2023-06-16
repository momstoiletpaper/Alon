const { EmbedBuilder } = require('discord.js')

const { verifyUserModules, createModule } = require('../../../adm/database/schemas/Module')
const { getModulesPrice } = require('../../../adm/database/schemas/Module')

const formata_horas = require('../../../adm/formatadores/formata_horas')

module.exports = async ({ client, user, interaction }) => {

    if (user.misc.money < 20)
        return client.tls.reply(interaction, user, "misc.modulo.sem_bufunfa", true, 0)

    const type = parseInt(interaction.options.getString("choice"))

    // Verificando quantos módulos de um tipo existem para o usuário
    const modulos_semelhantes = await verifyUserModules(interaction.user.id, type)

    if (modulos_semelhantes.length > 2)
        return interaction.reply({ content: client.tls.phrase(user, "misc.modulo.limite_modulos"), ephemeral: true })

    // Prevenção de erros
    if (type == 0 && !user.misc.locale)
        return client.tls.reply(interaction, user, "misc.modulo.sem_locale", true, 0)

    const corpo_modulo = await createModule(interaction.user.id, type)
    const timestamp = client.timestamp()

    if (type === 3 || type === 4) // Módulo de charadas
        corpo_modulo.stats.price = 1

    corpo_modulo.stats.days = interaction.options.getString("when")
    corpo_modulo.stats.hour = formata_horas(interaction.options.getInteger("hour") || '0', interaction.options.getInteger("minute") || '0')
    corpo_modulo.stats.timestamp = timestamp

    await corpo_modulo.save()

    const ativacao_modulo = `${client.tls.phrase(user, `misc.modulo.ativacao_${corpo_modulo.stats.days}`)} ${corpo_modulo.stats.hour}`
    const montante = await getModulesPrice(interaction.user.id)

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "misc.modulo.cabecalho_menu"))
        .setColor(client.embed_color(user.misc.color))
        .addFields(
            {
                name: `**${client.defaultEmoji("types")} ${client.tls.phrase(user, "misc.modulo.tipo")}**`,
                value: `\`${client.tls.phrase(user, `misc.modulo.modulo_${corpo_modulo.type}`)}\``,
                inline: true
            },
            {
                name: `**${client.defaultEmoji("time")} ${client.tls.phrase(user, "misc.modulo.ativacao")}**`,
                value: `\`${ativacao_modulo}\``,
                inline: true
            },
            {
                name: `**${client.defaultEmoji("money")} ${client.tls.phrase(user, "misc.modulo.valor")}**`,
                value: `\`B$ ${corpo_modulo.stats.price}\``,
                inline: true
            }
        )
        .setDescription(client.replace(client.tls.phrase(user, "misc.modulo.descricao"), [corpo_modulo.stats.price, montante]))
        .setFooter({ text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"), iconURL: interaction.user.avatarURL({ dynamic: true }) })

    // Criando os botões para o menu de badges
    const row = client.create_buttons([{ id: "modules", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, data: `1|${timestamp}` }, { id: "modules", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${timestamp}` }], interaction)

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
}