import Http from '../../utils/Http.js';
import PublicFun from '../../utils/PublicFun.js';
const App = getApp();
Page({
  data: {
    systemInfo:null,
    phone:'',
    carPlate:'暂无车辆信息',
    showModal:false,
    info: App.globalData
  },
  onLoad: function (options) {
    let that = this,
        carInfo = App.globalData.carInfo,
        carPlate = '暂无车辆信息';
    if (carInfo && carInfo instanceof Array && carInfo.length>0){
      carPlate = carInfo[carInfo.length-1].plate 
    }
    that.setData({
      systemInfo : App.globalData.systemInfo,
      phone: App.globalData.phone || '未验证',
      carPlate: carPlate
    })
  },
  onShow(){
    !App.globalData.userId && this.setData({ showModal:true})
  },
  toComplaint(){
    App.globalData.userId && wx.navigateTo({ url: 'complaint/complaint' });
    !App.globalData.userId && this.setData({ showModal: true })
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
      } else {
        PublicFun._showToast('网络错误！');
      }
    }).catch(() => {
      PublicFun._showToast('网络错误！');
    })
  }
  
})