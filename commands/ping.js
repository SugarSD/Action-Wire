module.exports = {
    name: 'ping',
    action: function (args, username, bot, util) {
        bot.send(util, 'pong')
    }
};
