const { PermissionsBitField } = require('discord.js')

const { readdirSync } = require('fs')

const { alea_hex } = require('./core/functions/hex_color')
const { getBot } = require('./core/database/schemas/Bot')
const { getUser } = require('./core/database/schemas/User')
const { create_menus } = require('./core/generators/menus')
const { create_profile } = require('./core/generators/profile')
const { create_buttons } = require('./core/generators/buttons')
const { createBadge, getUserBadges } = require('./core/database/schemas/Badge')
const { listAllUserTasks } = require('./core/database/schemas/Task')
const { registryStatement } = require('./core/database/schemas/Statement')
const { listAllUserGroups } = require('./core/database/schemas/Task_group')
const { getGuild, getGameChannels, loggerMap } = require('./core/database/schemas/Guild')

const { emojis, default_emoji, emojis_dancantes, emojis_negativos } = require('./files/json/text/emojis.json')
const { spamTimeoutMap } = require('./core/database/schemas/Strikes')
const { busca_badges, badgeTypes } = require('./core/data/badges')

const network = require('./core/events/network')
const translate = require('./core/formatters/translate')
const menu_navigation = require('./core/functions/menu_navigation')
const formata_texto = require('./core/formatters/formata_texto')
const formata_data = require('./core/formatters/formata_data')

