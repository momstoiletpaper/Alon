module.exports = {
    name: "history",
    description: "Fatos que ocorreram no mundo em determinada data",
    aliases: [ "hs", "hoje", "today", "historia", "fato", "contecimento", "con" ],
    cooldown: 3,
    permissions: [ "SEND_MESSAGES" ],
    async execute(client, message, args) {
    
        const reload = require('auto-reload');
        const { idioma_servers } = reload('../../arquivos/json/dados/idioma_servers.json');
        const { utilitarios } = require('../../arquivos/idiomas/'+ idioma_servers[message.guild.id] +'.json');
        const idioma_definido = idioma_servers[message.guild.id];

        const fetch = require('node-fetch');
        let datas = [];
        let acontecimento = [];
        let acontecimento_final = [];
        let fontes = [];

        let data = new Date();
        const ano = data.getFullYear();

        const meses = [".jan.", ".fev.", ".mar.", ".abr.", ".mai.", ".jun.", ".jul.", ".ago.", ".set.", ".out.", ".nov.", ".dez."];
        const nome_mes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

        let url_completa = "https://history.uol.com.br/hoje-na-historia/";

        if(args.length > 0){
            if(!args[0].includes("-")){
                message.lineReply(":warning: | "+ utilitarios[10]["aviso_1"]);
                return;
            }

            let data_pesquisada = args[0].split("-");
            let dia = data_pesquisada[0];
            let mes = data_pesquisada[1];

            if(isNaN(dia) || isNaN(mes)){
                message.lineReply(":hotsprings: | "+ utilitarios[10]["aviso_2"]).then(message => message.delete({timeout: 6000}));
                return;
            }

            if(idioma_definido == "pt-br"){
                if(mes > 12 || mes < 0 || dia > 31 || dia < 0 || (mes == 2 && dia > 29)){
                    message.lineReply(":hotsprings: | "+ utilitarios[10]["aviso_1"]).then(message => message.delete({timeout: 6000}));
                    return;
                }
                
                url_completa += ano +"-"+ mes +"-"+ dia;
            }else{
                if(dia > 12 || dia < 0 || mes > 31 || mes < 0 || (mes > 29 && dia == 2)){
                    message.lineReply(":hotsprings: | "+ utilitarios[10]["aviso_1"]).then(message => message.delete({timeout: 6000}));
                    return;
                }
            
                url_completa += ano +"-"+ dia +"-"+ mes;
            }
        }

        fetch(url_completa)
        .then(response => response.text())
        .then(async res => {

            alvos =  res.split("<span class=\"hstBlock__category \">");

            // Link do artigo completo
            url = res.split("<a href=\"");

            for(let i = 0; i < 8; i++){
                url.shift();
            }

            for(let i = 0; i < alvos.length; i++){
                alvos[i] = alvos[i].slice(0, 200);
                
                let data_ajustada = alvos[i].slice(0, 11); // Organizando o nome dos meses
                data_ajustada = data_ajustada.toLowerCase(); // Evita erros com abreviaturas de meses

                let local = meses.indexOf(data_ajustada.slice(2, 7));

                data_ajustada = data_ajustada.replace(meses[local], " de "+ nome_mes[local] +" de ");
                datas.push(data_ajustada);
                
                acontecimento.push(alvos[i].split("<h1 class=\"hstBlock__title\">"));
            }

            acontecimento.shift(); // Removendo o primeiro elemento

            for(let i = 0; i < acontecimento.length; i++){
                let aconteciment = acontecimento[i][1]; // Organizando a descrição do evento ocorrido
                
                let titulo = aconteciment.split("</h1>")

                acontecimento_final.push(titulo[0]);
            }

            datas.shift(); // Removendo o primeiro elemento

            for(let i = 0; i < datas.length; i++){ // Salva o link dos artigos
                link = url[i].split("\">\n");
                fontes.push("https://history.uol.com.br"+ link[0]);
            }

            if(datas.length > 0){
                const num = Math.round((datas.length - 1) * Math.random()); // Enviando o evento
                message.lineReply(":bookmark: | `"+ datas[num] + "`, "+ acontecimento_final[num] +"\nFonte: "+ fontes[num]);
            }else
                message.lineReply(":mag: | "+ utilitarios[10]["sem_entradas"]);
        });
    }
}