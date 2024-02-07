const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder  } = require('discord.js');
const { getdeeplink, getTinyUrl } = require("../../utils/getdeeplink.js")
const { checkDiscordUserExists, setDiscordUsers } = require("../../utils/database.js")
const wait = require('node:timers/promises').setTimeout;
const qr = require('qr-image');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getid')
		.setDescription('Get a ValuID'),
	async execute(interaction) {

		if (checkDiscordUserExists(interaction.user.id)) {
			return await interaction.reply({ content: "You have already requested a ValuID.",  ephemeral: true });
		}
		
		await interaction.deferReply({ ephemeral: true });
		const deeplinkurl = await getdeeplink();
		const tinyurl = await getTinyUrl(deeplinkurl);
		var qr_png = qr.image(deeplinkurl, { type: 'png' });
		const pngname = `${interaction.user.id}qr_code.png`;
		await qr_png.pipe(fs.createWriteStream("./public/" + pngname));
		await wait(2_000);
		const file = new AttachmentBuilder("./public/" + pngname);
		
		await interaction.editReply({ embeds: [templateEmbed(pngname, tinyurl)], files: [file] });
		setDiscordUsers(interaction.user.id);
	},
};

const templateEmbed = (pngname, tinylink) => {
	return new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Your ValuID Link')
	.setURL(tinylink)
	.setAuthor({ name: 'Valu', iconURL: 'https://pbs.twimg.com/profile_images/1499065754313887747/_YAZWd_X_400x400.jpg', url: 'https://valu.earth' })
	.setDescription('Please click on the link in a mobile device to open the Verus Mobile app, or scan the QR code to create a ValuID@')
	.setThumbnail('https://pbs.twimg.com/profile_images/1499065754313887747/_YAZWd_X_400x400.jpg')
	.setImage(`attachment://${pngname}`)
	.setTimestamp()
	.setFooter({ text: 'Sent from Valu', iconURL: 'https://pbs.twimg.com/profile_images/1499065754313887747/_YAZWd_X_400x400.jpg' })
};