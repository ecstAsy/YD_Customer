import Http from '../../utils/Http.js';
import PublicFun from '../../utils/PublicFun.js';
const App = getApp();
Page({
  data: { 
    systemInfo: null,
    Loading: true,
    Reserve: [
      { title: "预约喷漆", id: "钣喷", img:"/images/reserve/spray.png" },
      { title: "我要洗车", id: "洗车", img:"/images/reserve/wash.png" },
      { title: "我要年检", id: "年检", img: "/images/reserve/inspection.png"}
    ],
    showModal:false
  },
  onLoad(options) {
    let that = this;
    that.setData({
      systemInfo: App.globalData.systemInfo
    });
    setTimeout(() => {
      that.setData({
        Loading: false
      });
    }, 500);
  },
  selectReserve(e) {
    let id = e.currentTarget.dataset.id;
    App.globalData.userId && wx.navigateTo({ url: `store/store?type=${id}` });
    !App.globalData.userId && this.setData({ showModal: true });
    !App.globalData.userId && console.log('11')
  },
  onCancel(){
    this.setData({
      showModal: false
    })
  },
  onConfirm(e){
    let data = e.detail.userInfo,
        that = this;
    that.setData({
      showModal: false
    })
    if(data){
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
        App.globalData.userId = res.data.userId || '';
        App.globalData.jwtStr = res.data.jwtStr || '';
        this.setData({
          showModal:false
        })
      } else {
        PublicFun._showToast('网络错误！')
      }
    }).catch(() => {
      PublicFun._showToast('网络错误！')
    })
  }
}) 