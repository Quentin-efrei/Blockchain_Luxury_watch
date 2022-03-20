
const { createHash } = require('crypto')

function getHash(data, length = 128) {
    return createHash('sha512').update(data).digest('hex').substring(0, length);
}

VEHICLETP = {
    "FAMILYNAME": "Vehicle Trace",
    "FAMILYVERSION": "1.0",
    "NAMESPACE": getHash("Vehicle Trace", 6)
}

ROLETP = {
    "FAMILYNAME": "Role",
    "FAMILYVERSION": "1.0",
    "NAMESPACE": getHash("Role", 6)
}

ROLES = {
    "SUPPLIER": "00",
    "MANUFACTURER": "01",
    "DISTRIBUTER": "02"
}



URL = {
    "VALIDATOR": "tcp://validator:4004",
    "STATE": "http://rest-api:8008/state/",
    "BATCH": "http://rest-api:8008/batches"
}
module.exports = {
    VEHICLETP,
    ROLETP,
    ROLES,
    URL
}

