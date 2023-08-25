function handleChatCommand (connection, parsedMessage) {
    // Get the command from the message without an !.
    let command = parsedMessage.parameters.substring(1).toLowerCase().replace(/\s/g, '');
    // Get the arguments from the message.
    let args = parsedMessage.parameters.substring(1).split(' ');
    // Remove the command from the arguments.
    args.shift();
    // log command used and who used it
    console.log(`Command: ${command} attempted by: ${parsedMessage.source.nick} with parameters: ${args.length > 0 ? args : 'none'}`);
}

module.exports = handleChatCommand;