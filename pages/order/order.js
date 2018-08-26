import Http from "../../utils/Http.js";
import PublicFun from "../../utils/PublicFun.js";
const App = getApp();
Page({
  data: {
    NavId: 0,
    systemInfo: null,
    Menus: [
      "全部", "待接单", "待服务", "服务中", "已服务"
    ],
    dataArry: [],
    orderData: [],
    Loading: true,
    showModal:false
  },
  onLoad(options) {
    let that = this;
    that.setData({
      systemInfo: App.globalData.systemInfo
    })
    setTimeout(() => {
      that.setData({
        Loading: false
      })
    }, 1000)
  },
  tabTitle(title) {//动态设置顶部标题
    let that = this;
    wx.setNavigationBarTitle({
      title: `${title}`
    });
    that.setData({
      Loading: false
    });
  },
  changeNav(e) {//点击切换菜单
    let that = this,
      dataArry = that.data.dataArry,
      Menus = that.data.Menus;
    let nav = e.currentTarget.dataset;
    that.setData({
      NavId: `${nav.id}`,
      Loading: true,
      orderData: []
    })
    !App.globalData.userId && that.setData({ showModal: true })
    App.globalData.userId && that.selectOrder(dataArry, nav.id);
    that.tabTitle(Menus[nav.id]);
  },
  switchTab(e) {//滑动切换菜单
    let that = this,
      dataArry = that.data.dataArry,
      Menus = that.data.Menus;
    let tab = e.detail;
    wx.setNavigationBarTitle({
      title: ''
    });
    that.setData({
      NavId: `${tab.current}`,
      Loading: true,
      orderData: []
    });
    !App.globalData.userId && that.setData({ showModal:true})
    App.globalData.userId && that.selectOrder(dataArry, tab.current);
    that.tabTitle(Menus[tab.current]);
  },
  orderScroll(e) {//触碰底部加载
  },
  topScroll(e) {//触碰顶部加载
  },
  getOrderList() {//请求订单列表
    let promise = new Promise(function (resolve, reject) {
      let list_url = `orders`,
        list_params = { userId: App.globalData.userId };
      Http.Get(list_url, list_params, App.globalData.jwtStr).then(res => {
        if (res.code === '200') {
          if (res.data.list.length > 0){
            res.data.list.map(item=>{
              item.appointmentTime = item.appointmentTime?PublicFun.timeStyle(item.appointmentTime):'';
              item.firstRegisterDate = item.firstRegisterDate ? PublicFun.timeStyle(item.firstRegisterDate) : '';
            })
          }
          resolve(res)
        } else {
          reject(false)
        }
      }).catch(() => {
        reject(false)
      })
    });
    return promise
  },
  onShow() {
    let that = this,
        dataArry = that.data.dataArry,
        NavId = that.data.NavId,
        Menus = that.data.Menus,
        userId = App.globalData.userId;
    if (userId){
      if (dataArry.length < 1 || App.globalData.showNum == 1) {
        that.getOrderList().then(res => {
            that.setData({
              dataArry: res.data.list,
              orderData: res.data.list,
              Loading: false
            })
          if (App.globalData.showNum === 1) {
            App.globalData.showNum = 0
          }
        }).catch(() => {
          PublicFun._showToast('网络错误！');
        })
      } else {
        let newOrderList = {};
        dataArry.map(list => {
          newOrderList[list.orderId] = list
        })
        that.getOrderList().then(res => {
          if (res.data.list.length > 0) {
            res.data.list.map(item => {
              if (newOrderList[item.orderId]) {
                newOrderList[item.orderId].orderStatus != item.orderStatus ? newOrderList[item.orderId].orderStatus = item.orderStatus : "";
              } else {
                newOrderList[item.orderId] = item;
                dataArry.unshift(item);
              }
            })
            dataArry.map(list => {
              newOrderList[list.orderId] && newOrderList[list.orderId].orderStatus != list.orderStatus ? list.orderStatus = newOrderList[list.orderId].orderStatus : "";
            })
            that.setData({
              dataArry: dataArry
            })
            that.selectOrder(dataArry, NavId);
          }
        }).catch(() => {
          PublicFun._showToast('网络错误！');
        })
      }
    }else{
      that.setData({
        Loading: false,
        showModal:true
      })
    }
    
  },
  lookOrderList(e) {//查看订单详情
    let orderId = e.currentTarget.dataset.id;
    let that = this,
      dataArry = that.data.dataArry;
     let orderStr = "";
    dataArry.map(list => {
      list.orderId == orderId ? orderStr=JSON.stringify(list) : "";
    })
    wx.navigateTo({
      url: `list/list?detail=${orderStr}`
    })
  },
  selectOrder(dataArry, navId) {//订单类型筛选
    let that = this,
        Menus = that.data.Menus;
    let Data = [];
    if (dataArry.length>0){
      if (navId == 0) {
        Data = dataArry;
      } else {
        let list = dataArry.find(list => list.orderStatus === Menus[navId]);
        if (list){
          Data = [...Data, list]
        }
      }
    }
    that.setData({
      orderData: Data,
      Loading:false
    })
  },
  showMap(e){
    let that = this,  
        orderData = that.data.orderData;
    let _id = e.currentTarget.dataset.id;
    orderData.map(list=>{
      list.orderId == _id ? PublicFun.showMap(list.facilitatorLatitude,list.facilitatorLongitude):null
    })
  },
  onCancel() {
    this.setData({
      showModal: false
    })
  },
  onConfirm(e) {
    let data = e.detail.userInfo,
      that = this;
    that.setData({
      showModal: false
    })
    if (data) {
      let Register = {
        wxName: data.nickName,
        wxOpenid: App.globalData.userOpenId,
        headimgurl: data.avatarUrl
      };
      that._registerUser(Register)
    }
  },
  _registerUser(Register) {
    let login_url = `login/app/registerUser`,
      login_params = {
        wxName: Register.wxName,
        wxOpenid: Register.wxOpenid,
        headimgurl: Register.headimgurl,
        wechatWay: 'ydbpkh'
      };
    Http.JsonPost(login_url, login_params, '').then(res => {
      if (res.code == 200) {
        App.globalData.userId = res.data.userId;
        App.globalData.jwtStr = res.data.jwtStr;
        this.setData({
          showModal: false
        })
        that.getOrderList().then(res => {
          that.setData({
            dataArry: res.data.list,
            orderData: res.data.list
          })
        }).catch(() => {
          PublicFun._showToast('网络错误！');
        })
      } else {
        PublicFun._showToast('网络错误！');
      }
    }).catch(() => {
      PublicFun._showToast('网络错误！');
    })
  }
})