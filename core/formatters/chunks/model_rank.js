const { EmbedBuilder } = require('discord.js')

const { busca_badges, badgeTypes } = require('../../data/badges')

const { getPublicGuilds } = require('../../database/schemas/Guild')
const { getRankGlobal } = require('../../database/schemas/Rank_g')
const { getRankServer } = require('../../database/schemas/Rank_s')

const servidores = {}, medals = {
    0: ":first_place:",
    1: ":second_place:",
    2: ":third_place:"
}

let paginas, pagina, nav_buttons = true

module.exports = async (client, user, interaction, entrada, caso, defer, autor_original) => {

    let usuario_alvo = [], i = 0, data_usuarios, remover = 0
    const usernames = [], experiencias = [], levels = [], servers = [], ids = []
    const public_servers = await getPublicGuilds()

    if (typeof entrada === "undefined")
        escopo = interaction.options.getString("scope")
    else
        escopo = caso

    // Interações que exigem mais tempo
    if (typeof defer !== "undefined")
        nav_buttons = defer
    else
        nav_buttons = true

    // Coleta o ID do usuário mencionado
    let rodape = interaction.user.username, user_alvo_data

    if (typeof entrada !== "undefined") {
        pagina = entrada

        // Coletando os dados para o servidor ou para o global
        if (escopo === "server")
            data_usuarios = await getRankServer(interaction.guild.id)
        else
            data_usuarios = await getRankGlobal()
    } else {
        user_alvo_data = interaction.options.getUser("user")
        pagina = interaction.options.getInteger("page") || 1

        // Coletando os dados para o servidor ou para o global
        if (escopo === "server")
            data_usuarios = await getRankServer(interaction.guild.id)
        else
            data_usuarios = await getRankGlobal()
    }

    // Sem dados salvos no banco de ranking para o servidor especificado
    if (!data_usuarios)
        return client.tls.editReply(interaction, user, "dive.rank.error_2", client.decider(user?.conf.ghost_mode, 0), 1)

    // Verificando a quantidade de entradas e estimando o número de páginas
    paginas = Math.ceil(data_usuarios.length / 6)

    if (!user_alvo_data) {
        if (pagina > paginas) // Número de página escolhida maior que as disponíveis
            return client.tls.editReply(interaction, user, "dive.rank.error_1", client.decider(user?.conf.ghost_mode, 0), client.emoji(1))

        // Removendo os usuários respectivos as primeiras páginas
        remover = pagina === paginas ? (pagina - 1) * 6 : data_usuarios.length % 6 !== 0 ? pagina !== 2 ? (pagina - 1) * 6 : (pagina - 1) * 6 : (pagina - 1) * 6

        for (let x = 0; x < remover; x++)
            data_usuarios.shift()
    }

    if (paginas > 1 && !user_alvo_data)
        rodape = `( ${pagina} | ${paginas} ) - ${paginas}`

    const user_i = user

    for (const user_interno of data_usuarios) {
        if (user_alvo_data)
            if (user_interno.uid === user_alvo_data.id) {
                usuario_alvo.push(user_interno.xp)
                break
            }

        if (i < 6) {
            // Procurando a Badge fixada do usuário
            const user_a = await client.getUser(user_interno.uid)

            let fixed_badge = busca_badges(client, badgeTypes.FIXED, user_a) || ""
            if (fixed_badge) fixed_badge = fixed_badge.emoji

            const nome_usuario = user_interno.nickname ? user_interno.nickname : client.tls.phrase(user, "util.steam.undefined")

            if (parseInt(pagina) !== 1)
                usernames.push(`${client.defaultEmoji("person")} #${remover + i + 1} \`${(nome_usuario).replace(/ /g, "")}\` ${fixed_badge}`)
            else
                usernames.push(`${medals[i] || ":medal:"} #${i + 1} \`${(nome_usuario).replace(/ /g, "")}\` ${fixed_badge}`)

            ids.push(user_interno.uid)
            experiencias.push(`\`${client.locale(parseInt(user_interno.xp))} EXP\``)

            if (escopo === "server")
                levels.push(`\`${client.locale(Math.floor(user_interno.xp / 1000))}\` - \`${((user_interno.xp % 1000) / 1000).toFixed(2)}%\``)
            else {
                let nome_server

                if (public_servers.includes(user_interno.sid)) {
                    // Checando no cache se o nome está salvo
                    try {
                        if (!servidores[user_interno.sid]) {
                            nome_server = client.guilds().get(user_interno.sid || '0')
                            servidores[nome_server.id] = nome_server.name
                        } else
                            nome_server = servidores[user_interno.sid]
                    } catch {
                        nome_server = client.tls.phrase(user_i, "util.steam.undefined")
                    }
                } else
                    nome_server = client.tls.phrase(user_i, "util.steam.undefined")

                servers.push(`\`${nome_server}\``)
            }

            if (!user_alvo_data) // Verifica se a entrada é um ID
                i++
        }
    }

    if (escopo === "server") { // Exibindo o rank normalmente

        if (!user_alvo_data) // Sem usuário alvo definido
            retorna_ranking(client, user, interaction, ids, usernames, experiencias, levels, servers, rodape, escopo, autor_original)
        else // Retornando apenas o card do usuário alvo
            retorna_card_alvo(client, user, interaction, usuario_alvo, user_alvo_data)

    } else { // Ranking global

        if (!user_alvo_data)
            retorna_ranking(client, user, interaction, ids, usernames, experiencias, levels, servers, rodape, escopo, autor_original)
        else // Retornando apenas o card do usuário alvo
            retorna_card_alvo(client, user, interaction, usuario_alvo, user_alvo_data)
    }
}

