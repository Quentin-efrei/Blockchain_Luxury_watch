const { getHash, generateRoleAddress, generateItemAddress, generateProductAddress, generateVehicleAddress } = require('../lib/generateAddress');
const { VEHICLETP, ROLETP, URL } = require('../info');

const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');
const protobuf = require('sawtooth-sdk/protobuf');
const fetch = require('node-fetch');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { TextEncoder } = require('text-encoding/lib/encoding');



class vehicleTraceClient {

  setSigner(role, signerPrivateKey) {
    this.role = role
    const context = createContext('secp256k1');
    const secp256k1pk = Secp256k1PrivateKey.fromHex(signerPrivateKey);
    this.signer = new CryptoFactory(context).newSigner(secp256k1pk);
    this.publicKey = this.signer.getPublicKey().asHex();

  }

  send_data(dataPayload, itemID, supplierName, supplierPublicKey) {
    const roleAddress = generateRoleAddress(this.role, this.publicKey);
    const itemDataAddress = generateItemAddress(itemID, supplierName, supplierPublicKey);
    var inputAddressList = [roleAddress, itemDataAddress];
    var outputAddressList = [itemDataAddress, roleAddress];
    var encode = new TextEncoder('utf8');
    const payloadBytes = encode.encode(dataPayload);
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
      familyName: VEHICLETP["FAMILYNAME"],
      familyVersion: VEHICLETP["FAMILYVERSION"],
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

    console.log("transacction");
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
  async getItem() {
    let stateRequest = 'http://rest-api:8008/state?address=' + getHash("Vehicle Trace", 6) + getHash(ROLES["SUPPLIER"], 4);
    let stateResponse = await fetch(stateRequest);
    let stateJSON = await stateResponse.json();
    return stateJSON;
  }
  




}
module.exports.vehicleTraceClient = vehicleTraceClient;
