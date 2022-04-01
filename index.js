const forge = require('node-forge');
const oauth = require('mastercard-oauth1-signer');
const fs = require("fs");
const axios = require("axios");
const consumerKey = 'NCHpxaZdvybvFDjlVWZBlx3LpBqNyRhBm1eFihGV9359b9c2!4e925bb4de3b40fe8d3bc74255a748cf0000000000000000';


const p12Content = fs.readFileSync('certificate/mpgs_sandbox_key-sandbox.p12', 'binary');
const p12Asn1 = forge.asn1.fromDer(p12Content, false);
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, 'sellMore!');
const keyObj = p12.getBags({
    friendlyName: 'mpgs_sandbox_key',
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag
}).friendlyName[0];
const signingKey = forge.pki.privateKeyToPem(keyObj.key);

const headers = authorizationHeader => {
  return {
    "Authorization": authorizationHeader,
    "Content-Type": "application/json",
    "Accept-version": "v1"
  }
}

const uri = "https://sandbox.api.mastercard.com/merchantenrollments/merchants";
const method = "POST";
const payload = {
  "merchantData": [
    {
      "acquirerBIN": "12356",
      "acquirerCID": "10",
      "acquirerICA": "123",
      "acquirerName": "Test Acquirer",
      "merchantID": "123",
      "merchantName": "Test Merchant",
      "identityCheckExpress": "Y"
    }
  ],
  "processorName": "MPGS",
  "action": "ADD"
};

const authHeader = oauth.getAuthorizationHeader(
  uri,
  method,
  JSON.stringify(payload),
  consumerKey,
  signingKey
);

console.log(authHeader);

console.log(payload);

console.log(headers(authHeader));

var config = {
  method,
  url: 'https://sandbox.api.mastercard.com/merchantenrollments/merchants',
  headers: headers(authHeader),
  data : payload
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error.response.data.Errors);
});