async function retorna_ranking(client, user, interaction, ids, usernames, experiencias, levels, servers, rodape, escopo, autor_original) {

    const bot = await client.getBot()

    // Apenas é mostrado caso seja verificação por servidor
    let descricao_banner = `${client.tls.phrase(user, "dive.rank.nivel_descricao")} 🎉\n-----------------------\n`
    let nome_embed = `${client.tls.phrase(user, "dive.rank.rank_sv")} ${interaction.guild.name}`

    if (paginas > 1)
        rodape = `${rodape} ${client.tls.phrase(user, "dive.rank.rodape")}`
    else
        rodape = ""

    if (escopo !== "server") {
        descricao_banner = ""
        nome_embed = client.tls.phrase(user, "dive.rank.rank_global")
    }

    const embed = new EmbedBuilder()
        .setTitle(nome_embed)
        .setColor(client.embed_color(user.misc.color))
        .setThumbnail(interaction.guild.iconURL({ size: 2048 }))
        .setDescription(client.replace(`\`\`\`fix\n${descricao_banner}   >✳️> auto_replX EXP <✳️<\`\`\``, bot.persis.ranking))
        .addFields(
            {
                name: `${client.emoji("mc_wax")} ${client.tls.phrase(user, "dive.rank.enceirados")}`,
                value: usernames.join("\n"),
                inline: true
            },
            {
                name: `:postal_horn: **${client.tls.phrase(user, "dive.rank.experiencia")}**`,
                value: experiencias.join("\n"),
                inline: true
            }
        )

    if (rodape !== "")
        embed.setFooter({
            text: rodape,
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (escopo === "server")
        embed.addFields(
            {
                name: `:beginner: **${client.tls.phrase(user, "dive.rank.nivel")}**`,
                value: levels.join("\n"),
                inline: true
            }
        )
    else
        embed.addFields(
            {
                name: `:globe_with_meridians: **${client.tls.phrase(user, "util.canal.servidor")}**`,
                value: servers.join("\n"),
                inline: true
            }
        )

    let row = []
    const b_disabled = require("../../functions/rank_navigation")({ pagina, paginas, ids, interaction })

    if (paginas > 1)
        row = client.create_buttons([
            { id: "rank_button", name: '⏪', type: 1, data: `1|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[0] },
            { id: "rank_button", name: '◀️', type: 1, data: `2|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[1] },
            { id: "rank_button", name: '🔘', type: 0, data: `3|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[2] },
            { id: "rank_button", name: '▶️', type: 1, data: `4|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[3] },
            { id: "rank_button", name: '⏩', type: 1, data: `5|${pagina}.${escopo}.rank_navegar`, disabled: b_disabled[4] }
        ], interaction)

    try {
        if (autor_original) {
            if (nav_buttons) {
                if (paginas > 1)
                    await interaction.editReply({
                        embeds: [embed],
                        components: [row],
                        ephemeral: client.decider(user?.conf.ghost_mode, 0)
                    })
                else
                    await interaction.editReply({
                        embeds: [embed],
                        ephemeral: client.decider(user?.conf.ghost_mode, 0)
                    })
            } else {
                if (paginas > 1)
                    await interaction.update({
                        embeds: [embed],
                        components: [row],
                        ephemeral: client.decider(user?.conf.ghost_mode, 0)
                    })
                else
                    await interaction.update({
                        embeds: [embed],
                        ephemeral: client.decider(user?.conf.ghost_mode, 0)
                    })
            }
        } else {
            if (paginas > 1)
                await interaction.editReply({
                    embeds: [embed],
                    components: [row],
                    ephemeral: true
                })
            else
                await interaction.editReply({
                    embeds: [embed],
                    ephemeral: true
                })
        }
    } catch (err) {
        client.error(err, "Rank Model")
        client.tls.reply(interaction, user, "inic.error.epic_embed_fail", true, client.emoji(0))
    }
}

async function retorna_card_alvo(client, user, interaction, usuario_alvo, user_alvo_data) {

    if (usuario_alvo.length === 0)
        usuario_alvo.push(0)

    const user_a = await client.getUser(user_alvo_data.id)
    let fixed_badge = busca_badges(client, badgeTypes.FIXED, user_a) || ""

    if (fixed_badge) fixed_badge = fixed_badge.emoji

    const embed = new EmbedBuilder()
        .setTitle(`${user_alvo_data.username} ${fixed_badge}`)
        .setColor(client.embed_color(user_a.misc.color))
        .setThumbnail(user_alvo_data.avatarURL({ dynamic: true, size: 2048 }))
        .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    embed.addFields(
        {
            name: `:postal_horn: ${client.tls.phrase(user, "dive.rank.experiencia")}`,
            value: `\`${usuario_alvo[0].toFixed(2)} EXP\``,
            inline: true
        },
        {
            name: `:beginner: ${client.tls.phrase(user, "dive.rank.nivel")}`,
            value: `\`${client.locale(parseInt(usuario_alvo[0] / 1000))}\` - \`${((usuario_alvo[0] % 1000) / 1000).toFixed(2)}%\``,
            inline: true
        },
        { name: "⠀", value: "⠀", inline: true }
    )

    interaction.editReply({
        embeds: [embed],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}