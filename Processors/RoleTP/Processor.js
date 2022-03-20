const { TransactionProcessor } = require('sawtooth-sdk/processor');
const RoleHandler = require('./Handler');
const { URL } = require('./info')

const transactionProcesssor = new TransactionProcessor(URL["VALIDATOR"]);
transactionProcesssor.addHandler(new RoleHandler());
transactionProcesssor.start();
