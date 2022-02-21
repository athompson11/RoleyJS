const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu, GuildMember } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolemenu')
        .setDescription('Rolemenu')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-role')
                .setDescription('Add a role to the role-menu')
                .addRoleOption(option =>
                    option
                            .setName('addedrole')
                            .setDescription('The role to add')
                            .setRequired(true),
                        ),
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-role')
                .setDescription('Remove a role from the role menu')
                .addRoleOption(option =>
                    option
                        .setName('removedrole')
                        .setDescription('The role to remove')
                        .setRequired(true),
                    ),
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('create role menu in the current channel.'),
                )
        /*
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-welcome-message')
                .setDescription('Set the welcome message!')
                .addStringOption(option =>
                    option
                        .setName('welcomemessage')
                        .setDescription('The message to send when new users join.')
                        .setRequired(true),
                ),
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-welcome-role')
                .setDescription('Set the role to give new users after they get past the reaction menu.')
                .addRoleOption(option =>
                    option
                        .setName('welcomerole')
                        .setDescription('Welcome role')
                        .setRequired(true),
                ),
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-rule-message')
                .setDescription('Set the rule message - Users have to react to this to confirm they understand the rules.')
                .addIntegerOption(option =>
                    option
                        .setName('ruleressage')
                        .setDescription('The Rule message ID (get this with right click)')
                        .setRequired(true),
                ),
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-welcome-channel')
                .setDescription('Set the channel to put welcome messages in.')
                .addChannelOption(option =>
                    option
                        .setName('welcomechannel')
                        .setDescription('The welcome message')
                        .setRequired(true),
                ),
                */
        .setDefaultPermission(false),
    async execute(interaction) {
        if (interaction.isSelectMenu()) {
                if (interaction.customId === 'rolemenu') {
                    const interactor = interaction.member;

                    const added = interaction.values;

                    const toremove = interaction.component.options.filter(role => !added.includes(role.value));

                    for (const roleid of added) {
                        interaction.guild.roles.fetch(roleid).then(role => {
                            /*
                            console.log('Trying to add...');
                            console.log(role);
                            */
                            interactor.roles.add(role);
                        });
                    }

                    for (const roleid of toremove) {
                        interaction.guild.roles.fetch(roleid.value).then(role => {
                            /*
                            console.log('Trying to remove...');
                            console.log(role);
                            */
                            interactor.roles.remove(role);
                        });
                    }

                    interactor.send({
                        'content': 'Roles updated!',
                        'ephemeral': true,
                    });

                    return;
            }
        }
        if (!interaction.isCommand()) return;
        await interaction.deferReply();
        if (interaction.options.getSubcommand() === 'add-role') {
            const roleToAdd = interaction.options.getRole('addedrole');
            interaction.client.guildconfigs[interaction.guild.id]['roleMap'][roleToAdd.name] = {
                'id': roleToAdd.id,
                'excludes': [
                ],
            };
                fs.writeFile('./ConfigDatabase.json', JSON.stringify(interaction.client.guildconfigs, null, '\t'), function(err) {
                    if (err) {
                        console.log(err);
                    }
                },
            );
            await interaction.editReply({ content: 'Done!', ephemeral: true });
            return;
        }
        if (interaction.options.getSubcommand() === 'remove-role') {
            const roleToAdd = interaction.options.getRole('removedrole');
            delete interaction.client.guildconfigs[interaction.guild.id]['roleMap'][roleToAdd.name];
                fs.writeFile('./ConfigDatabase.json', JSON.stringify(interaction.client.guildconfigs, null, '\t'), function(err) {
                    if (err) {
                        console.log(err);
                    }
                },
            );
            await interaction.editReply({ content: 'Done!', ephemeral: true });
            return;
        }

            if (interaction.options.getSubcommand() === 'create') {
                const rolemenu = interaction.client.guildconfigs[interaction.guild.id]['roleMenuID'];
                const thisguild = interaction.guild;
                const guildconfig = interaction.client.guildconfigs[thisguild.id];
                if (rolemenu === 0) {
                    const menu = [];
                    Object.keys(guildconfig['roleMap']).forEach(role => {
                        menu.push({
                            'label': role,
                            'description': role,
                            'value': guildconfig['roleMap'][role]['id'],
                        });
                    });
                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setCustomId('rolemenu')
                                .setPlaceholder('Nothing selected')
                                .setMinValues(0)
                                .setMaxValues(menu.length)
                                .addOptions(menu),
                        );
                    console.log('Trying to send role menu...');
                    await interaction.editReply({ content: 'Rolemenu', components: [row] });
                }
            }

    },
};
