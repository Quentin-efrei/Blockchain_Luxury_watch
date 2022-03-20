const { TransactionProcessor } = require('sawtooth-sdk/processor');
const VehicleDataHandler = require('./Handler');
const { URL } = require('./info')
console.log('Connected---------------------------------------------------------------------');
const transactionProcesssor = new TransactionProcessor(URL["VALIDATOR"]);
transactionProcesssor.addHandler(new VehicleDataHandler());
transactionProcesssor.start();