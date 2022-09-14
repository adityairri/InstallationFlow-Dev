const fs = require("fs");
var ejs = require("ejs");
var http = require("http");
var axios = require("axios");
var fetch = require("cross-fetch");

module.exports = function () {
  app.get("/assignSE/:orderID/:SEid", async function (req, res) {
    var req = req.params;
    var reqBody = JSON.stringify({
      schedule:{
        id: parseInt(req.orderID),
        service_engineer: req.SEid,
        schedulestatus: "ASSIGNED_SE",
      }
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/updateInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );

    await resp.json().then((data) => {
      console.log(data);
      res.redirect("/readyForInstallation/0");
    });
    console.log(reqBody);
  });



  app.get("/reschedule/:orderID", async function (req, res) {
    var req = req.params;
    var reqBody = JSON.stringify({
      schedule:{
        id: parseInt(req.orderID),
        schedulestatus: "SM_RESCHEDULE",
      }
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/updateInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );

    await resp.json().then((data) => {
      console.log(data);
      res.redirect("/readyForInstallation/0");
    });
    console.log(reqBody);
  });






  app.get("/cancelledSEreschedule/:orderID", async function (req, res) {
    var req = req.params;
    var reqBody = JSON.stringify({
      schedule:{
        id: parseInt(req.orderID),
        schedulestatus: "CANCELLED_SE_RESCHEDULE",
      }
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/updateInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );

    await resp.json().then((data) => {
      console.log(data);
      res.redirect("/seResponseStatus/0/declined");
    });
    console.log(reqBody);
  });



  app.get("/seResponseStatus/:SEid/:status", async function (req, res) {
    console.log(req.params);
    if (req.params.status == "pending"){
      var variables = {
        "tableTitle": "PENDING",
        "navBarHighlight1": "background-color: #E9E9E9; color: #555555;",
        "navBarHighlight2": "",
        "navBarHighlight3": ""
      };
      if (req.params.SEid == "0") {
        var reqBody = JSON.stringify({
          filter: {
            status: "ASSIGNED_SE",
          },
        });
      } else {
        var req = req.params;
        var reqBody = JSON.stringify({
          filter: {
            status: "ASSIGNED_SE",
            service_engineer: req.SEid,
          },
        });
      }
    }
    if (req.params.status == "accepted"){
      var variables = {
        "tableTitle": "ACCEPTED",
        "navBarHighlight1": "",
        "navBarHighlight2": "background-color: #E9E9E9; color: #555555;",
        "navBarHighlight3": ""
      };
      if (req.params.SEid == "0") {
        var reqBody = JSON.stringify({
          filter: {
            status: "SEND_FARMER_CONFIRM",
          },
        });
      } else {
        var req = req.params;
        var reqBody = JSON.stringify({
          filter: {
            status: "SEND_FARMER_CONFIRM",
            service_engineer: req.SEid,
          },
        });
      }
    }
    if (req.params.status == "declined"){
      var variables = {
        "tableTitle": "DECLINED",
        "navBarHighlight1": "",
        "navBarHighlight2": "",
        "navBarHighlight3": "background-color: #E9E9E9; color: #555555;"
      };
      if (req.params.SEid == "0") {
        var reqBody = JSON.stringify({
          filter: {
            status: "CANCELLED_SE",
          },
        });
      } else {
        var req = req.params;
        var reqBody = JSON.stringify({
          filter: {
            status: "CANCELLED_SE",
            service_engineer: req.SEid,
          },
        });
      }
    }
    
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    resp.json().then(async (data) => {
      console.log(data);
      await getDateUnassignedCount();
      await getReconfirmOrdersCount();
      
      await getSErescheduledOrders();
      await getSMrescheduledOrders();
      await getFarmerRescheduledOrders();

      await getDateAssignedCount();
      await getSEList();
      await getSePendingList();
      await getSeAcceptedList();
      await getSeDeclinedList();
      await getFarmerPendingList();
      await getFarmerAcceptedList();
      await getFarmerDeclinedList();
      await getInstallationPendingList();
      await getInstallationPartialCompleteList();
      await getInstallationCompletedList();
      res.render("seResponseStatus", {
        data1: data.results,
        variables: variables,
        dateUnassignedCount: dateUnassignedCount,
        reconfirmOrdersCount: reconfirmOrdersCount,
        
        SErescheduledOrders: SErescheduledOrders,
        SMrescheduledOrders: SMrescheduledOrders,
        FarmerRescheduledOrders: FarmerRescheduledOrders,
        totalRescheduleCount: SErescheduledOrders+SMrescheduledOrders+FarmerRescheduledOrders,

        dateAssignedCount: dateAssignedCount,
        seList: SElist,
        sePendingList: sePendingList,
        seAcceptedList: seAcceptedList,
        seDeclinedList: seDeclinedList,
        farmerPendingList: farmerPendingList,
        farmerAcceptedList: farmerAcceptedList,
        farmerDeclinedList: farmerDeclinedList,
        installationPendingList: installationPendingList,
        installationPartialCompleteList: installationPartialCompleteList,
        installationCompletedList: installationCompletedList
      });
    });
  });



  var SElist;
  async function getSEList(req, res) {
    const resp = await fetch(
      "http://45.79.117.26:8000/api/general/serviceengineers/",
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((dataa) => {
      console.log(dataa);
      SElist = dataa;
    });
  }



  var reconfirmOrdersCount;
  async function getReconfirmOrdersCount(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "FARMER_DATE_CONFIRM",
      },
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      reconfirmOrdersCount = data.page.count;
    });
  }


  var SErescheduledOrders;
  async function getSErescheduledOrders(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "CANCELLED_SE_RESCHEDULE",
      },
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    var daata = [];
    await resp.json().then((data) => {
      SErescheduledOrders = data.page.count;
    });
  }

  var SMrescheduledOrders;
  async function getSMrescheduledOrders(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "SM_RESCHEDULE",
      },
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    var daata = [];
    await resp.json().then((data) => {
      SMrescheduledOrders = data.page.count;
    });
  }

  var FarmerRescheduledOrders;
  async function getFarmerRescheduledOrders(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "FARMER_FINAL_CANCEL",
      },
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    var daata = [];
    await resp.json().then((data) => {
      FarmerRescheduledOrders = data.page.count;
    });
  }

  var sePendingList;
  async function getSePendingList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"ASSIGNED_SE"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      sePendingList = data.page.count;
    });
  }


  var seAcceptedList;
  async function getSeAcceptedList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"SEND_FARMER_CONFIRM"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      seAcceptedList = data.page.count;
    });
  }


  var seDeclinedList;
  async function getSeDeclinedList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"CANCELLED_SE"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      seDeclinedList = data.page.count;
    });
  }


  // -------------------------------------------- Counts Functions----------------------------------
  var dateUnassignedCount;
  async function getDateUnassignedCount(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "NEW_ORDER",
      },
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      dateUnassignedCount = data.page.count;
    });
  }

  var dateAssignedCount;
  async function getDateAssignedCount(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "FARMER_RECONFIRM",
      },
    });
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      dateAssignedCount = data.page.count;
    });
  }

  var farmerPendingList;
  async function getFarmerPendingList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"SEND_FARMER_CONFIRM"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      farmerPendingList = data.page.count;
    });
  }

  var farmerAcceptedList;
  async function getFarmerAcceptedList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"FARMER_FINAl_CONFIRM"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      farmerAcceptedList = data.page.count;
    });
  }

  var farmerDeclinedList;
  async function getFarmerDeclinedList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"FARMER_FINAL_CANCEL"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      farmerDeclinedList = data.page.count;
    });
  }

  var installationPendingList;
  async function getInstallationPendingList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"SE_ATTENDED"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      installationPendingList = data.page.count;
    });
  }

  var installationPartialCompleteList;
  async function getInstallationPartialCompleteList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"PARTIAL_COMPLETED"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      installationPartialCompleteList = data.page.count;
    });
  }

  var installationCompletedList;
  async function getInstallationCompletedList(req, res) {
    var reqBody=JSON.stringify({
      "filter" :{
          "status" :"COMPLETED"
      }
      
  })
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/",
      {
        method: "post",
        body: reqBody,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((data) => {
      installationCompletedList = data.page.count;
    });
  }

  var remarks = [];
  async function getRemarksList(req, res) {
    var req = req;
    const resp = await fetch(
      "http://45.79.117.26:8000/api/getremarksfororder/"+req+"",
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token 4861d9484816c25e94be97410fd9f1ffa0b0c1fd",
        },
      }
    );
    await resp.json().then((dataa) => {
    
      remarks = dataa;
    });
  }
};
