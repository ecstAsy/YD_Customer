import Http from '../../../utils/Http.js';
import wxApi from '../../../utils/wxApi.js';
import PublicFun from '../../../utils/PublicFun.js';
import Promisify from '../../../utils/Promisify.js';
import Qrcode from '../../../utils/qrcode.js';
const _getLocation = Promisify(wx.getLocation);
const _openSetting = Promisify(wx.openSetting);
const App = getApp();
Page({
  data: {
    systemInfo: null,
    Loading: true,
    Store: [],
    serveType:"",
    distance:"<500m",
    imagePath: "",
    userCardSum: 0,
    validNum: 0
  },
  
  onLoad(options) {
    let that = this;
    that.setData({
      systemInfo: App.globalData.systemInfo,
      serveType:options.type
    })
    if (options.type==='洗车'){
      that._getUserCardInfo(App.globalData.userId).then(res=>{
        that.setData({
          userCardSum: res.data.sumUnused,
          validNum: res.data.validNum
        })
        that._getQrcode(res.data.xcCode);
      }).catch(()=>{
        PublicFun._showToast('网络错误！');
      })
    }
    wx.setNavigationBarTitle({
      title: "服务商家列表"
    });
    that._getLocation();
  },
  _getQrcode(Qrcode){
    let size = this.setCanvasSize();
    this.createQrCode(Qrcode, "mycanvas", size.w, size.h);
  },
  _getStoreList(data){
    let that = this,
        serveType = that.data.serveType;
    let list_url = `providers`,
      list_params = { isDeleted: 0, category: serveType };
    Http.Get(list_url, list_params, App.globalData.jwtStr).then(res => {
      if (res.code ==200) {
        if (res.data.list.length > 0) {
          res.data.list.map(item => {
            item.distance = PublicFun.getLineDistance(data.latitude, data.longitude, item.latitude, item.longitude);
            if (item.beginTime && item.endTime) {
              item.beginTime = item.beginTime.substring(0, 2) + ":" + item.beginTime.substring(2, 4);
              item.endTime = item.endTime.substring(0, 2) + ":" + item.endTime.substring(2, 4);
            }
          })
          res.data.list.sort(that.compare);
          that.setData({
            Store: res.data.list,
          })
        } else {
          PublicFun._showToast('暂无商家！');
        }
      } else {
        PublicFun._showToast('网络出错！');
      }
    }).catch(() => {
      PublicFun._showToast('网络出错！');
    })
    that.setData({ Loading: false })
  },
  _getUserCardInfo(userId){
    let promise = new Promise(function (resolve, reject) {
      let cardInfo_url = `card/getUserXcCode`,
          cardInfo_params = {
            userId: userId
          }
      Http.Get(cardInfo_url, cardInfo_params, App.globalData.jwtStr)
          .then (res=>{
            if(res.code==200){
              resolve(res)
            }else{
              reject(false)
            }
          }).catch(()=>{
            reject(false)
          })
    })
    return promise
  },
  compare(obj1, obj2) {
    let val1 = obj1.distance*100,
        val2 = obj2.distance*100;
    let rap = val1 < val2 ? -1 : val1 > val2 ? 1 : 0;
    return rap
  },
  _getLocation(){
    let that = this;
   wx.getLocation({
     success: res=> {
       that._getStoreList(res);
     },
     fail:res=>{
       let title = '提示',
          content = '该小程序需要获取您的位置信息才能更好为您服务！',
          cancel = true;
        wxApi._showMoudle(title, content, cancel).then(res=>{
          if (res.confirm){
                _openSetting().then(data => {
              if (!data.authSetting['scope.userLocation']) {
                that._getLocation();
              } else {
                that._getLocation();
              }
            })
          }else{
          let title = '警告',
              content = '该小程序需要获取您的位置信息，请到小程序的设置中打开用户授权！',
              cancel = false;
            wxApi._showMoudle(title, content, cancel).then(res=>{
              if (res.confirm){
                _openSetting().then(data => {
                  if (!data.authSetting['scope.userLocation']) {
                    that._getLocation();
                  } else {
                    that._getLocation();
                  }
                })
              }
            })
          }
        })
     }
   })
  },
  storeDetail(e) {
    let that = this,
        Store = that.data.Store,
        serveType = that.data.serveType,
        List = e.currentTarget.dataset,
        storeStr = JSON.stringify(Store[List.id]);
    wx.navigateTo({
      url: serveType !== '洗车' ? 
           `../addition/addition?store=${storeStr}&serveType=${serveType}` 
           : 
           `../detail/detail?store=${storeStr}`
    })
  },
  showMap(e){
    let that = this,
        Store = that.data.Store;
    let _id = e.currentTarget.dataset.id;
    PublicFun.showMap(Store[_id].latitude, Store[_id].longitude);
  },
  setCanvasSize: function () {
    const size = {};
    try {
      const res = wx.getSystemInfoSync();
      const width = res.windowWidth
      const height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  canvasToTempImage: function () {
    const that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        const tempFilePath = res.tempFilePath;
        that.setData({
          imagePath: tempFilePath
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    Qrcode.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(); }, 1000);

  },
  previewImg: function (e) {
    var img = this.data.imagePath;
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },
  callWorker(e) {
    let phone = e.currentTarget.dataset.id;
    PublicFun.contactSop(phone);
  }
})