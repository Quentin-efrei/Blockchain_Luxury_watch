const { getHash, generateRoleAddress } = require('../lib/generateAddress');
const { ROLETP, URL } = require('../info');

const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');
const protobuf = require('sawtooth-sdk/protobuf');
const fetch = require('node-fetch');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding');



class roleClient {
  setAdmin(adminPrivateKey) {
    console.log("ROLE CLIENT ---------------- SET ADMIN")
    const context = createContext('secp256k1');
    const secp256k1pk = Secp256k1PrivateKey.fromHex(adminPrivateKey);
    this.signer = new CryptoFactory(context).newSigner(secp256k1pk);
    this.publicKey = this.signer.getPublicKey().asHex();

  }



  send_data(role, publickey, action) {

    console.log("ROLE CLIENT ---------------- SEND DATA")

    const address = generateRoleAddress(role, publickey);
    var inputAddressList = [address];
    var outputAddressList = [address];
    let payload = [role, publickey, action].join(",");
    var encode = new TextEncoder('utf8');
    const payloadBytes = encode.encode(payload)
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
      familyName: ROLETP["FAMILYNAME"],
      familyVersion: ROLETP["FAMILYVERSION"],
      inputs: inputAddressList,
      outputs: outputAddressList,
      signerPublicKey: this.signer.getPublicKey().asHex(),
      nonce: "" + Math.random(),
      batcherPublicKey: this.signer.getPublicKey().asHex(),
      dependencies: [],
      payloadSha512: getHash(payloadBytes),
    }).finish();

    const transaction = protobuf.Transaction.create({
      header: transactionHeaderBytes,
      headerSignature: this.signer.sign(transactionHeaderBytes),
      payload: payloadBytes
    });

    console.log("transacction")
    const transactions = [transaction];
    const batchHeaderBytes = protobuf.BatchHeader.encode({
      signerPublicKey: this.signer.getPublicKey().asHex(),
      transactionIds: transactions.map((txn) => txn.headerSignature),
    }).finish();

    const batchSignature = this.signer.sign(batchHeaderBytes);
    const batch = protobuf.Batch.create({
      header: batchHeaderBytes,
      headerSignature: batchSignature,
      transactions: transactions,
    });

    const batchListBytes = protobuf.BatchList.encode({
      batches: [batch]
    }).finish();
    console.log("restapi");
    this._send_to_rest_api(batchListBytes);
  }


  async _send_to_rest_api(batchListBytes) {
    if (batchListBytes == null) {
      try {
        var geturl = URL["STATE"] + this.address
        console.log("Getting from: " + geturl);
        let response = await fetch(geturl, {
          method: 'GET',
        })
        let responseJson = await response.json();
        var data = responseJson.data;
        var newdata = new Buffer(data, 'base64').toString();
        return newdata;
      }
      catch (error) {
        console.error(error);
      }
    }
    else {
      console.log("new code");
      try {
        let resp = await fetch(URL["BATCH"], {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: batchListBytes
        })
        console.log("response", resp);
      }
      catch (error) {
        console.log("error in fetch", error);
      }
    }
  }

  DeleteRole(key, id) {

  }

}
module.exports.roleClient = roleClient;
