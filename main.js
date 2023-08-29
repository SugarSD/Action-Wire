require('dotenv').config();
const WebSocketClient = require('websocket').client;
const parseMessage = require('./parsemessage.js');
const handleChatCommand = require('./handlechatcommand.js');

console.log(parseMessage)
const client = new WebSocketClient();
const channel = process.env.TWITCH_CHANNEL;  // Replace with your channel.
const account = process.env.TWITCH_BOT_ACCOUNT;   // Replace with the account the bot runs as
const password = process.env.TWITCH_PASSWORD; // Replace with the oauth token for the account the bot runs as

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    // This is a simple bot that doesn't need the additional
    // Twitch IRC capabilities.

    // connection.sendUTF('CAP REQ :twitch.tv/commands twitch.tv/membership twitch.tv/tags');
    
    // Authenticate with the Twitch IRC server and then join the channel.
    // If the authentication fails, the server drops the connection.

    connection.sendUTF(`PASS ${password}`); 
    connection.sendUTF(`NICK ${account}`);
    
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function() {
        console.log('Connection Closed');
        console.log(`close description: ${connection.closeDescription}`);
        console.log(`close reason code: ${connection.closeReasonCode}`);

    });

    // Process the Twitch IRC message.

    connection.on('message', function(ircMessage) {
        if (ircMessage.type === 'utf8') {
            let rawIrcMessage = ircMessage.utf8Data.trimEnd();
            console.log(`Message received (${new Date().toISOString()}): '${rawIrcMessage}'\n`);

            let messages = rawIrcMessage.split('\r\n');  // The IRC message may contain one or more messages.
            messages.forEach(message => {
                let parsedMessage = parseMessage(message);
            
                if (parsedMessage) {
                    // console.log(`Message command: ${parsedMessage.command.command}`);
                    // console.log(`\n${JSON.stringify(parsedMessage, null, 3)}`)

                    switch (parsedMessage.command.command) {
                        case 'PING':
                            connection.sendUTF('PONG ' + parsedMessage.parameters);
                            break;
                        case '001':
                            // Successfully logged in, so join the channel.
                            connection.sendUTF(`JOIN ${channel}`); 
                            break; 
                        case 'JOIN':
                            // Send the initial move message. All other move messages are
                            // sent by the timer.
                            connection.sendUTF(`PRIVMSG ${channel} : Bot Online!`);
                            break;
                        case 'PART':
                            console.log('The channel must have banned (/ban) the bot.');
                            connection.close();
                            break;
                        case 'NOTICE': 
                            // If the authentication failed, leave the channel.
                            // The server will close the connection.
                            if ('Login authentication failed' === parsedMessage.parameters) {
                                console.log(`Authentication failed; left ${channel}`);
                                connection.sendUTF(`PART ${channel}`);
                            }
                            else if ('You don’t have permission to perform that action' === parsedMessage.parameters) {
                                console.log(`No permission. Check if the access token is still valid. Left ${channel}`);
                                connection.sendUTF(`PART ${channel}`);
                            }
                            break;
                        case 'PRIVMSG':
                            // Handle chat commands.
                            if (parsedMessage.parameters.startsWith('!')) {
                                handleChatCommand({connection, channel}, parsedMessage)
                            }
                            break;
                        default:
                            ; // Ignore all other IRC messages.
                    }
                }
            });
        }
    });
    
});

client.connect('ws://irc-ws.chat.twitch.tv:80');
