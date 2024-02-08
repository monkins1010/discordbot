const  { VerusIdInterface, primitives } = require('verusid-ts-client');
const { randomBytes } = require('crypto');
const { I_ADDR_VERSION } = require('verus-typescript-primitives/dist/constants/vdxf.js');
const axios = require('axios');

const VERUS_RPC_NETWORK = process.env.TESTNET == 'true' ? process.env.TESTNET_VERUS_RPC_NETWORK : process.env.MAINNET_VERUS_RPC_NETWORK
const VERUS_RPC_SYSTEM = process.env.TESTNET == 'true' ? "VRSCTEST" : "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV";
const VerusId = new VerusIdInterface(VERUS_RPC_SYSTEM, VERUS_RPC_NETWORK);

function generateChallengeID(len = 20) {
  const buf = randomBytes(len)
  const password = Buffer.from(buf)
  const iaddress = primitives.toBase58Check(password, I_ADDR_VERSION)
  return iaddress
}

const VALUID_IADDRESS = process.env.TESTNET == 'true' ? process.env.TESTNET_VALUID_IADDRESS : process.env.MAINNET_VALUID_IADDRESS
const VALU_LOGIN_IADDRESS = process.env.TESTNET == 'true' ? process.env.TESTNET_VALU_LOGIN_IADDRESS : process.env.MAINNET_VALU_LOGIN_IADDRESS
const PROVISIONING_URL = process.env.TESTNET == 'true' ? process.env.TESTNET_PROVISIONING_URL : process.env.MAINNET_PROVISIONING_URL
const SYSTEM_ID = process.env.TESTNET == 'true' ? "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq" : "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV";
const VALU_LOGIN_WIF = process.env.TESTNET == 'true' ? process.env.TESTNET_VALU_LOGIN_WIF : process.env.MAINNET_VALU_LOGIN_WIF
// PROVISION VALUID DEEPLINK
const getdeeplink = async () => {

  try {
    const challenge_id = generateChallengeID();

    const response = await VerusId.createLoginConsentRequest(
      VALU_LOGIN_IADDRESS,
      new primitives.LoginConsentChallenge({
        challenge_id: challenge_id,
        requested_access: [
          new primitives.RequestedPermission(primitives.IDENTITY_VIEW.vdxfid),
        ],
        redirect_uris: [ new primitives.RedirectUri(
          `${PROVISIONING_URL}/verusidloginnewaccount`, 
          primitives.LOGIN_CONSENT_WEBHOOK_VDXF_KEY.vdxfid
        ),
        ],
        subject: [
          new primitives.Subject(
            SYSTEM_ID,
            primitives.ID_SYSTEMID_VDXF_KEY.vdxfid
          ),
          new primitives.Subject(
            VALUID_IADDRESS,
            primitives.ID_PARENT_VDXF_KEY.vdxfid
          ),
        ],
        provisioning_info: [
          new primitives.ProvisioningInfo(
            `${PROVISIONING_URL}/provisionVerusId`,
            primitives.LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY.vdxfid
          ),
          new primitives.ProvisioningInfo(
            SYSTEM_ID,
            primitives.ID_SYSTEMID_VDXF_KEY.vdxfid
          ),
          new primitives.ProvisioningInfo(
            VALUID_IADDRESS,  //valuID@ testnet
            primitives.ID_PARENT_VDXF_KEY.vdxfid
          ),
        ],
        created_at: Number((Date.now() / 1000).toFixed(0)),
      }),
      VALU_LOGIN_WIF
    );

    return response.toWalletDeeplinkUri();
    
  } catch (e) {
    console.log(e);
  }

};

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


exports.getdeeplink = getdeeplink;
exports.getTinyUrl = getTinyUrl;