function internal_functions(client) {

    console.log("🟠 | Inicializando o bot...")
    console.log("🟠 | Vinculando as funções internas")

    client.error = async (err, local) => {
        await require("./core/events/error")(client, err, local)
    }

    client.atualiza_dados = async (alvo, interaction) => {
        if (!alvo.sid) {
            alvo.sid = interaction.guild.id
            await alvo.save()
        }
    }

    // Retorna a quantidade de arquivos com determinada extensão na url especificada
    client.countFiles = (caminho, extensao) => {
        return readdirSync(caminho).filter(file => file.endsWith(extensao)).length
    }

    client.create_buttons = (data, interaction) => {
        return create_buttons(data, interaction)
    }

    client.create_menus = ({ client, interaction, user, data, pagina, multi_select, guild }) => {
        return create_menus({ client, interaction, user, data, pagina, multi_select, guild })
    }

    client.create_profile = (client, interaction, user, id_alvo) => {
        return create_profile(client, interaction, user, id_alvo)
    }

    client.decider = (entrada, padrao) => {
        // Verifica se um valor foi passado, caso contrário retorna o valor padrão esperado
        return typeof entrada === "undefined" ? padrao : entrada
    }

    client.defaultEmoji = (caso) => {
        return default_emoji[caso][client.random(default_emoji[caso])]
    }

    client.embed_color = (entrada) => {
        if (entrada === "RANDOM")
            return alea_hex()

        return entrada.slice(-6)
    }

    client.emoji = (dados) => {

        let id_emoji = dados

        if (typeof dados === "object") // Escolhendo um emoji do Array com vários emojis
            if (dados[0].length > 8)
                dados = id_emoji[client.random(id_emoji)]

        let emoji

        // Emojis customizados
        if (typeof dados === "string") {

            if (isNaN(parseInt(dados))) { // Emoji por nome próprio do JSON de emojis

                if (dados == "emojis_dancantes")
                    dados = emojis_dancantes[client.random(emojis_dancantes)]
                else if (dados == "emojis_negativos")
                    dados = emojis_negativos[client.random(emojis_negativos)]
                else
                    dados = emojis[dados]
            }

            emoji = client.discord.emojis.cache.get(dados)?.toString()
        } else // Emojis por códigos de status
            emoji = translate.get_emoji(dados)

        if (isNaN(parseInt(id_emoji)))
            emoji = "🔍"

        return emoji
    }

    client.formata_data = (data) => {
        return formata_data(data)
    }

    client.formata_texto = (texto) => {
        return formata_texto(texto)
    }

    client.getBot = () => {
        return getBot(client.x.id)
    }

    client.getGameChannels = () => {
        return getGameChannels()
    }

    client.getGuild = (id_guild) => {
        return getGuild(id_guild)
    }

    client.getGuildChannels = async (interaction, tipo, id_configurado) => {

        // Lista todos os canais de um tipo especifico no servidor
        const canais = interaction.guild.channels.cache.filter(c => c.type === tipo)
        const canais_alvo = []

        if (!id_configurado === "undefined")
            id_configurado = ""

        canais.map(channel => {
            if (channel.id !== id_configurado)
                canais_alvo.push({ id: channel.id, name: channel.name })
        })

        // Ordenando alfabeticamente os canais
        return canais_alvo.sort((a, b) => (client.normalizeString(a.name) > client.normalizeString(b.name)) ? 1 : ((client.normalizeString(b.name) > client.normalizeString(a.name)) ? -1 : 0))
    }

    client.getGuildRoles = async (interaction, id_atual) => {
        const roles = []
        const id_ignorar = id_atual || null

        interaction.guild.roles.cache.forEach(role => {
            if (role.id !== interaction.guild.id && role.id !== id_ignorar && role.editable) { // Adiciona apenas cargos customizados

                // Não inclui cargos que possuem permissões moderativas
                if (!role.permissions.has(PermissionsBitField.Flags.ManageMessages) && !role.permissions.has(PermissionsBitField.Flags.ModerateMembers) && !role.permissions.has(PermissionsBitField.Flags.Administrator))
                    roles.push({ id: role.id, name: role.name })
            }
        })

        // Ordenando alfabeticamente os cargos
        return roles.sort((a, b) => (client.normalizeString(a.name) > client.normalizeString(b.name)) ? 1 : ((client.normalizeString(b.name) > client.normalizeString(a.name)) ? -1 : 0))
    }

    client.getUser = (id_user) => {
        return getUser(id_user)
    }

    client.getUserBadges = (id_user) => {
        return getUserBadges(id_user)
    }

    // Retorna o membro do servidor
    client.getMemberGuild = (interaction, id_alvo) => {

        let membro

        if (interaction.guild) // Coletando a partir de uma interação ou evento
            membro = interaction.guild.members.fetch(id_alvo)
                .catch(() => { return null })
        else if (interaction.members)// Coletando direto da guild
            membro = interaction.members.fetch(id_alvo)
                .catch(() => { return null })

        return membro
    }

    client.getMemberGuildsByPermissions = async ({ interaction, user, permissions }) => {

        const guilds_user = []

        for await (let valor of client.guilds()) {

            const guild = valor[1]

            if (guild.id !== interaction.guild.id) {
                const membro_guild = await guild.members.fetch(user.uid)
                    .catch(() => { return null })

                if (membro_guild) // Listando as guilds que o usuário é moderador
                    if (membro_guild.permissions.has(permissions)) {
                        const internal_guild = await client.getGuild(guild.id)
                        internal_guild.name = guild.name

                        guilds_user.push(internal_guild)
                    }
            }
        }

        // Ordenando alfabeticamente os servidores
        return guilds_user.sort((a, b) => (client.normalizeString(a.name) > client.normalizeString(b.name)) ? 1 : ((client.normalizeString(b.name) > client.normalizeString(a.name)) ? -1 : 0))
    }

    client.getMemberPermissions = async (id_guild, id_member) => {
        const guild = await client.guilds(id_guild)

        if (!guild) return null

        // Retorna todas as permissões de um usuário num servidor especifico
        const membro_guild = await guild.members.fetch(id_member)
            .catch(() => { return null })

        return membro_guild
    }

    // Busca pelo usuário em cache
    client.getCachedUser = (id_alvo) => {
        return client.discord.users.fetch(id_alvo)
    }

    client.guildAction = (warn, chave_traduz) => {

        // Verifica se a ação do servidor é silenciar um membro, caso positivo, retorna o tempo de mute do servidor
        return warn.action === "member_mute" ? `\n${client.defaultEmoji("time")} **${client.tls.phrase(chave_traduz, "mode.spam.tempo")}:** \`${client.tls.phrase(chave_traduz, `menu.times.${spamTimeoutMap[warn.timeout]}`)}\`` : ""
    }

    // Registra os eventos no diário do bot
    client.journal = async (caso, quantia) => {
        require('./core/auto/edit_journal')({ client, caso, quantia })
    }

    // Cria uma lista com vírgulas e & no último elemento
    client.list = (valores, tamanho_maximo) => {

        let lista = ""

        for (let i = 0; i < valores.length; i++) {
            if (typeof valores[i + 1] === "undefined")
                lista += " & "

            lista += `\`${valores[i]}\``

            if (typeof valores[i + 2] !== "undefined")
                lista += ", "
        }

        if (tamanho_maximo)
            if (lista.length > tamanho_maximo)
                lista = `${lista.slice(0, tamanho_maximo)}...`

        return lista
    }

    client.listLanguages = (language) => {

        const idiomas = []

        Object.keys(translate.languagesMap).forEach(lang => {
            if (lang !== language.slice(0, 2))
                idiomas.push(lang)
        })

        return idiomas
    }

    // Converte o valor numério para um formato específico
    client.locale = (valor, locale) => {

        if (typeof locale === "undefined")
            locale = "pt-br"

        return valor.toLocaleString(locale)
    }

    client.menu_navigation = (client, interaction, data, reback, pagina) => {
        return menu_navigation(client, interaction, data, reback, pagina)
    }

    // Sincroniza as ações moderativas em servidores com o network habilitado
    client.network = async (guild, caso, id_alvo) => {
        return network({ client, guild, caso, id_alvo })
    }

    // Remove emojis e caracteres especiais da string
    client.normalizeString = (string) => {
        return string.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}\p{P}\p{Z}{^$=+±\\'|`\\~<>}]/gu, "")
    }

    // Envia uma notificação em um canal
    client.notify = async (id_alvo, conteudo) => {

        if (!id_alvo) return

        const canal = await client.discord.channels.cache.get(id_alvo)
        if (!canal) return

        // Verificando se o bot possui permissões para enviar mensagens ou ver o canal
        if (!canal.permissionsFor(client.id()).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) return

        canal.send(conteudo)
    }

    client.permissions = async (interaction, id_alvo, permissao) => {

        // Permissões do usuário no servidor
        const membro_sv = await client.getMemberGuild(interaction, id_alvo)
        let valido = false

        if (!membro_sv) // Membro não localizado
            return false

        // Verificando se o usuário possui a permissão
        if (membro_sv.permissions.has(permissao))
            valido = true

        return valido
    }

    // Retorna um valor aleatório
    client.random = (intervalo, base) => {
        if (typeof base === "undefined") // Valor minimo aceitável
            base = 0

        if (typeof intervalo === "object") // Recebendo um array de dados
            intervalo = intervalo.length - 1

        return base + Math.round(intervalo * Math.random())
    }

    client.registryBadge = async (user, id_badge) => {

        const all_badges = [], badges_user = await getUserBadges(user.uid)

        // Listando todas as badges que o usuário possui
        if (badges_user.length > 0)
            badges_user.forEach(valor => {
                all_badges.push(parseInt(valor.badge))
            })

        if (!all_badges.includes(id_badge)) {

            // Atribuindo a badge reporter ao usuário
            await createBadge(user.uid, id_badge, client.timestamp())
            const badge = busca_badges(client, badgeTypes.SINGLE, id_badge)

            client.sendDM(user, { data: client.replace(client.tls.phrase(user, "dive.badges.new_badge", client.emoji("emojis_dancantes")), [badge.name, badge.emoji]) })
        }
    }

    // Registra a experiência recebida pelo membro
    client.registryExperience = (message, caso) => {
        require('./core/data/ranking')({ client, message, caso })
    }

    // Registra uma movimentação bancária do usuário
    client.registryStatement = (user, traducao, caso, valor) => {
        return registryStatement(client, user, traducao, caso, valor)
    }

    // Substitui partes do texto por outros valores
    client.replace = (string, valores, especifico) => {

        if (!especifico) {
            if (typeof valores === "object") { // Array com vários dados para alterar

                if (valores.length > 0)
                    while (valores.length > 0) {
                        string = string.replace("auto_repl", valores[0])
                        valores.shift()
                    }
                else // Recebendo um objeto diferente de array
                    string = string.replace("auto_repl", valores)

            } else // Apenas um valor para substituição
                string = string.replaceAll("auto_repl", valores)
        } else
            string = string.replaceAll(especifico[0], especifico[1])

        return string
    }

    client.reply = (interaction, obj) => {

        // Respondendo as interações
        if (interaction.customId)
            interaction.update(obj)
        else
            interaction.reply(obj)
    }

    // Envia uma notificação em DM para o usuário
    client.sendDM = (user, dados, force) => {

        let notifications

        // Previne que o bot envie DM's para si mesmo
        if (user.uid === client.id()) return

        if (force)
            user.conf.notify = 1

        // Notificando o usuário alvo caso ele receba notificações em DM do bot
        if (client.decider(user?.conf.notify, 1))
            client.discord.users.fetch(user.uid).then((user_interno) => {

                // Verificando qual é o tipo de conteúdo que será enviado
                if (dados.embed) {
                    if (!dados.components)
                        user_interno.send({
                            embeds: [dados.embed]
                        })
                            .catch(() => notifications = 1)
                    else
                        user_interno.send({
                            embeds: [dados.embed],
                            components: [dados.components]
                        })
                            .catch(() => notifications = 1)
                } else if (dados.files)
                    user_interno.send({
                        content: dados.data,
                        files: [dados.files]
                    })
                        .catch(() => notifications = 1)
                else
                    user_interno.send(dados.data)
                        .catch(() => notifications = 1)
            })

        // Usuário com DM bloqueada
        if (notifications) {
            user.conf.notify = false
            user.save()
        }
    }

    // Aleatoriza o texto de entrada
    client.shuffleArray = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
        }

        return arr
    }

    client.timestamp = () => {
        return Math.floor(new Date().getTime() / 1000)
    }

    // Atualiza o formato de salvamento das tarefas
    client.update_tasks = async (interaction) => {

        const tasks = await listAllUserTasks(interaction.user.id)
        const listas = await listAllUserGroups(interaction.user.id)

        // Vincula a task com a lista usando o timestamp da lista
        for (let i = 0; i < tasks.length; i++)
            for (let x = 0; x < listas.length; x++)
                if (!tasks[i].g_timestamp)
                    if (tasks[i].group === listas[x].name) {

                        tasks[i].g_timestamp = listas[x].timestamp
                        tasks[i].group = null
                        await tasks[i].save()
                    }
    }

    client.verifyWarnAction = (warn, traduz) => {

        // Listando as penalidades que o usuário receberá com a advertência
        let acao_advertencia = `${loggerMap[warn.action] || loggerMap["none"]} \`${client.tls.phrase(traduz, `menu.events.${warn.action || "none"}`)}\`${client.guildAction(warn, traduz)}`

        if (warn.role) // Advertência com cargo aplicado
            acao_advertencia += `\n:label: <@&${warn.role}>`

        return acao_advertencia
    }

    client.verifyGuildWarns = (guild_warns) => {

        let indice_matriz

        guild_warns.forEach(warn => {
            if ((warn.action === "member_kick_2" || warn.action === "member_ban") && !indice_matriz)
                indice_matriz = warn.rank + 1
        })

        return indice_matriz || guild_warns.length
    }

    // Atualiza o idioma padrão do usuário caso não possua um
    client.verifyUserLanguage = async (user, id_guild) => {

        if (!user.lang) { // Validando se o usuário não possui um idioma padrão
            const guild = await client.getGuild(id_guild)

            user.lang = guild.lang || "pt-br"
            await user.save()
        }
    }

    // Valida se o usuário possui ranking ativo
    client.verifyUserRanking = async (id_user) => {

        let user = await client.getUser(id_user)
        let user_ranking = true

        if (typeof user.conf.ranking !== "undefined")
            user_ranking = user.conf.ranking

        return user_ranking
    }

    console.log(`🟢 | Funções internas vinculadas com sucesso.`)
}

module.exports.internal_functions = internal_functions