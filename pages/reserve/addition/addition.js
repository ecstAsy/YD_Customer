import PublicFun from "../../../utils/PublicFun.js";
import Http from "../../../utils/Http.js";
const App = getApp(),
  myDate = new Date();
const _CarInfo = (carInfo) => {
  let userCar = {
    carPlate: '',
    firstRegisterDate: ''
  }
  if (carInfo && carInfo instanceof Array && carInfo.length > 0) {
    if (carInfo[carInfo.length - 1].plate){
      userCar.carPlate = carInfo[carInfo.length - 1].plate;
    }
    if (carInfo[carInfo.length - 1].firstRegisterDate){
      userCar.firstRegisterDate = carInfo[carInfo.length - 1].firstRegisterDate;
    }
  }
  return userCar
}

function formate_data(myDate) {
  let month_add = myDate.getMonth() + 1;
  month_add < 10 ? month_add = '0' + month_add : month_add;
  let date_add = myDate.getDate();
  date_add < 10 ? date_add = '0' + date_add : date_add;
  let formate_result = myDate.getFullYear() + '-'
    + month_add + '-' + date_add;
  return formate_result;
}
Page({
  data: {
    systemInfo: null,
    cardList: [],
    nowTime: formate_data(myDate),
    selectedDate: formate_data(myDate),
    VehicleInitialDate: '',
    store: "",
    Phone:'',
    PhoneNum: true,
    CarNum: true,
    subNum: 0,
    selCards: [],
    cardToast: "",
    carNumber: '',
    serveType: "",
    showModal: false,
    Position: '',
    useCarTime: 0
  },
  showMap() {//查看位置
    let store = this.data.store;
    PublicFun.showMap(store.latitude, store.longitude);
  },
  onLoad(options) {
    let that = this,
      Store = JSON.parse(options.store);
    that.setData({
      systemInfo: App.globalData.systemInfo,
      store: Store,
      serveType: options.serveType,
      carNumber: _CarInfo(App.globalData.carInfo).carPlate,
      VehicleInitialDate: _CarInfo(App.globalData.carInfo).firstRegisterDate,
      Phone: App.globalData.phone || ''
    })
    wx.setNavigationBarTitle({
      title: Store.name
    });
    that.seenCanUseCard();
  },
  lookStore() {//查看门店详情
    let that = this,
      store = that.data.store;
    let storeStr = JSON.stringify(store);
    wx.navigateTo({
      url: `../detail/detail?store=` + storeStr,
    })
  },
  bindDateChange(e) {//选择日期
    let _id = e.currentTarget.dataset.id;
    _id === "reservetime" && this.setData({ selectedDate: e.detail.value });
    _id === "cartime" && this.setData({ VehicleInitialDate: e.detail.value });
  },
  selectCard() {//选择卡券
    let that = this,
      cardList = that.data.cardList,
      selCards = that.data.selCards;
    wx.navigateTo({
      url: `../usecard/usecard?selCards=${JSON.stringify(selCards)}&cardList=${JSON.stringify(cardList)}`
    })
  },
  subNum(e) {//漆面个数输入
    this.setData({
      subNum: e.detail.value || 0
    })
  },
  carNumberInput(e) {//车牌输入
    let that = this,
      carNumber = that.data.carNumber;
    this.setData({
      carNumber: carNumber || "苏"
    })
  },
  inputCarNum(e) {//车牌验证
    let express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    this.setData({
      CarNum: express.test(e.detail.value) ? true : false,
      carNumber: e.detail.value
    })
  },
  inputPhoneNum(e) {//手机号验证
    let Phreg = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/;
    this.setData({
      PhoneNum: Phreg.test(e.detail.value) ? true : false
    })
  },
  formSubmit(e) {
    let form = e.detail.value;
    let that = this,
      // 预约日期
      selectedDate = that.data.selectedDate,
      // 初等日期
      VehicleInitialDate = that.data.VehicleInitialDate,
      // 门店信息
      store = that.data.store,
      // 选择的卡券
      selCards = that.data.selCards,
      // 已有卡券
      cardList = that.data.cardList,
      // 用户ID
      userId = App.globalData.userId,
      // 地址
      Position = that.data.Position,
      // 服务类型
      serverType = that.data.serveType;
    // 钣喷参数验证
    let errorMesc = '';
    if (serverType === '钣喷') {
      if (!form.lacquerNum || form.lacquerNum === 0) {
        errorMesc = '请填写需要修复的漆面数！';
      } else if (!selCards || selCards.length === 0) {
        errorMesc = '请选择使用的卡券！';
      } else if (form.lacquerNum > selCards.length) {
        errorMesc = '一张券只能抵扣一面漆面，请选择足够的卡券；如若您的卡券不足，可减少漆面数，剩余的漆面修复可到店支付增加！';
      }
    } else if (serverType === '年检') {
      if (!Position) {
        errorMesc = '请选择您的地址！';
      } else if (!VehicleInitialDate) {
        errorMesc = '请选择车辆的初登日期！';
      } else if (!selCards || selCards.length === 0) {
        errorMesc = '请选择使用的卡券！';
      }
    }
    if (!form.carPlate) {
      errorMesc = '请填写车牌号，如若是新车，请填写省份+发动机号后六位！';
    } else if (!that.data.CarNum) {
      errorMesc = '请填写正确的车牌号！';
    } else if (!form.name) {
      errorMesc = '请填写您的姓名！';
    } else if (!form.phone) {
      errorMesc = '请填写您的手机号！';
    }else if (!that.data.PhoneNum) {
      errorMesc = '请填写正确的手机号！';
    }
    if (errorMesc) {
      PublicFun._showToast(errorMesc);
      return false;
    }
    let reserve = selectedDate.replace(/-/g, '');
    let registor = VehicleInitialDate.replace(/-/g, '');
    let order_url = `orders`,
      order_params = {
        car: {
          plate: form.carPlate,
        },
        order: {
          ownerId: userId,
          userId: userId,
          serverType: serverType,
          facilitatorId: store.id,
          appointmentTime: reserve,
          linkMan: form.name,
          phone: form.phone,
          remark: form.remark
        },
        couponNos: selCards
      };
    if (serverType === '钣喷') {
      order_params.order.serverTime = form.lacquerNum;
    } else if (serverType === '年检') {
      order_params.car.firstRegisterDate = registor;
      order_params.order.serverTime = '1';
      order_params.order.addressName = Position.name;
      order_params.order.address = `${Position.address}${Position.detail}`;
      order_params.order.latitude = Position.latitude;
      order_params.order.longitude = Position.longitude;
    }
    Http.JsonPost(order_url, order_params, App.globalData.jwtStr).then(res => {
      if (res.code === '200') {
        if (serverType !== '年检') {
          wx.showToast({
            title: '预定成功！',
          })
          App.globalData.showNum = 1
          setTimeout(() => {
            wx.switchTab({
              url: `../../order/order`
            })
          }, 1000)
        } else {
          let useCarTime = formate_data(myDate).replace(/-/g, '') - registor;
          that.setData({
            showModal: true,
            useCarTime: useCarTime
          })
        }
        if (form.carPlate !== _CarInfo(App.globalData.carInfo).carPlate) {
          PublicFun._userInfo(userId, App.globalData.jwtStr)
            .then(res => {
              let info = res[0];
              App.globalData.carInfo = info.carDtos || '';
            }).catch(() => {
              PublicFun._showToast('网络出错')
            })
        }
      } else {
        PublicFun._showToast('网络错误，请重新提交！')
      }
    }).catch(() => {
      PublicFun._showToast('网络错误，请重新提交！')
    })
  },
  seenCanUseCard() { //用户可用卡券
    let that = this,
      serveType = that.data.serveType;
    let card_url = `card/getCanUseCard`,
      card_params = { userId: App.globalData.userId, cardName: serveType === '钣喷' ? '单面喷漆卡' : '年检卡' };
    Http.Get(card_url, card_params, App.globalData.jwtStr).then(res => {
      if (res.code == 200) {
        if (res.data.length > 0) {
          res.data.map(list => {
            list.periodBeginDate = PublicFun.timeStyle(list.periodBeginDate);
            list.periodEndDate = PublicFun.timeStyle(list.periodEndDate);
            list.checked = false;
          })
          that.setData({
            cardList: res.data,
            cardToast: "有" + res.data.length + "张卡券可用"
          })
        } else {
          that.setData({
            cardList: [],
            cardToast: "暂无卡券"
          })
        }
      } else {
        PublicFun._showToast('网络错误！')
      }
    }).catch(() => {
      PublicFun._showToast('网络错误！')
    })
  },
  callWorker() {//拨打电话
    let phone = this.data.store.phone1;
    PublicFun.contactSop(phone);
  },
  preventTouchMove() { },//弹窗防穿透
  onConfirm() {//确定预约
    this.setData({ showModal: false })
    App.globalData.showNum = 1
    wx.switchTab({
      url: `../../order/order`
    })
  },
  selectAddress() {//选择地址
    wx.navigateTo({
      url: `../filladdress/filladdress`,
    })
  }
})