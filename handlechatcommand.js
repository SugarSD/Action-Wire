const executeCommand = require('./executecommand');

function handleChatCommand (bot, parsedMessage) {
    // Get the command from the message without an !.
    let command = parsedMessage.parameters.substring(1).split(' ')[0].toLowerCase().replace(/\s/g, '');
    // Get the arguments from the message.
    let args = parsedMessage.parameters.substring(1).split(' ');
    // Remove the command from the arguments.
    args.shift();
    // If there are no arguments, set args to false.
    args = args.length > 0 ? args : false;
    // Get the username of the person who sent the message.
    let username = parsedMessage.source.nick;
    // log command used and who used it
    console.log(`Command: ${command} attempted by: ${username} with parameters: ${args ? args : 'none'}`);
    // Run the command if it exists.
    executeCommand(command, args, username, {rawMessage: parsedMessage, bot: bot});
}

module.exports = handleChatCommand;