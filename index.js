import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.js';
import { checkDiscordUserExists, setDiscordUsers } from './src/database.js';
import { getdeeplink } from './src/getdeeplink.js';
import axios from 'axios';

// Create and configure express app
const app = express();

const getTinyUrl = async (deepLinkUrl) => {

    try {
        const response = await axios.post('https://api.tinyurl.com/create', {
            url: deepLinkUrl
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.TINYURLTOKEN}`
            }
        });

        // Send the response from the TinyURL service back to the user
        return response.data.data.tiny_url;
    } catch (error) {
        console.error(error);
        throw new Error('Error creating TinyURL');
    }
};
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
			const deeplinkurl = await getdeeplink();
			const tinyurl = await getTinyUrl(deeplinkurl);

			let embeddedObject = templateEmbed(deeplinkurl, tinyurl);

			res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [embeddedObject] 
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

const templateEmbed = (link, tinylink) =>  {
	return {color: 0x0099ff,
	title: 'Your ValuID Link',
	url: tinylink,
	author: {
		name: 'Valu',
		url: 'https://valu.earth',
	},
	description: `Please click on the link in a mobile device to open the Verus Mobile app, or scan the QR code to create a ValuID@`,
	thumbnail: {
		url: 'https://pbs.twimg.com/profile_images/1499065754313887747/_YAZWd_X_400x400.jpg',
	},
	image: {
		url: `https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=${link}`,
	},
	timestamp: new Date().toISOString(),
	footer: {
		text: 'Sent from Valu',
		icon_url: 'https://pbs.twimg.com/profile_images/1499065754313887747/_YAZWd_X_400x400.jpg',
	},
	}
};