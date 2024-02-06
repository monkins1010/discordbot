import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.js';
import { checkDiscordUserExists, setDiscordUsers } from './src/database.js';
import { getdeeplink } from './src/getdeeplink.js';

// Create and configure express app
const app = express();
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', async function (req, res) {
	// Interaction type and data
	const { type, data, member } = req.body;
	/**
	 * Handle slash command requests
	 */
	if (type === InteractionType.PING) {
		return res.send({ type: InteractionResponseType.PONG });
	  }
	if (type === InteractionType.APPLICATION_COMMAND) {
		// Slash command with name of "test"
		if (data.name === 'getid') {

			if (checkDiscordUserExists(member.user.id)) {

				// Send a message as response
				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: 'You have already requested a ValuID.',
						flags: InteractionResponseFlags.EPHEMERAL,
					},
				});
			}

			setDiscordUsers(member.user.id);
			//const deeplinkurl = await getdeeplink();

			const embeddedObject = templateEmbed;

		//	embeddedObject.url = deeplinkurl;


			return res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [exampleEmbed] 
				},
			});
		}
	}
});

async function createCommand() {
	const appId = process.env.APP_ID;

	/**
	 * Globally-scoped slash commands (generally only recommended for production)
	 * See https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
	 */
	const globalEndpoint = `applications/${appId}/commands`;

	/**
	 * Guild-scoped slash commands
	 * See https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
	 */
	// const guildEndpoint = `applications/${appId}/guilds/<your guild id>/commands`;
	const commandBody = {
		name: 'getid',
		description: 'Get a ValuID',
		// chat command (see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types)
		type: 1,
	};

	try {
		// Send HTTP request with bot token
		const res = await DiscordRequest(globalEndpoint, {
			method: 'POST',
			body: commandBody,
		});
		console.log(await res.json());
	} catch (err) {
		console.error('Error installing commands: ', err);
	}
}

app.listen(3000, () => {
	console.log('Listening on port 3000');

	createCommand();
});

const templateEmbed = {
	color: 0x0099ff,
	title: 'Some title',
	url: 'https://discord.js.org',
	author: {
		name: 'ValuID',
		icon_url: 'https://valu.earth/img/logo.png',
		url: 'https://valu.earth',
	},
	description: 'Please click on the link in a mobile device to open the Verus Mobile app and create a ValuID.',
	thumbnail: {
		url: 'https://valu.earth/img/logo.png'
	},
	timestamp: new Date().toISOString(),
	footer: {
		text: 'Sent from Valu',
		icon_url: 'https://valu.earth/img/logo.png',
	},
};

const exampleEmbed = {
	color: 0x0099ff,
	title: 'Your ValuID Link',
	url: 'https://discord.js.org',
	author: {
		name: 'Valu',
		icon_url: 'https://pbs.twimg.com/profile_images/1499065754313887747/_YAZWd_X_400x400.jpg',
		url: 'https://discord.js.org',
	},
	description: 'Please click on the link in a mobile device to open the Verus Mobile app and create a ValuID. This will provision you a .ValuID@',
	thumbnail: {
		url: 'https://pbs.twimg.com/profile_images/1499065754313887747/_YAZWd_X_400x400.jpg',
	},
	timestamp: new Date().toISOString(),
	footer: {
		text: 'Sent from Valu',
		icon_url: 'https://pbs.twimg.com/profile_images/1499065754313887747/_YAZWd_X_400x400.jpg',
	},
};