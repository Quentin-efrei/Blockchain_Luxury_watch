const { createHash } = require('crypto')
const { VEHICLETP, ROLETP, ROLES } = require('./info')

// file that contain functions to generate address 


// function to generate hash of the given data with the hash length as given

function getHash(data, length = 128) {
    return createHash('sha512').update(data).digest('hex').substring(0, length);
}




// Class : ["Data","Role"]
// Role : ["Manufacturer","Inspector","Distributer"]


// function to generate role based address 
// parameter - 
//     Role - role of the participant 
//     publicKey - his public key 

function generateRoleAddress(Role, publicKey) {
    if (ROLES[Role.toUpperCase()] != undefined) {
        return ROLETP["NAMESPACE"] + getHash(ROLES[Role.toUpperCase()], 4) + getHash(publicKey, 60)
    }
    else {
        console.log("Error ! Given Role Dosent Exist")
    }
}

// function to generate unique address for each drug 
// drugID - id of the drug 
// manufacturerName - name of the MANUFACTURER
// manufacturerPublicKey - publicKey of the MANUFACTURER

function generateItemAddress(itemID, supplierName, supplierPublicKey) {
    return VEHICLETP["NAMESPACE"] + getHash(ROLES["SUPPLIER"], 4) + getHash(supplierName, 4) + getHash(itemID, 6) + getHash(supplierPublicKey, 50)
}

function generateProductAddress(prodID, manufacturerName, manufacturerPublicKey) {
    return VEHICLETP["NAMESPACE"] + getHash(ROLES["MANUFACTURER"], 4) + getHash(manufacturerName, 4) + getHash(prodID, 6) + getHash(manufacturerPublicKey, 50)
}

function generateVehicleAddress(vehID, distributerName, distributerPublicKey) {
    return VEHICLETP["NAMESPACE"] + getHash(ROLES["DISTRIBUTER"], 4) + getHash(vehID, 6) + getHash(distributerName, 4) + getHash(distributerPublicKey, 50)
}



module.exports = {
    getHash,
    generateItemAddress,
    generateProductAddress,
    generateRoleAddress,
    generateVehicleAddress

}
