const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const configDatabase = require('./ConfigDatabase.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], partials: ['REACTION'] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
client.guildconfigs = configDatabase;

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}


client.once('ready', () => {
	console.log('Ready!');
	client.guilds.cache.forEach(guild => {
		console.log(`${guild.name} ${guild.id}`);
		if (client.guildconfigs[guild.id] === undefined) {
			console.log('Couldn\'t find entry for Guild with ID %d, name %s, creating one now.', guild.id, guild.name);
			client.guildconfigs[guild.id] = {
				'OnJoinRoleID': 0,
				'WelcomeChannel': 0,
				'roleMenuID': 0,
				'adminID': 0,
				'WelcomeMessage': 'Welcome new friend!!!',
					'roleMap': {
				},
			};
		}
	});

		fs.writeFile('./ConfigDatabase.json', JSON.stringify(client.guildconfigs, null, '\t'), function(err) {
				if (err) {
					console.log(err);
				}
			},
		);

});

client.on('interactionCreate', async interaction => {
	if (interaction.isSelectMenu()) {
		/*
			Only rolemenu for now
		*/
		const command = client.commands.get('rolemenu');
		command.execute(interaction);
	}
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);