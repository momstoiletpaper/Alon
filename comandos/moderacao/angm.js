const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js')
const { writeFileSync, existsSync, unlinkSync } = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("notify")
        .setNameLocalizations({
            "pt-BR": 'notificar',
            "es-ES": 'notificar',
            "fr": 'notifier',
            "it": 'notificare',
            "ru": 'уведомление'
        })
        .setDescription("⌠💂⌡ (Dis)Enable announces for free games")
        .setDescriptionLocalizations({
            "pt-BR": '⌠💂⌡ (Des)Habilitar anúncio de games free',
            "es-ES": '⌠💂⌡ (Des)Habilitar anuncios para juegos gratis',
            "fr": '⌠💂⌡ (Dés)activer les publicités pour les jeux gratuits',
            "it": '⌠💂⌡ (Dis) Abilita annunci di giochi gratuiti',
            "ru": '⌠💂⌡ (Dis)Включить рекламу бесплатных игр'
        })
        .addRoleOption(option =>
            option.setName("role")
                .setNameLocalizations({
                    "pt-BR": 'cargo',
                    "es-ES": 'rol',
                    "it": 'roule',
                    "ru": 'роль'
                })
                .setDescription("The role that will be notified")
                .setDescriptionLocalizations({
                    "pt-BR": 'O cargo que será notificado',
                    "es-ES": 'El rol a ser notificado',
                    "fr": 'Le role qui sera notifié',
                    "it": 'La roule da notificare',
                    "ru": 'Роль, которую нужно уведомить'
                }))
        .addChannelOption(option =>
            option.setName("channel")
                .setNameLocalizations({
                    "pt-BR": 'canal',
                    "es-ES": 'canal',
                    "fr": 'salon',
                    "it": 'canale',
                    "ru": 'канал'
                })
                .setDescription("The channel that will be used")
                .setDescriptionLocalizations({
                    "pt-BR": 'O canal que será usado',
                    "es-ES": 'El canal que se utilizará',
                    "fr": 'Le canal qui sera utilisé',
                    "it": 'Il canale che verrà utilizzato',
                    "ru": 'Канал, который будет использоваться'
                }))
        .addStringOption(option =>
            option.setName("language")
                .setNameLocalizations({
                    "pt-BR": 'idioma',
                    "es-ES": 'idioma',
                    "fr": 'langue',
                    "it": 'linguaggio',
                    "ru": 'язык'
                })
                .setDescription("The language to be used")
                .setDescriptionLocalizations({
                    "pt-BR": 'O idioma que será utilizado',
                    "es-ES": 'El lenguaje a utilizar',
                    "fr": 'La langue à utiliser',
                    "it": 'La lingua da usare',
                    "ru": 'Язык, который будет использоваться'
                })
                .addChoices(
                    { name: 'Alonsês', value: 'al-br' },
                    { name: 'English', value: 'en-us' },
                    { name: 'Español', value: 'es-es' },
                    { name: 'Français', value: 'fr-fr' },
                    { name: 'Italiano', value: 'it-it' },
                    { name: 'Português', value: 'pt-br' },
                    { name: 'Русский', value: 'ru-ru' }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute(client, user, interaction) {

        const membro_sv = await interaction.guild.members.cache.get(interaction.user.id)

        // Libera configuração para proprietários e adms apenas
        if (!membro_sv.permissions.has(PermissionsBitField.Flags.ManageChannels) && interaction.user.id !== client.owners[0])
            return client.tls.reply(interaction, user, "mode.adm.moderadores", true)

        let opcao_remove = false, entradas = interaction.options.data

        const notificador = {
            canal: null,
            cargo: null,
            idioma: null
        }

        // Coletando todas as entradas
        entradas.forEach(valor => {
            if (valor.name === "role")
                notificador.cargo = valor.value

            if (valor.name === "language")
                notificador.idioma = valor.value

            if (valor.name === "channel") {
                notificador.canal = valor.value

                if (valor.channel.type !== 0 && valor.channel.type !== 5) // Canal inválido
                    return client.tls.reply(interaction, user, "mode.anuncio.tipo_canal", true, 0)
            }
        })

        if (!notificador.idioma)
            notificador.idioma = client.idioma.getLang(interaction)

        let mensagem = `:video_game: | O Servidor ( \`${interaction.guild.name}\` | \`${interaction.guild.id}\` ) não recebe mais atts de jogos grátis`

        if (!notificador.canal || !notificador.cargo) { // Removendo o anúncio do servidor 

            opcao_remove = true

            if (existsSync(`./arquivos/data/games/${interaction.guild.id}.json`))
                unlinkSync(`./arquivos/data/games/${interaction.guild.id}.json`)
        }

        if (!opcao_remove) {
            writeFileSync(`./arquivos/data/games/${interaction.guild.id}.json`, JSON.stringify(notificador))
            delete require.cache[require.resolve(`../../arquivos/data/games/${interaction.guild.id}.json`)]

            mensagem = `:video_game: | O Servidor ( \`${interaction.guild.name}\` | \`${interaction.guild.id}\` ) agora recebe atts de jogos grátis`
        }

        client.notify(process.env.feeds_channel, mensagem)

        let feedback_user = client.tls.phrase(user, "mode.anuncio.anuncio_games")

        if (opcao_remove)
            feedback_user = `:mobile_phone_off: | ${client.tls.phrase(user, "mode.anuncio.anuncio_off")}`

        interaction.reply({ content: feedback_user.replace("repl_canal", `<#${notificador.canal}>`), ephemeral: true })
    }
}