const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setNameLocalizations({
            "pt-BR": 'perfil'
        })
        .setDescription("⌠🎉⌡ Customize seu perfil!")
        .addSubcommand(subcommand =>
            subcommand
                .setName("about")
                .setNameLocalizations({
                    "pt-BR": 'sobre'
                })
                .setDescription("⌠🎉⌡ Change your description on Alon")
                .setDescriptionLocalizations({
                    "pt-BR": '⌠🎉⌡ Altere sua descrição no Alon'
                })
                .addStringOption(option =>
                    option.setName("description")
                        .setNameLocalizations({
                            "pt-BR": 'descrição'
                        })
                        .setDescription("What do you want to tell others?")
                        .setDescriptionLocalizations({
                            "pt-BR": 'O que deseja contar aos outros?'
                        })
                        .setMaxLength(150)
                        .setRequired(true)))
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName("panel")
        //         .setNameLocalizations({
        //             "pt-BR": 'painel',
        //         })
        //         .setDescription("⌠👤⌡ Set up your profile")
        //         .setDescriptionLocalizations({
        //             "pt-BR": '⌠👤⌡ Configure seu perfil'
        //         }))
    ,
    async execute({ client, user, interaction }) {

        // Navegando pelos módulos
        require(`./subcommands/profile_${interaction.options.getSubcommand()}`)({ client, user, interaction })
    }
}