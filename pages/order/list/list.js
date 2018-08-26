import PublicFun from "../../../utils/PublicFun.js";
const App = getApp();
Page({
  data: {
    systemInfo: null,
    orderDetail: [
      { id: 1, name: "漆面个数", detail: "0" },
      { id: 2, name: "预约日期", detail: "0000-00-00" },
      { id: 3, name: "卡券使用", detail: [] },
      { id: 4, name: "车牌号", detail: "XE88888" },
      { id: 5, name: "姓名", detail: "" },
      { id: 6, name: "手机号", detail: "15696966969" },
      { id: 7, name: "备注", detail: "无" },
    ],
    Loading: true,
    orderInfo: ""
  },
  onLoad(options) {
    let that = this,
      orderDetail = that.data.orderDetail,
      storeDetail = that.data.storeDetail,
      position = that.data.position;
    let orderStr = JSON.parse(options.detail);
    orderDetail.map(item => {
      item.id === 2 ? item.detail = orderStr.appointmentTime : item.id === 3 ? item.detail = orderStr.cards : item.id === 4 ? item.detail = orderStr.plate : item.id === 5 ? item.detail = orderStr.linkMan : item.id === 6 ? item.detail = orderStr.phone : "";
    })
    orderStr.serverType === '年检' ? 
      orderDetail[0].name = '车辆初登日期' : orderDetail[0].name = '漆面个数';
    orderStr.serverType === '年检' ?
      orderDetail[0].detail = orderStr.firstRegisterDate : orderDetail[0].detail = orderStr.serverTime;
    orderStr.remark === "" ? orderDetail[6].detail = "无" : orderStr.remark === null ? orderDetail[6].detail = "无" : orderDetail[6].detail = orderStr.remark;
    that.setData({
      systemInfo: App.globalData.systemInfo,
      orderDetail: orderDetail,
      Loading: false,
      orderInfo: orderStr
    })
  },
  concatStore(e) {
    let phone = e.currentTarget.dataset.id;
    PublicFun.contactSop(phone)
  },
  showMap() {
    let that = this,
      orderInfo = that.data.orderInfo;
    PublicFun.showMap(orderInfo.facilitatorLatitude, orderInfo.facilitatorLongitude)
  }
})