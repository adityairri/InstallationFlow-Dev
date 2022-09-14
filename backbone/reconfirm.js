const fs = require("fs");
var ejs = require("ejs");
var http = require("http");
var axios = require("axios");
var fetch = require("cross-fetch");

module.exports = function () {
  
    app.get("/confirmFarmerReconfirmDate/:orderId", async function (req, res) {
        var req = req.params;
        var reqBody = JSON.stringify({
          schedule:{
            id: parseInt(req.orderId),
            schedulestatus: "FARMER_RECONFIRM",
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
          res.redirect("/reconfirm/0");
        });
        console.log(reqBody);
      });


  
    app.get("/reconfirm/:date/:pageNo", async function (req, res) {
    if (req.params.date == "0") {
      var page = req.params.pageNo;
        var fromDate = new Date(+new Date().setHours(0, 0, 0, 0) + 86400000).toLocaleDateString("fr-CA")  + " 00:00";
        var toDate = fromDate;
        var reqBody = JSON.stringify({
          filter: {
            status: "FARMER_DATE_CONFIRM",
            from_date: fromDate,
            to_date: toDate,
          },
        });
      } else {
        var req = req.params;
        var page = req.pageNo;
        var fromDate = req.date + " 00:00";
        var toDate = fromDate;
        var reqBody = JSON.stringify({
          filter: {
            status: "FARMER_DATE_CONFIRM",
            from_date: fromDate,
            to_date: toDate,
          },
        });
      }
   

    const resp = await fetch(
      "http://45.79.117.26:8000/api/getInstallationSchedule/?page="+parseInt(page)+"",
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
    await resp.json().then(async (data) => {
      data.results.forEach(async (singleInData) => {
        var wooCommerseID = singleInData.order.woo_commerce_order_id;
        var a = await getRemarksList(wooCommerseID);
        // console.log(remarks);
        daata.push({
          remarks: remarks,
          data: singleInData,
        });
      });
      // console.log(daata);
      await getNewOrdersCount();
      
      await getSErescheduledOrders();
      await getSMrescheduledOrders();
      await getFarmerRescheduledOrders();

      await getReadyToInstallCount();
      await getSePendingList();
      await getSeAcceptedList();
      await getSeDeclinedList();
      await getFarmerPendingList();
      await getFarmerAcceptedList();
      await getFarmerDeclinedList();
      await getInstallationPendingList();
      await getInstallationPartialCompleteList();
      await getInstallationCompletedList();
      res.render("reconfirm", {
        data1: daata,

        dataPaginationNext: data.links.next,
        dataPaginationPrevious: data.links.previous,
        dataPaginationPageNo: data.page.page,
        dataPaginationTotalPages: data.page.pages,

        newOrdersCount: newOrdersCount,
        reconfirmOrdersCount: daata.length,
        
        SErescheduledOrders: SErescheduledOrders,
        SMrescheduledOrders: SMrescheduledOrders,
        FarmerRescheduledOrders: FarmerRescheduledOrders,
        totalRescheduleCount: SErescheduledOrders+SMrescheduledOrders+FarmerRescheduledOrders,

        readyToInstallCount: readyToInstallCount,
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

  var newOrdersCount;
  async function getNewOrdersCount(req, res) {
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
      newOrdersCount = data.page.count;
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
    await resp.json().then((data) => {
      FarmerRescheduledOrders = data.page.count;
    });
  }

  var readyToInstallCount;
  async function getReadyToInstallCount(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "FARMER_RECONFIRM"
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
      readyToInstallCount = data.page.count;
    });
  }

  var sePendingList;
  async function getSePendingList(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "ASSIGNED_SE",
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
      sePendingList = data.page.count;
    });
  }

  var seAcceptedList;
  async function getSeAcceptedList(req, res) {
    var reqBody = JSON.stringify({
      filter: {
        status: "SEND_FARMER_CONFIRM",
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
