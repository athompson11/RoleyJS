const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const emojiMap = require('../emojiCharacters.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll!')
        .addStringOption(option => option.setName('question')
            .setDescription('The question for the poll')
            .setRequired(true))
        .addStringOption(option => option.setName('poll-options')
            .setDescription('The options for the poll (seperate them with commas)').setRequired(true))
        .addBooleanOption(option => option.setName('dm-results')
            .setDescription('If you want to be DM\'d when the results are done')
            .setRequired(true))
        .addIntegerOption(option => option.setName('time')
            .setDescription('The length of the poll, in minutes.')
            .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        const givenQuestion = interaction.options.getString('question');
        const givenOptions = interaction.options.getString('poll-options');
        const dmResults = interaction.options.getBoolean('dm-results');
        const givenTime = interaction.options.getInteger('time');
        let timeReturn = 0;
        if (givenTime == null) {
            timeReturn = 60 * 60000;
        }
        else {
            timeReturn = givenTime * 60000;
        }
        const pollEmbed = new MessageEmbed()
            .setColor('DARK_BUT_NOT_BLACK')
            .setTitle(givenQuestion);
        let Options = givenOptions.split(',');
        Options = Options.map(option => option.trim());
        const optionsMap = {};
        let index = 0;
        let description = '';
        Options.forEach(option => {
            optionsMap[emojiMap[String.fromCharCode(index + 97)]] = option;
            index++;
        });
        console.log(optionsMap);
        Object.entries(optionsMap)
            .forEach(([emoji, option]) => {
                description = description + emoji + ': ' + option + ' ' + '\n';
            });
        pollEmbed.setDescription(description);
        pollEmbed.setTimestamp();
        console.log(dmResults);
        if (dmResults === true) {
            console.log('Do DM.');
            const author = interaction.member;
            const results = {};
            Object.keys(optionsMap).forEach(key => {
                results[key] = 0;
            });
            console.log(results);
            interaction.editReply({
                embeds: [pollEmbed],
                fetchReply: true,
            })
                .then(sentEmbed => {
                    Object.keys(optionsMap).forEach(emoji => sentEmbed.react(emoji));
                },
                );
            const filter = (reaction, user) => {
                return Object.keys(optionsMap).includes(reaction.emoji.name) && !user.bot;
            };
            const embed = await interaction.fetchReply();
            const collector = embed.createReactionCollector({ filter, time: timeReturn });
            collector.on('collect', (reaction, user) => {
                console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
                results[reaction.emoji.name] += 1;
            });
            collector.on('end', collected => {
                let toSend = '```\nResults:\n';
                Object.keys(results).forEach(key => {
                    toSend = toSend.concat(optionsMap[key]);
                    toSend = toSend.concat(': ');
                    toSend = toSend.concat(results[key]);
                    toSend = toSend.concat('\n');
                });
                /* Strip trailing Newline */
                toSend = toSend.substring(0, toSend.length - 1);
                toSend = toSend.concat('```');
                author.send(toSend);
            });
        }
        else {
            console.log('Do not DM.');
            interaction.editReply({
                embeds: [pollEmbed],
                fetchReply: true,
            })
                .then(sentEmbed => {
                    Object.keys(optionsMap).forEach(emoji => sentEmbed.react(emoji));
                },
                );
            return;
        }
    },
};
