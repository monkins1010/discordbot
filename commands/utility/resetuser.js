const { SlashCommandBuilder } = require('discord.js');
const { checkDiscordUserExists, deleteDiscordUser } = require("../../utils/database.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('reset users QR code')
		.addStringOption(option => option.setName('id').setDescription('Discord Users ID').setRequired(true)),
	async execute(interaction) {

		const userId = interaction.user.id;
		if (userId !== '449450021109366795' && userId !== '454786445702463507') {
			return await interaction.reply({ content: "usernot allowed to do that command",  ephemeral: true });
		}
		const {value} = interaction.options.get('id');
		console.log("user to delete: ", value);

		if (checkDiscordUserExists(value)) {
			deleteDiscordUser(value);
			return await interaction.reply({ content: "Deleted user:" + value,  ephemeral: true });
		}
		return await interaction.reply({ content: "User not found: " + value,  ephemeral: true });
	},
};

