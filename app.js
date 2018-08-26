import Http from 'utils/Http.js';
import Promisify from 'utils/Promisify.js';
import wxApi from 'utils/wxApi.js';
import PublicFun from 'utils/PublicFun.js';
const _Login = Promisify(wx.login);
const _getUserInfo = Promisify(wx.getUserInfo);
const _openSetting = Promisify(wx.openSetting);
App({
  onLaunch() {
    let that = this;
    that._getSystemInfo();
    that._getUserInfo();
    that.AppUpData();
    wx.checkSession({
      success: function () {
      },
      fail: function () {
        wx.login();
      }
    })
  },
  _getUserInfo() {
    let that = this;
    _Login().then(res => {
      if (res.code) {
        let code_url = `login/app/login`,
          code_params = { userId: "", code: res.code, wechatWay:'ydbpkh'  };
        Http.Get(code_url, code_params,'').then(res => {
          if (res.code == 200) {
            if (res.data.userId) {
              that.globalData.userId = res.data.userId || '';
              that.globalData.jwtStr = res.data.jwtStr || '';
              PublicFun._userInfo(res.data.userId, res.data.jwtStr)
                .then(res=>{
                  let info = res[0];
                  that.globalData.phone = info.phone || '';
                  that.globalData.carInfo = info.carDtos || '';
              }).catch(()=>{
                PublicFun._showToast('网络出错!')
              })
            } else {
              that.globalData.userOpenId = res.data.openid || '';
            }
          } else {
            PublicFun._showToast('网络出错!')
          }
        }).catch(() => {
          PublicFun._showToast('网络出错!')
        })
      } else {
        console.log(code)
      }
    }).catch(() => {
      console.log(false)
    })
  },
  _getSystemInfo() {
    let that = this;
    that.globalData.systemInfo.Width = wx.getSystemInfoSync().windowWidth;
    that.globalData.systemInfo.Height = wx.getSystemInfoSync().windowHeight;
    that.globalData.systemInfo.screenHeight = wx.getSystemInfoSync().screenHeight;
  },
  AppUpData(){
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(res=>{
        // 请求完新版本信息的回调
        res.hasUpdate && updateManager.onUpdateReady(()=>{
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: res=>{
              res.confirm && updateManager.applyUpdate()
            }  
          })
        })
        res.hasUpdate && updateManager.onUpdateFailed(()=> {
          // 新的版本下载失败
          wx.showModal({
            title: '已经有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
          })
        })
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  globalData: {
    userId: "",
    jwtStr:"",
    systemInfo: { Width: "", Height: "", screenHeight:"" },
    position: { latitude: "", longitude: "" },
    showNum: 0,
    userOpenId: null,
    CanUse: true,
    phone:"",
    carInfo:""
  }
})