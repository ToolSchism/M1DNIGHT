const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Bot đã sẵn sàng: ${client.user.tag}`);

    client.user.setPresence({
      status: 'dnd',
      activities: [{
        name: 'i n t o the v o i d',
        type: ActivityType.Custom
      }]
    });
  }
};
