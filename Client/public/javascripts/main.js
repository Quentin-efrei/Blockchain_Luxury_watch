// const AdminKey = 'f2a85a63d0d1a219599256720ae60dffd23ca115a06ee4ac4ec39fcb6d5e7387'

function login_roleAdmin(event) {
  console.log("Login as Role Admin");
  event.preventDefault();
  const p_key = document.getElementById("login_id").value;
  if (p_key === 'f2a85a63d0d1a219599256720ae60dffd23ca115a06ee4ac4ec39fcb6d5e7387') {
    $.post(
      "/adminLogin",
      { pri_key: p_key.trim() },
      (data, textStatus, jqXHR) => {
        if (data.done == 1) {
          sessionStorage.clear();
          sessionStorage.setItem("privatekey", data.privatekey);
          alert(data.message);
          window.location.href = "/admin";
        } else {
          alert("UnSuccessful Login");
          window.location.href = "/";
        }
      },
      "json"
    );
  }
  else {
    sessionStorage.clear();
    console.log("enter a valid private key");
    alert("Enter a valid private key");
  }
}

function logout(event) {
  event.preventDefault();
  sessionStorage.clear();
  window.location.href = "/";
}

function add_role(event) {
  console.log("Creating or Updating role");
  event.preventDefault();

  const pri_key_role_admin = document.getElementById("priv_key_roleAdmin").value;
  const id_type = document.getElementById("id_type").value;
  if (pri_key_role_admin != "" && id_type != "") {
    $.post(
      "/roles",
      {
        pri_key: pri_key_role_admin,
        identity_type: id_type
      },
      (data, textStatus, jqXHR) => {
        alert(data.message);
      },
      "json"
    );
    console.log("data posted sucessfully");
  } else {
    console.log("incomplete data");
    alert("Incomplete Data");
  }
}

function addItem(event) {
  console.log("adding SUPPLY Item to the chain");
  event.preventDefault();

  const pri_key = document.getElementById("priv_key").value;
  const item_Id = document.getElementById("item_id").value;
  const itemName = document.getElementById("item_name").value;
  const supp_name = document.getElementById("supp_name").value;
  const dateof_export = document.getElementById("doe").value;
  if (
    pri_key != "" &&
    item_Id != "" &&
    itemName != "" &&
    supp_name != "" &&
    dateof_export != ""
  ) {
    $.post(
      "/supplierItem",
      {
        supp_pri_key: pri_key,
        item_id: item_Id,
        item_name: itemName,
        name_supp: supp_name,
        DOE: dateof_export
      },
      (data, textStatus, jqXHR) => {
        alert(data.message);
      },
      "json"
    );
    //document.getElementById('roleform').reset();
    console.log("data posted sucessfully");
  } else {
    console.log("incomplete data");
  }
}


function verifyItem(event) {
  console.log("adding new medicine to the chain");
  event.preventDefault();
  let rowID = "tr" + event.srcElement.id
  let keyID = "verify_key" + event.srcElement.id
  let Row = document.getElementById(rowID)
  var Cells = Row.getElementsByTagName("td");
  const pub_key = document.getElementById(keyID).value
  console.log("PK____", pub_key)
  const pri_key_manu = document.getElementById("priv_key_manu").value;
  const item_Id_manu = Cells[0].innerText
  const supp_name = Cells[2].innerText
  const verdict = "Verified"
  console.log(pri_key_manu, item_Id_manu, supp_name, verdict)
  if (
    pub_key != "" &&
    pri_key_manu != "" &&
    item_Id_manu != "" &&
    supp_name != "" &&
    verdict != ""
  ) {
    console.log("INSIDE IF")
    $.post(
      "/manufacturerItem",
      {
        Manu_pri_key: pri_key_manu,
        item_id: item_Id_manu,
        name_supp: supp_name,
        Manu_verdict: verdict,
        Supp_pub_key: pub_key
      },
      (data, textStatus, jqXHR) => {
        alert(data.message);
      },
      "json"
    );
    //document.getElementById('roleform').reset();
    console.log("data posted sucessfully");
  } else {
    console.log("incomplete data");
  }
}


function getItemData(event, action = "general") {
  event.preventDefault();
  $.post(
    "/itemData",
    (data, textStatus, jqXHR) => {
      let tablerow = ""
      let actionButton = ""
      for (let i = 0; i < data.length; i++) {
        let ItemData = JSON.parse(data[i])
        if (action == "general") {
          tablerow = '<tr id = tr' + i + '>' + '<td>' + ItemData["Item ID"] + '</td>' + '<td>' + ItemData["Name Of Item"] + '</td>' + '<td>' + ItemData["Supplier"] + '</td>' + '<td>' + ItemData["Date Of Export"] + '</td>' + '<td>' + ItemData["Shipped To"] + '</td>' + '<td>' + ItemData["Approval"] + '</td>' + '</tr>'
        } else if (action == "manufacturer") {
          actionButton = "<td><form><input type='text' id = verify_key" + i + " placeholder='Supplier Public Key'><button id = " + i + " type=\"submit\" name = \"verifyBtn\" style=\" align:center\" class=\"btn login\" onClick=verifyItem(event)> Verify Product</button></form></td>"
          tablerow = '<tr id = tr' + i + '>' + '<td>' + ItemData["Item ID"] + '</td>' + '<td>' + ItemData["Name Of Item"] + '</td>' + '<td>' + ItemData["Supplier"] + '</td>' + '<td>' + ItemData["Approval"] + '</td>' + actionButton + '</tr>'
        }
        $('#assetDetails tr:last').after(tablerow);
      }
    },
    "json"
  );
  //document.getElementById('roleform').reset();
  console.log("data posted sucessfully");
}

function viewData(event) {
  event.preventDefault();
  console.log("View the FINAL Data");
  const vehId = document.getElementById("vehicle_id").value;
  if (vehId != "") {
    $.post(
      "/vehicleData",
      { id: vehId },
      (data, textStatus, jqXHR) => {
        // alert(data.message);
        document.getElementById("vehId").value = data.vehId;
        document.getElementById("distName").value = data.distName;
        document.getElementById("vehDet").value = data.vehDet;
        document.getElementById("suppDet").value = data.suppDet;
      },
      "json"
    );
    console.log("data posted sucessfully");
  } else {
    alert("Enter Vehicle ID");
  }
}

