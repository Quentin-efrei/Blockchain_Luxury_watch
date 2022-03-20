// const AdminKey = 'f2a85a63d0d1a219599256720ae60dffd23ca115a06ee4ac4ec39fcb6d5e7387'

const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { generateRoleAddress } = require('../lib/generateAddress');


var express = require('express');
var router = express.Router();
var { roleClient } = require('./roleClient');
var { vehicleTraceClient } = require('./vehicleTraceClient');
var fs = require('fs');

var roleClient = new roleClient();
var vehicleClient = new vehicleTraceClient();

function getPubKey(Key) {
  const context = createContext('secp256k1');
  const secp256k1pk = Secp256k1PrivateKey.fromHex(Key.trim());
  const signer = new CryptoFactory(context).newSigner(secp256k1pk);
  const publicKey = signer.getPublicKey().asHex();
  return (publicKey);
}

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/adminLogin", function (req, res, next) {
  res.render("adminLogin");
});

router.get("/adminView", function (req, res, next) {
  res.render("adminView");
});

router.get("/admin", function (req, res, next) {
  res.render("admin");
});

router.get("/adminDel", function (req, res, next) {
  res.render("adminDel");
});

router.get("/supplier", function (req, res, next) {
  res.render("supplier");
});

router.get("/manufacturer", function (req, res, next) {
  res.render("manufacturer");
});

router.get("/manuVerify", function (req, res, next) {
  res.render("manufacturerVerify");
});

router.get("/manuAdd", function (req, res, next) {
  res.render("manufacturerAdd");
});

router.get("/distributer", function (req, res, next) {
  res.render("distributer");
});

router.get("/disVerify", function (req, res, next) {
  res.render("distributerVerify");
});

router.get("/disSend", function (req, res, next) {
  res.render("distributerSend");
});

router.get("/customer", function (req, res, next) {
  res.render("customerLogin");
});

router.get("/about", function (req, res, next) {
  res.render("about");
});

router.get("/contact", function (req, res, next) {
  res.render("contact");
});


router.post("/adminLogin", async (req, res, next) => {
  let Key = req.body.pri_key;
  console.log("Inside-----------------ADMIN LOGIN")
  roleClient.setAdmin(Key);
  prvKey = Key;
  let isCorrect = 0;
  let msg = "";
  try {
    // roleClient.setAdmin(prvKey);
    isCorrect = 1;
    msg = "You are log as a Royalty Clock staff member";
  } catch (error) {
    msg = "Invalid Key";
  }
  res.send({ privatekey: Key, done: isCorrect, message: msg });
});

router.post("/roles", async (req, res, next) => {
  var user_id_type = req.body.identity_type;
  var user_pub_key = req.body.pri_key;
  var action = "ADD"
  console.log("POST ROLES>>>>>>>>>>>>")
  roleClient.send_data(user_id_type, user_pub_key, action);
  res.send({ message: user_id_type + " is Successfully Added" });
  console.log("messagepostedsucessfully");
  console.log("role admin pubKey: " + user_pub_key);
});

router.post('/supplierItem', (req, res, next) => {
  //console.log("route assets");
  var pri_key_supp = req.body.supp_pri_key;
  var user_id_type = "supplier";
  var supp_name = req.body.name_supp;
  var supplierPublicKey = getPubKey(pri_key_supp);
  var itemID = req.body.item_id;
  var itemName = req.body.item_name;
  var dateofexp = req.body.DOE;
  var dataPayload = "ItemSupplierData" + "," + supp_name + "," + itemID + "," + itemName + "," + dateofexp;

  vehicleClient.setSigner(user_id_type, pri_key_supp);
  vehicleClient.send_data(dataPayload, itemID, supp_name, supplierPublicKey);
  res.send({ message: "Item with id:" + itemID + " is Successfully Added to chain" });
  console.log("messagepostedsucessfully");
  console.log("Supplier pubKey: " + supplierPublicKey);
});

router.post('/manufacturerItem', (req, res, next) => {
  console.log("Inside MAnufacturer Item");

  var pri_key_manufacturer = req.body.Manu_pri_key;
  var pub_key_supplier = req.body.Supp_pub_key
  console.log(pub_key_supplier)
  var user_id_type = "manufacturer";
  var itemID = req.body.item_id;
  var supp_name = req.body.name_supp;
  var verdit = req.body.Manu_verdict;
  var dataPayload = "ItemManufacturerData" + "," + supp_name + "," + itemID + "," + pub_key_supplier + "," + verdit;
  vehicleClient.setSigner(user_id_type, pri_key_manufacturer);
  vehicleClient.send_data(dataPayload, itemID, supp_name, pub_key_supplier);
  res.send({ message: "Item with id:" + itemID + " is Successfully Added to chain" });
  console.log("message posted sucessfully");
});

