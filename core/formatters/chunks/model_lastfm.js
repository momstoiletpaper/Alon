const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { EmbedBuilder } = require('discord.js')

let horas_tocadas, horas_passadas

module.exports = async ({ client, user, interaction }) => {

    let idioma_definido = client.idioma.getLang(interaction), texto_entrada = ""
    idioma_definido = idioma_definido === "al-br" ? "pt-br" : idioma_definido

    const params = {
        url: interaction.options.getString("url"),
        user: interaction.options.getUser("user")
    }

    if (params.url)
        texto_entrada = params.url

    alvo = interaction.options.getUser("user") || interaction.user
    const user_alvo = await client.getUser(alvo.id)

    // user_alvo -> usuário marcado pelo comando
    // user -> usuário que disparou o comando

    if (!texto_entrada) // Verificando se o usuário possui link com a steam
        if (!user_alvo.social || !user_alvo.social.lastfm)
            return client.tls.reply(interaction, user, "util.lastfm.sem_link", true, 1)
        else
            texto_entrada = user_alvo.social.lastfm

    const usuario_alvo = `https://www.last.fm/pt/user/${texto_entrada}`
    const usuario_semanal = `https://www.last.fm/pt/user/${texto_entrada}/listening-report/week`

    // Aumentando o tempo de duração da resposta
    await interaction.deferReply({ ephemeral: client.decider(user?.conf.ghost_mode, 0) })

    fetch(usuario_alvo)
        .then(response => response.text())
        .then(async res => {

            try {
                if (res.includes("Página não encontrada"))
                    return client.tls.editReply(interaction, user, "util.lastfm.error_1", client.decider(user?.conf.ghost_mode, 0), 1)

                let descricao = "", criacao_conta, avatar, nome, obsessao = "", musica_obsessao, artista_obsessao, media_scrobbles = 0, musicas_ouvidas, artistas_ouvidos, faixas_preferidas = 0, scrobble_atual = ""

                if (!res.includes("ainda não ouviu nenhuma música.")) {
                    if (res.includes("<div class=\"about-me-header\">")) {
                        descricao = client.formata_texto(`- "${(res.split("<div class=\"about-me-header\">")[1].split("</p>")[0].replace("<p>", "").replace(/\n/g, "")).trim()}"`)
                        descricao = `${descricao.split("</span>")[0]}"`
                        descricao = descricao.replace(/\s{2,}/g, ' ').replace("\" ", "\"")
                    }

                    if (res.includes("<span class=\"header-scrobble-since\">"))
                        criacao_conta = client.formata_data(res.split("<span class=\"header-scrobble-since\">")[1].split("</span>")[0].replace("• em scrobble desde ", ""))

                    avatar = `https://lastfm.freetls.fastly.net/i/u/avatar170s/${res.split("alt=\"Avatar de ")[0].split("https://lastfm.freetls.fastly.net/i/u/avatar170s/")[1].replace("\"", "")}`
                    nome = res.split("Perfil musical de ")[1].split(" | Last.fm</title>")[0]

                    if (res.includes("data-analytics-action=\"ObsessionTrackName\"")) {
                        obsessao = res.split("data-analytics-action=\"ObsessionTrackName\"")[1]

                        musica_obsessao = client.formata_texto(obsessao.split("</a>")[0].split(">")[1])
                        artista_obsessao = client.formata_texto(obsessao.split("data-analytics-action=\"ObsessionArtistName\"")[1].split("</a>")[0].split(">")[1])

                        obsessao = `💿 ${client.tls.phrase(user, "util.lastfm.obsessao")}\n${musica_obsessao} - ${artista_obsessao}\n-----------------------\n`
                    }

                    if (res.includes("modal?action=scrobbling-now-theirs\"")) {
                        scrobble_atual = `${client.formata_texto(res.split("modal?action=scrobbling-now-theirs\"")[0].split("data-toggle-button-current-state=")[2].split("title=\"")[1].split("\"")[0])} - ${client.formata_texto(res.split("modal?action=scrobbling-now-theirs\"")[0].split("data-toggle-button-current-state=")[2].split("title=\"")[2].split("\"")[0])}`

                        musica_curtida = res.split("modal?action=scrobbling-now-theirs\"")[0].split("data-toggle-button-current-state=\"")[1].split("\"")[0] === "unloved" ? "🖤 " : "💙 "

                        obsessao += `🎶 ${client.tls.phrase(user, "util.lastfm.em_scrobble")}: \n${musica_curtida}${scrobble_atual}`
                    }

                    if (obsessao !== "")
                        obsessao = `\`\`\`fix\n${obsessao}\`\`\``

                    if (res.includes("Média de "))
                        media_scrobbles = res.split("Média de ")[1].split(" scrobble")[0]

                    musicas_ouvidas = res.split("<h4 class=\"header-metadata-title\">Scrobbles</h4>")[1].split("</a></p>")[0].split("/library\"")[1].split(">")[1].replace(/ /g, "")
                    artistas_ouvidos = res.split("/library/artists\"")[1].split("</a>")[0].replace(">", "").replace(/ /g, "").replace(/\n/g, "")

                    if (res.includes("<h4 class=\"header-metadata-title\">Faixas preferidas</h4>"))
                        faixas_preferidas = res.split("<h4 class=\"header-metadata-title\">Faixas preferidas</h4>")[1].split("</a></p>")[0].split("/loved\"")[1].replace(">", "").replace(/ /g, "").replace(/\n/g, "")

                    // Buscando histórico semanal do usuário
                    fetch(usuario_semanal)
                        .then(response => response.text())
                        .then(async semanal => {

                            let scrobbles_semanal = 0, media_semanal = 0, tempo_reproducao = 0, artistas_semanal = 0, albuns_semanal = 0

                            let scrobbles_semana_passada = 0, media_semana_passada = 0, tempo_reproducao_passada = 0, artistas_semana_passada = 0, albuns_semana_passada = 0

                            let indicador_scrobbles = "⏺️", indicador_media = "⏺️", indicador_tempo = "⏺️", indicador_artista = "⏺️", indicador_album = "⏺️"

                            if (!semanal.includes("não ouviu nenhuma música :(")) {
                                // Scrobbles p/ dia
                                if (semanal.includes("<h4 class=\"header-metadata-title\">TOTAL DE SCROBBLES</h4>")) {

                                    scrobbles_semanal = semanal.split("<h4 class=\"header-metadata-title\">TOTAL DE SCROBBLES</h4>")[1].split(" scrobbles")[0].split(">")[2].trim()

                                    scrobbles_semana_passada = semanal.split("class=\"listening-report-highlight-comparison\">")[1].split(" (semana passada)")[0].split("vs. ")[1].trim()

                                    indicador_scrobbles = regula_porcentagem(scrobbles_semanal, scrobbles_semana_passada, 0)
                                }

                                // Média de Scrobbles p/ dia
                                if (semanal.includes("<h4 class=\"header-metadata-title\">MÉDIA DIÁRIA DE SCROBBLES</h4>")) {

                                    media_semanal = semanal.split("<h4 class=\"header-metadata-title\">MÉDIA DIÁRIA DE SCROBBLES</h4>")[1].split(" scrobbles")[0].split(">")[1].trim()

                                    media_semana_passada = semanal.split("class=\"listening-report-highlight-comparison\">")[2].split(" (semana passada)")[0].split("vs. ")[1]

                                    indicador_media = regula_porcentagem(media_semanal, media_semana_passada, 0)
                                }

                                // Tempo de reprodução
                                if (semanal.includes("<h4 class=\"header-metadata-title\">TEMPO DE REPRODUÇÃO</h4>")) {

                                    tempo_reproducao = semanal.split("<h4 class=\"header-metadata-title\">TEMPO DE REPRODUÇÃO</h4>")[1].split("</div>")[0].split(">")[1].trim()

                                    tempo_reproducao_passada = semanal.split("class=\"listening-report-highlight-comparison\">")[3].split(" (semana passada)")[0].split("vs. ")[1].trim()

                                    indicador_tempo = regula_porcentagem(tempo_reproducao, tempo_reproducao_passada, 1, client, user)
                                }

                                // Álbuns
                                if (semanal.includes("<div class=\"graph-description\">")) {

                                    albuns_semanal = semanal.split("<div class=\"graph-description\">")[1].split(" álbuns")[0].split("<h3>")[1].trim()

                                    albuns_semana_passada = semanal.split("<p class=\"listening-report-highlight-comparison-meta\">")[1].split(" (semana passada)")[0].split("vs. ")[1].trim()

                                    indicador_album = regula_porcentagem(albuns_semanal, albuns_semana_passada, 0)
                                }

                                // Artistas
                                if (semanal.includes("<div class=\"graph-description\">")) {

                                    artistas_semanal = semanal.split("<div class=\"graph-description\">")[2].split(" artistas")[0].split("<h3>")[1].trim()

                                    artistas_semana_passada = semanal.split("<p class=\"listening-report-highlight-comparison-meta\">")[2].split(" (semana passada)")[0].split("vs. ")[1].trim()

                                    indicador_artista = regula_porcentagem(artistas_semanal, artistas_semana_passada, 0)
                                }
                            }

                            const row = client.create_buttons([
                                { name: "LastFM", value: usuario_alvo, type: 4, emoji: "🌐" }
                            ], interaction)

                            const embed = new EmbedBuilder()
                                .setTitle(client.replace(client.tls.phrase(user, "util.lastfm.perfil_musical"), nome))
                                .setColor(client.embed_color(user_alvo.misc.color))
                                .setThumbnail(avatar)
                                .addFields(
                                    {
                                        name: `${client.defaultEmoji("instrument")} ${client.tls.phrase(user, "util.lastfm.geral")}`,
                                        value: `${client.defaultEmoji("music")} **Scrobbles: **\`${musicas_ouvidas}\`\n:radio: **${client.tls.phrase(user, "util.lastfm.media_dia")}: **\`${media_scrobbles}\``,
                                        inline: true
                                    },
                                    {
                                        name: "⠀",
                                        value: `${client.defaultEmoji("singer")} **${client.tls.phrase(user, "util.lastfm.artistas")}: **\`${artistas_ouvidos}\`\n${client.defaultEmoji("heart")} **${client.tls.phrase(user, "util.lastfm.faixas_favoritas")}: **\`${faixas_preferidas}\``,
                                        inline: true
                                    },
                                    {
                                        name: `:birthday: ${client.tls.phrase(user, "util.user.conta_criada")}`,
                                        value: `<t:${criacao_conta}:D>\n ( <t:${criacao_conta}:R> )`,
                                        inline: true
                                    }
                                )

                            if (descricao.length > 0 || obsessao.length > 0)
                                embed.setDescription(`${descricao}\n${obsessao}`)

                            if (!semanal.includes("não ouviu nenhuma música :("))
                                embed.addFields(
                                    {
                                        name: `${client.defaultEmoji("calendar")} ${client.tls.phrase(user, "util.lastfm.semanal")}`,
                                        value: `${client.defaultEmoji("album")} **${client.tls.phrase(user, "util.lastfm.albuns")}: **\`${albuns_semanal} vs ${albuns_semana_passada}\` \`${indicador_album}%\`\n${client.defaultEmoji("singer")} **${client.tls.phrase(user, "util.lastfm.artistas")}: **\`${artistas_semanal} vs ${artistas_semana_passada}\` \`${indicador_artista}%\`\n${client.defaultEmoji("music")} **Scrobbles: **\`${scrobbles_semanal} vs ${scrobbles_semana_passada}\` \`${indicador_scrobbles}%\`\n:radio: **${client.tls.phrase(user, "util.lastfm.media_dia")}: **\`${media_semanal} vs ${media_semana_passada}\` \`${indicador_media}%\`\n${client.defaultEmoji("time")} **${client.tls.phrase(user, "util.lastfm.tempo_tocado")}: **\`${horas_tocadas} vs ${horas_passadas}\` \`${indicador_tempo}%\``,
                                        inline: false
                                    }
                                )

                            interaction.editReply({
                                embeds: [embed],
                                components: [row],
                                ephemeral: client.decider(user?.conf.ghost_mode, 0)
                            })
                        })
                } else
                    client.tls.editReply(interaction, user, "util.lastfm.sem_scrobbles", client.decider(user?.conf.ghost_mode, 0), 1)
            } catch (err) {
                client.error(err, "LastFM Model")
                client.tls.editReply(interaction, user, "util.lastfm.error_2", true, 4)
            }
        })
        .catch((err) => {
            client.error(err, "LastFM Model")
            client.tls.editReply(interaction, user, "util.lastfm.error_2", true, 4)
        })
}

