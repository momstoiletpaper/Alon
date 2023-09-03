const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_memory")
        .setDescription("⌠🤖⌡ Veja um resumo do processamento do bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute(client, user, interaction) {

        if (!client.owners.includes(interaction.user.id)) return

        const used = process.memoryUsage()
        let text = "Uso de RAM:\n"

        if (client.idioma.getLang(interaction) !== "pt-br")
            text = "RAM usage:\n"

        for (let key in used)
            text += `${key}: **${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB**\n`

        interaction.reply({
            content: text,
            ephemeral: true
        })
    }
}