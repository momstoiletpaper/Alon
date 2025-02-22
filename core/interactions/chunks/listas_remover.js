const { listAllUserGroups } = require("../../database/schemas/Task_group")

module.exports = async ({ client, user, interaction, autor_original, pagina }) => {

    let listas = await (user?.conf.global_tasks ? listAllUserGroups(interaction.user.id) : listAllUserGroups(interaction.user.id, interaction.guild.id))

    if (listas.length < 1) // Sem listas
        return client.tls.reply(interaction, user, "util.tarefas.sem_lista_r", true, client.emoji(0))

    // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
    if (listas.length < pagina * 24)
        pagina--

    const data = {
        alvo: "listas_remover",
        reback: "browse_button",
        values: listas
    }

    const obj = {
        content: client.tls.phrase(user, "util.tarefas.lista_e", 1),
        components: [client.create_menus({ client, interaction, user, data, pagina })],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    }

    let row = client.menu_navigation(data, pagina || 0)

    if (row.length > 0) // Botões de navegação
        obj.components.push(client.create_buttons(row, interaction))

    if (!autor_original) {
        interaction.customId = null
        obj.ephemeral = true
    }

    client.reply(interaction, obj)
}