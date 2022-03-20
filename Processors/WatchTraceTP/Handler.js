const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { getHash, generateRoleAddress, generateItemAddress, generateProductAddress, generateVehicleAddress } = require('./generateAddress')
const { VEHICLETP, ROLETP, ROLES } = require('./info')


var encoder = new TextEncoder('utf8')
var decoder = new TextDecoder('utf8')

function writeToStore(context, address, data) {
    let dataBytes = encoder.encode(JSON.stringify(data))
    let entries = {}
    entries[address] = dataBytes
    return context.setState(entries)
}

function readState(context, address) {
    console.log("data address ", address)
    return context.getState([address]).then((stateValue) => {
        let stateData = stateValue[address]
        return stateData
    })
}


function checkRole(context, roleAddress) {
    return readState(context, roleAddress).then((stateData) => {
        if (stateData == '' || stateData == null) {
            console.log("Error ! No such Identity !")
            return false
        }
        else {
            console.log("Identity Approved ! ")
            return true
        }
    })
}


function supplierItemData(context, supplierAddress, supplierPublickey, supplierName, itemName, itemID, DOE) {
    return checkRole(context, supplierAddress)
        .then((isValid) => {
            console.log("Inside CHECKROLE");
            if (isValid == 1) {
                console.log("isValid", isValid)
                let itemAddress = generateItemAddress(itemID, supplierName, supplierPublickey)
                console.log("tp", itemAddress)
                let data =
                {
                    "Supplier": supplierName,
                    "Name Of Item": itemName,
                    "Item ID": itemID,
                    "Date Of Export": DOE,
                    "Approval": "Pending",
                    "Shipped To": []
                }

                return writeToStore(context, itemAddress, data)
            }
        })
}

function manufacturerItemData(context, itemAddress, manufacturerAddress, verdict, pub) {
    return checkRole(context, manufacturerAddress).then((isValid) => {
        if (isValid == 1) {
            return readState(context, itemAddress).then((stateData) => {
                console.log(decoder.decode(stateData), typeof (decoder.decode(stateData)))
                let itemData = JSON.parse(decoder.decode(stateData))
                console.log(itemData)
                itemData["Approval"] = verdict;
                itemData["Shipped To"] = pub;
                context.addEvent("Product/Verify", [
                    ["data", JSON.stringify(itemData)]
                ]);
                var Status = "Item Verification Added";
                context.addReceiptData(Buffer.from("Receipt========>>>>" + Status, "utf8"));
                return writeToStore(context, itemAddress, itemData)
            })
        }

    })
}







class VehicleDataHandler extends TransactionHandler {
    constructor() {
        super(VEHICLETP["FAMILYNAME"], [VEHICLETP["FAMILYVERSION"]], [VEHICLETP["NAMESPACE"]]);
    }

    apply(transactionProcessRequest, context) {
        var payloadString = decoder.decode(transactionProcessRequest.payload);
        let header = transactionProcessRequest.header
        let publicKey = header.signerPublicKey
        let payload = payloadString.split(",")
        let action = payload[0]
        console.log("INSIDE APPLY")


        if (action == "ItemSupplierData") {
            console.log("SUPPLIER HANDLER------------")
            let supplierName = payload[1]
            let itemID = payload[2]
            let itemName = payload[3]
            let DOE = payload[4]

            let supplierAddress = generateRoleAddress("Supplier", publicKey)
            return supplierItemData(context, supplierAddress, publicKey, supplierName, itemName, itemID, DOE)
        }
        else if (action == "ItemManufacturerData") {
            let supplierName = payload[1]
            let itemID = payload[2]
            let supplierPublickey = payload[3]
            let verdict = payload[4]
            let itemAddress = generateItemAddress(itemID, supplierName, supplierPublickey)
            let manufacturerAddress = generateRoleAddress("Manufacturer", publicKey)
            return manufacturerItemData(context, itemAddress, manufacturerAddress, verdict, publicKey)
        }
        else if (action == "ProdManufacturerData") {
            console.log("PRODUCT HANDLER------------")
            let manufacturerName = payload[1]
            let prodID = payload[2]
            let prodName = payload[3]
            let DOM = payload[4]
            let supp = payload[5]
            let name = payload[6]
            let doe = payload[8]
            let dat = supp + ',' + name + ',' + doe + '}';

            console.log("SUUUUUUPPPPPPPP{{{{{{{{" + supp)

            let manufacturerAddress = generateRoleAddress("Manufacturer", publicKey)
            return manufacturerProdData(context, manufacturerAddress, publicKey, manufacturerName, prodName, prodID, DOM, dat)
        }
        else if (action == "ProdDistributerData") {
            let manufacturerName = payload[1]
            let prodID = payload[2]
            let manufacturerPublickey = payload[3]
            let verdict = payload[4]
            let distributerName = payload[5]
            let vehId = payload[6]
            let manu = payload[7]
            let veh = payload[8]
            let dom = payload[10]
            let supp = payload[13]
            let item = payload[14]
            let doe = payload[15]
            let dat = manu + ',' + veh + ',' + dom;
            let dat1 = supp + ',' + item + ',' + doe;
            let distributerAddress = generateRoleAddress("Distributer", publicKey)

            console.log("VEEEEEHHHHHICLEEEEEE{{{{{{{{" + dat + "???????" + dat1)
            let prodAddress = generateProductAddress(prodID, manufacturerName, manufacturerPublickey)
            return distributerProdData(context, prodAddress, distributerAddress, verdict, publicKey, distributerName, vehId, dat, dat1)
        }
        else if (action == "VehDistributerData") {
            console.log("VEHICLE HANDLER------------VEHHHHHH")
            let distributerName = payload[1]
            let vehId = payload[2]
            let manu = payload[3]
            let veh = payload[4]
            let dom = payload[6]
            let supp = payload[9]
            let item = payload[10]
            let doe = payload[11]
            let dat = manu + ',' + veh + ',' + dom;
            let dat1 = supp + ',' + item + ',' + doe;
            console.log("VEEEEEHHHHHICLEEEEEE{{{{{{{{" + dat + "&&&&&" + dat1)

            let distributerAddress = generateRoleAddress("Distributer", publicKey)
            return distributerVehData(context, distributerAddress, publicKey, distributerName, vehId, dat, dat1)
        }
    }
}
module.exports = VehicleDataHandler;