router.post('/manufacturerProd', async function (req, res, next) {
  console.log("Inside MAnufacturer Product,,,,");
  let itemData = await vehicleClient.getItem()
  var pri_key_manu = req.body.manu_pri_key;
  var user_id_type = "manufacturer";
  var manu_name = req.body.name_manu;
  var manufacturerPublicKey = getPubKey(pri_key_manu);
  var prodID = req.body.prod_id;
  var prodName = req.body.prod_name;
  var dateofman = req.body.DOM;
  let itemDataBuffer = itemData.data
  let itemDataList = []
  for (let itemDetail of itemDataBuffer) {

    itemDataList.push(Buffer.from(itemDetail.data, 'base64').toString())
  }
  console.log(itemDataList)
  var dataPayload = "ProdManufacturerData" + "," + manu_name + "," + prodID + "," + prodName + "," + dateofman + "," + itemDataList;

  console.log("PAYLOAD>>>>>{{{{{{{{" + dataPayload)
  vehicleClient.setSigner(user_id_type, pri_key_manu);
  vehicleClient.send_ProdData(dataPayload, prodID, manu_name, manufacturerPublicKey);
  res.send({ message: "Product with id:" + prodID + " is Successfully Added to chain" });
  console.log("messagepostedsucessfully");
  console.log("Manufacturer pubKey: " + manufacturerPublicKey);
});

router.post('/distributerItem', async function (req, res, next) {
  console.log("Inside distributer Item");

  let prodData = await vehicleClient.getProd()
  var pri_key_distributer = req.body.Dist_pri_key;
  var pub_key_manufacturer = req.body.Manu_pub_key
  console.log(pub_key_manufacturer)
  var user_id_type = "distributer";
  var prodID = req.body.prod_id;
  var distributerPublicKey = getPubKey(pri_key_distributer);
  var manu_name = req.body.name_manu;
  var verdit = req.body.Dist_verdict;
  var id = req.body.veh_Id;
  var dist_name = req.body.name_dist;
  let prodDataBuffer = prodData.data
  let prodDataList = []
  for (let prodDetail of prodDataBuffer) {
    prodDataList.push(Buffer.from(prodDetail.data, 'base64').toString())
  }
  // var dataPayload1 = "VehDistributerData" + ","+ dist_name+ "," + id + "," + prodDataList;
  var dataPayload = "ProdDistributerData" + "," + manu_name + "," + prodID + "," + pub_key_manufacturer + "," + verdit + "," + dist_name + "," + id + "," + prodDataList;
  vehicleClient.setSigner(user_id_type, pri_key_distributer);
  vehicleClient.send_ProdData(dataPayload, prodID, manu_name, pub_key_manufacturer);
  // vehicleClient.send_DistData(dataPayload1,id,dist_name,distributerPublicKey);
  res.send({ message: "Product with id:" + prodID + " is Successfully Added to chain" });
  console.log("message posted sucessfully");
});


router.post('/itemData', async function (req, res, next) {
  //console.log("route assets");
  let itemData = await vehicleClient.getItem()
  let itemDataBuffer = itemData.data
  let itemDataList = []
  for (let itemDetail of itemDataBuffer) {

    itemDataList.push(Buffer.from(itemDetail.data, 'base64').toString())
  }
  res.send(itemDataList);
});

router.post('/prodData', async function (req, res, next) {
  //console.log("route assets");
  let prodData = await vehicleClient.getProd()
  let prodDataBuffer = prodData.data
  let prodDataList = []
  for (let prodDetail of prodDataBuffer) {

    prodDataList.push(Buffer.from(prodDetail.data, 'base64').toString())
  }
  res.send(prodDataList);
});



router.post('/vehicleData', async (req, res) => {
  var veh_id = req.body.id;
  let vehData = await vehicleClient.getData(veh_id)
  let decodedData = Buffer.from(vehData.data, 'base64').toString();
  let vehId = "";
  let distName = "";
  let vehDet = "";
  let suppDet = "";
  vehData.data.forEach(detail => {
    if (!detail.data) return;
    let decodedVeh = Buffer.from(detail.data, 'base64').toString();
    console.log("DATAAAAAAA++++++++" + decodedVeh)
    vehDetails = decodedVeh.split(',');
    distName = vehDetails[0];
    vehId = vehDetails[1];
    manu = vehDetails[2];
    vehName = vehDetails[3];
    dom = vehDetails[4];
    suppName = vehDetails[5];
    item = vehDetails[6];
    doe = vehDetails[7];
    vehDet = vehId + ',' + manu + ',' + vehName + ',' + dom;
    suppDet = suppName + ',' + item + ',' + doe;
  });
  res.send({
    vehId: vehId,
    distName: distName,
    vehDet: vehDet,
    suppDet: suppDet,
  });
});


router.get("/customerView", function (req, res, next) {
  res.render("supplier");
});

router.post("/delete", async function (req, res) {
  let key = req.body.key;
  let id = req.body.id;
  console.log("Data sent to REST API");
  let action = "DeleteRole"
  console.log(action)
  roleClient.send_data(id, key, action);
  res.send({ text: "Data successfully Deleted" });
});

module.exports = router;
