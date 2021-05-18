const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');

const { existsSync } = require("fs");
prefix = config.prefix;

var usos = 120, usos_anterior = 0;

// Ativar o bot [ npm test ]
// Hospedando ${bot.users.size} usuários em ${bot.channels.size} canais e em ${bot.guilds.size} servidores diferentes!

bot.on("ready", () => {
    console.log(`Caldeiras aquecidas!`);
    console.log(`Ativo para ${bot.users.size} usuários em ${bot.channels.size} canais em ${bot.guilds.size} servidores diferentes!`);

    bot.user.setActivity('Vapor p/ fora!', 'COMPETING')
    let activities = [
        "ãh | ãhelp",
        "Carvão na fogueira",
        "Fumaça para o mundo",
    ]
    
    i = 0;
    setInterval(() => bot.user.setActivity(`${activities[i++ % activities.length]}`), 5000);
});

bot.on("guildCreate", guild => {
    console.log(`O Bot entrou no servidor: ${guild.name} ( ID: ${guild.id} ), que contém: ${guild.memberCount} membros`);
    bot.user.setActivity(`Estou em ${bot.guilds.size}`);
});

bot.on("guildDelete", guild => {
    console.log(`O Bot foi removido de um servidor: ${guild.name} ( ID: ${guild.id} )`);
    bot.user.setActivity(`Estou em ${bot.guilds.size}`);
});

bot.on('message', message => {
    
    var content = message.content;

    // impede que o bot responda outros bots e ignora mensagens que não começem com o prefixo
    if (!content.startsWith(prefix) || message.author.bot) return;

    if(content == "ãc")
        content = "ãcurio";
    else if(content == "ãi"){
        content = "ãinfo";
        
        content += " "+ usos;
    }else if(content == "ãb")
        content = "ãbriga";
    else if(content == "ãj")
        content = "ãjoke";
    else if(content == "ãh")
        content = "ãhelp";
    else if(content == "ãcaz")
        content = "ãcazalbe";
    else if(content.includes("ãco"))
        content = content.replace("ãco", "ãcoin");
    else if(content.includes("ãjkp"))
        content = content.replace("ãjkp", "ãrps");
    else if(content.includes("ãga") && !content.includes("ãgado"))
        content = content.replace("ãga", "ãgado");
    else if(content == "ãp")
        content = "ãping";

    const args = content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    
    var canal = message.channel.name;
    if(typeof canal == "undefined")
        canal = "Chat privado";

    console.log('Comando: '+ content + ", Canal: "+ canal);

    const path = `./comandos/${command}.js`
    if (existsSync(path)){
        usos++;
        require(path)({bot, message, args});
    }

    if(content == 'ã'){

        const comando = new Discord.MessageAttachment('arquivos/img/sem_comando.jpg');

        message.channel.send(`${message.author} Kd o comando fiote!`, comando);
    }

    if(content == 'ãda' || content == 'ãdado'){
        
        usos++;
        var dado = 1 + Math.round(5 * Math.random());

        message.channel.send('O dado caiu no [ '+ dado + ' ]');
    }

    if(content == 'ãpaz' || content == 'ãpz'){
        
        usos++;
        message.channel.send('https://tenor.com/view/galerito-gil-das-esfihas-meme-br-slondo-gif-15414263');
    }

    if(content == 'ãsf' || content == 'ãsfiha'){

        usos++;
        message.channel.send(`Vai uma esfiha ae? :yum: :yum: :yum:`);
        message.channel.send('https://tenor.com/view/gil-das-esfihas-galerito-esfiha-meme-brasil-gif-21194713');
    }

    if(content == 'ãpi' || content == 'ãpiao'){

        usos++;
        message.channel.send(`Roda o pião! ${message.author}`);
        message.channel.send('https://tenor.com/view/pi%C3%A3o-da-casa-propria-silvio-santos-dona-maria-slondo-loop-gif-21153780');
    }

    if(content == 'ãbaidu' || content == 'ãdu'){

        usos++;
        const baidu = new Discord.MessageAttachment('arquivos/img/baidu.png');

        message.channel.send(`${message.author} Louvado seja!!`, baidu);
    }

    if(content == 'ãho' || content == 'ãhora'){

        usos++;
        const hora = new Discord.MessageAttachment('arquivos/sng/hora_certa.mp3');

        message.channel.send(`${message.author} Hora certa!`, hora);
    }

    if(content.includes("ãrep")){

        usos++;
        content = content.replace("ãrep", "");

        message.channel.send(content, {
            tts: true
           });
    }

    if(usos == usos_anterior)
        message.channel.send(`${message.author} erroooouuuuuuuuuuuuuuuuu`);

    usos_anterior = usos;
});

// Token do bot
bot.login(config.token);