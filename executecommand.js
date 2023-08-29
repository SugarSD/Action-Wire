//import commands from './commands';
const { exec } = require('node:child_process');
const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(fileName => fileName.endsWith('.js'));
for (const fileName of commandFiles) {
    let file = require(`./commands/${fileName}`)
	const command = require(`./commands/${fileName}`);
    commands.push(command);
}

function sendChatMessage (util, message) {
    let bot = util.bot;
    bot.connection.sendUTF(`PRIVMSG ${bot.channel} :${message}`);
}

const bot = {
    send: sendChatMessage,
}

function executeCommand (command, args, username, util) {
    // Check if the command exists.
    for ( let currentCommand in commands ) {
        if (commands[currentCommand].name == command) {
            // Run the command.
            commands[currentCommand].action(args, username, bot, util);
            return;
        }
    }
    // If the command doesn't exist, send a message saying so.
    console.log(`Command ${command} does not exist.`);
}

module.exports = executeCommand;