module.exports = async ({ client, user, interaction }) => {

    const row = client.create_buttons([{ id: "data_button", name: client.tls.phrase(user, "manu.data.exclusao_personalizada"), value: '1', type: 1, emoji: client.emoji(1), data: '1' }, { id: "data_button", name: client.tls.phrase(user, "manu.data.exclusao_niveis"), value: '1', type: 1, emoji: client.defaultEmoji("paper"), data: '2' }], interaction)

    if (!interaction.customId)
        interaction.reply({ content: client.tls.phrase(user, "menu.botoes.selecionar_operacao"), components: [row], embeds: [], ephemeral: true })
    else {

        if (interaction.customId.includes("uni") || interaction.customId.includes("combo")) {
            const dados = interaction.customId.split(".")[2]

            return require('../functions/buttons/data_button')({ client, user, interaction, dados })
        }

        interaction.update({ content: client.tls.phrase(user, "menu.botoes.selecionar_operacao"), components: [row], embeds: [], ephemeral: true })
    }
}