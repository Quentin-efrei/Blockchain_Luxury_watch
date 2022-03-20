const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
var encoder = new TextEncoder('utf8')
var decoder = new TextDecoder('utf8')

const { ROLETP } = require('./info')
const { generateRoleAddress } = require('./generateAddress')



// This TP is used to create role based state address for
// various participant in the network . each participant should submit there 
// role address with their transaction and the transaction can only Be commited if the 
// role address is valid and invoked 

// function to write data to state 
// parameter :
//     context - the context object passed by sawtooth
//     address - address of the state  
//     msg - msg to be written
// returns a promise object


function writeToStore(context, address, msg) {
    let msgBytes = encoder.encode(msg);
    let entries = {
        [address]: msgBytes
    }
    return context.setState(entries);
}
function deleteState(context, address) {
    return context.deleteState([address])
}
class RoleHandler extends TransactionHandler {
    constructor() {
        super(ROLETP["FAMILYNAME"], [ROLETP['FAMILYVERSION']], [ROLETP['NAMESPACE']]);
    }

    apply(transactionProcessRequest, context) {
        let roleInvoked = 1
        var payloadString = decoder.decode(transactionProcessRequest.payload);
        var payload = payloadString.split(",")
        let role = payload[0]
        let publickey = payload[1]
        let action = payload[2]
        console.log("ROLE______" + role + "PUBKEY________" + publickey)
        let address = generateRoleAddress(role, publickey)
        if (action == "DeleteRole") {
            return deleteState(context, address)
        }
        return writeToStore(context, address, roleInvoked);
    }
}
module.exports = RoleHandler;