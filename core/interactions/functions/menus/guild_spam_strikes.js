module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)
    guild.spam.trigger_amount = parseInt(dados)

    await guild.save()

    // Redirecionando o evento
    require('../../chunks/panel_guild_anti_spam')({ client, user, interaction })
}