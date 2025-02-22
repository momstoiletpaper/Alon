const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_ban")
        .setDescription("⌠🤖⌡ Retrinja o Alon de responder um usuário")
        .addUserOption(option =>
            option.setName("usuario")
                .setDescription("Mencione outro usuário")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers || PermissionFlagsBits.KickMembers),
    async execute({ client, user, interaction }) {

        // Verificando autoria de quem ativou o comando
        if (!client.owners.includes(interaction.user.id)) return

        const user_alvo = interaction.options.getUser("usuario")
        const data_user = await client.getUser(user_alvo.id)

        data_user.conf.banned = !data_user.conf.banned
        await data_user.save()

        let msg = ":passport_control: | O usuário foi banido de usar o Alon"

        if (!data_user.conf.banned)
            msg = ":passport_control: | O usuário foi agora pode usar o Alon novamente"

        interaction.reply({ content: msg, ephemeral: true })
    }
}