import Http from "../../utils/Http.js";
import PublicFun from "../../utils/PublicFun.js";
const App = getApp();
Page({
  data: {
    cardLists: [],
    Loading: true,
    animationData: "",
    phoneAnimationData:"",
    cardModalShow: false,
    PhoneModalShow:false,
    systemInfo: null,
    showModal:false,
    btnTxt:'获取验证码',
    countdown :60,
    isClickCodeBtn:false,
    phoneTest:{phone:'',code:''},
    cardTest:{cardNum:'',password:''}
  },
  onLoad(options) {
    let that = this;
    that.setData({
      systemInfo: App.globalData.systemInfo
    })
  },
  onShow() {
    let that = this,
        cardLists = that.data.cardLists;
    if(App.globalData.userId){
      if(App.globalData.phone){
        that.seenCardList().then(res => {
          that.setData({
            cardLists: res.data.data,
            Loading: false
          })
        }).catch(() => {
          PublicFun._showToast('网络错误！');
          that.setData({
            Loading: false
          })
        })
      }else{
         that.Phone(that,'open')
      }
    }else{
      that.setData({
        Loading: false,
        showModal:true
      })
    }
  },
  drawCard() {
    let that = this;
    if (!App.globalData.userId){
      that.setData({
        showModal:true
      })
    }else{
      !App.globalData.phone && that.Phone(that, 'open')
      App.globalData.phone && that.Draw(that, "open");
    }   
  },
  closeModal(e) {
    let _id = e.currentTarget.dataset.id,
        that = this;
    _id === 'card' && that.Draw(that, "close");
    _id === 'phone' && that.Phone(that, "close");
    that.setData({ Loading: false });
  },
  formSubmit(e) {
    let that = this,
        cardLists = that.data.cardLists,
        data = e.detail.value;
    if (data.cardnum && data.password){
      that.setData({ Loading: true });
      let info = {
        cardNo: data.cardnum,
        cardPassword: data.password,
        userId: App.globalData.userId
      }
      that.getCard(info).then(res => {
        if (cardLists.length === 0) {
          cardLists = res.data
        } else {
          res.data.map(list => {
            cardLists.unshift(list)
          })
        }
        that.setData({
          Loading: false,
          cardLists: cardLists
        })
        wx.showToast({
          title: '领取成功！',
        })
        that.Draw(that, "close");
      }).catch(res => {
        that.setData({ Loading: false });
        PublicFun._showToast(res.message);
      })
    }else{
      PublicFun._showToast(!data.cardnum ? '卡号不能为空！' : !data.password ? '密码不能为空！' : '卡号、密码不能为空');
      return false
    }
  },
  getCard(info) {
    let promise = new Promise(function (resolve, reject) {
      let get_url = `card/getUserCard`,
        get_params = {
          cardNo: info.cardNo,
          cardPassword: info.cardPassword,
          userId: info.userId
        };
      Http.Get(get_url, get_params, App.globalData.jwtStr).then(res => {
        if (res.code == 200) {
          res.data.map(list => {
            list.periodBeginDate = PublicFun.timeStyle(list.periodBeginDate);
            list.periodEndDate = PublicFun.timeStyle(list.periodEndDate);
          })
          resolve(res)
        } else {
          reject(res)
        }
      }).catch(res => {
        reject(res)
      })
    });
    return promise
  },
  seenCardList() {
    let promise = new Promise(function (resolve, reject) {
      let list_url = `card/getUserCardList`,
        list_params = {
          userId: App.globalData.userId,
          cardStatus: "",
          pageSize: 1000
        };
      Http.Get(list_url, list_params, App.globalData.jwtStr).then(res => {
        if (res.code == 200) {
          if (res.data.data.length > 0) {
            res.data.data.map(list => {
              list.periodBeginDate = PublicFun.timeStyle(list.periodBeginDate);
              list.periodEndDate = PublicFun.timeStyle(list.periodEndDate);
            })
            resolve(res)
          } else {
            resolve(res)
          }
        } else {
          reject(false)
        }
      }).catch(() => {
        reject(false)
      })
    });
    return promise
  },
  Draw(that, currentStatu) {/*动画*/
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.opacity(0).rotateX(-100).step();
    that.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.opacity(1).rotateX(0).step();
      that.setData({
        animationData: animation
      })
      if (currentStatu == "close") {//关闭 
        that.setData({
          cardModalShow: false
        });
      }
    }.bind(this), 200)
    if (currentStatu == "open") {//打开
      that.setData({
        cardModalShow: true
      });
    }
  },
  Phone(that, currentStatu) {/*动画*/
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.opacity(0).rotateX(-100).step();
    that.setData({
      phoneAnimationData: animation.export()
    })
    setTimeout(function () {
      animation.opacity(1).rotateX(0).step();
      that.setData({
        phoneAnimationData: animation
      })
      if (currentStatu == "close") {//关闭 
        that.setData({
          PhoneModalShow: false
        });
      }
    }.bind(this), 200)
    if (currentStatu == "open") {//打开
      that.setData({
        PhoneModalShow: true
      });
    }
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
  _registerUser(Register) {//用户注册
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
        that.seenCardList().then(res => {
          setTimeout(() =>
            that.setData({
              cardLists: res.data.data
            }), 1000)
        }).catch(() => {
          PublicFun._showToast('网络错误！');
        })
      } else {
        PublicFun._showToast('网络错误！');
      }
    }).catch(() => {
      PublicFun._showToast('网络错误！');
    })
  },
  getPhoneCode(){//获取验证码
    let that = this,
      phoneTest = that.data.phoneTest;
    let phoneRexp = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
    !phoneRexp.test(phoneTest.phone) && PublicFun._showToast('手机号格式有误！');
    if (phoneRexp.test(phoneTest.phone)){
      that.setData({ isClickCodeBtn: true })
      that._sendCode(phoneTest.phone);
      that.timer();
    }
  },
  timer(){
    let that = this,
        countdown = that.data.countdown;
    let clock = setInterval(() => {
      countdown--
      if (countdown>=0){
        that.setData({
          countdown: countdown
        })
      }else{
        clearInterval(clock)
        that.setData({
          countdown: 60,
          isClickCodeBtn:false,
          btnTxt:'重新获取'
        })
      }
    }, 1000)
  },
  _sendCode(phoneNum){//发送验证码
    let that = this,
        send_url = 'card/sms/send',
        send_params = { phoneNum: phoneNum };
    that.setData({ Loading: true });
    Http.Get(send_url, send_params, App.globalData.jwtStr).then(res=>{
      if (res.code ==='200'){
        that.setData({ Loading: false });
        PublicFun._showToast('验证码已发送到您的手机！');
      }else{
        that.setData({ Loading: false });
        PublicFun._showToast('网络错误！');
      }
    }).catch(()=>{
      that.setData({ Loading: false });
      PublicFun._showToast('网络错误！');
    })
  },
  formSubmitPhone(){//验证手机号
    let that = this,
      phoneTest = that.data.phoneTest;
    that.setData({ Loading: true });
    let phone_url = 'card/sms/phoneVerification',
        phone_params = {
          userId: App.globalData.userId, 
          phoneNum: phoneTest.phone,
          vCode: phoneTest.code
        };
    Http.Get(phone_url, phone_params, App.globalData.jwtStr).then(res=>{
      if(res.code ==='200'){
        PublicFun._showToast(res.data.msg);
        that.setData({ Loading: false });
        that.Phone(that, 'close');
        App.globalData.phone = phoneTest.phone;
      }else{
        that.setData({ Loading: false });
        PublicFun._showToast(res.data.msg);
      }
    }).catch((res)=>{
      that.setData({ Loading: false });
      PublicFun._showToast(res.data.msg);
    })
  },
  Input(e){
    let _value = e.detail.value,
      _id = e.currentTarget.dataset.id,
      that = this,
      phoneTest = that.data.phoneTest,
      cardTest = that.data.cardTest;
    _id === 'phone' ? phoneTest.phone = _value : 
    _id === 'code' ? phoneTest.code = _value : 
    _id === 'cardnum' ? cardTest.cardNum = _value:
    _id === 'password' ? cardTest.password = _value : '';
    that.setData({
      phoneTest: phoneTest,
      cardTest: cardTest
    })
  },
  move() {}
})