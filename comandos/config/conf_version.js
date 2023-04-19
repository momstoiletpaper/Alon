const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_version")
        .setDescription("⌠🤖⌡ Altere a versão do Alonsal")
        .addStringOption(option =>
            option.setName("versao")
                .setDescription("Qual será a versão")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute(client, user, interaction) {

        if (interaction.user.id !== client.owners[0])
            return interaction.reply({ content: ":spy: | Parado ai! Você não pode usar essi comando!", ephemeral: true })

        const bot = await client.getBot()
        bot.persis.version = interaction.options.data[0].value
        bot.save()

        interaction.reply({ content: `:placard: | Versão do ${client.user().username} alterado para \`${bot.persis.version}\``, ephemeral: true })
        client.notify(process.env.channel_feeds, `:placard: | Versão do ${client.user().username} alterado para \`${bot.persis.version}\``)
    }
}