regula_porcentagem = (stats_semana, stats_passado, hora, client, user) => {

    if (hora) { // Formatando a hora para números inteiros
        let hr_tempo = 0 // Usado para converter dias em horas

        // Checando se há dias de reprodução registrados
        if (stats_semana.includes("dia")) {
            hr_tempo = parseInt(stats_semana.split("dia")[0]) * 24

            hr_tempo += parseInt(stats_semana.split(",")[1].split("hora")[0])
            stats_semana = hr_tempo
        } else // Apenas horas
            stats_semana = parseInt(stats_semana.split(" horas")[0])

        // Checando se há dias de reprodução registrados
        if (stats_passado.includes("dia")) {
            hr_tempo = parseInt(stats_passado.split("dia")[0]) * 24

            hr_tempo += parseInt(stats_passado.split(",")[1].split("hora")[0])
            stats_passado = hr_tempo
        } else // Apenas horas
            stats_passado = parseInt(stats_passado.split(" horas")[0])

        // Verificando a quantidade de horas para poder ajustar
        if (stats_semana !== 1)
            horas_tocadas = `${stats_semana}${client.tls.phrase(user, "util.unidades.horas")}`
        else
            horas_tocadas = `${stats_semana}${client.tls.phrase(user, "util.unidades.hora")}`

        // Verificando a quantidade de horas para poder ajustar
        if (stats_passado !== 1)
            horas_passadas = `${stats_passado}${client.tls.phrase(user, "util.unidades.horas")}`
        else
            horas_passadas = `${stats_passado}${client.tls.phrase(user, "util.unidades.hora")}`
    } else {
        // Convertendo os números em formato de string para poder calcular
        stats_semana = parseInt(stats_semana.replace(".", ""))
        stats_passado = parseInt(stats_passado.replace(".", ""))
    }

    porcentagem = (100 * stats_semana) / stats_passado

    if (stats_semana < stats_passado)
        porcentagem = `🔽 ${(100 - porcentagem).toFixed(2)}`
    else
        porcentagem = `🔼 ${(porcentagem - 100).toFixed(2)}`

    return porcentagem
}