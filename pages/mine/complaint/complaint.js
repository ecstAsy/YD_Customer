import PublicFun from '../../../utils/PublicFun.js';
import Http from '../../../utils/Http.js';
const App = getApp();

Page({
  data: {
    systemInfo: null,
    txtNum:500,
    Loading:false
  },
  onLoad(options) {
    let that = this;
    that.setData({
      systemInfo: App.globalData.systemInfo
    })
  },
  complaintInput(e){
    let that = this,
        txt = e.detail.value;
    that.setData({
      txtNum:500-txt.length
    })
  },
  formSubmit(e){
    let that = this,
        form = e.detail.value;
    
    let complaint = form.complaint.trim();
    if (complaint.length==0){
      PublicFun._showToast('请输入内容！')
      return false
    }
    that.setData({
      Loading:true
    })
    let complaint_url = 'complaint',
      complaint_params = { 
        content: complaint, 
        userId: App.globalData.userId
      };
    Http.JsonPost(complaint_url, complaint_params, App.globalData.jwtStr)
        .then(res=>{
           if(res.code==='200'){
             that.setData({
               Loading: false
             })
             PublicFun._showToast('感谢您的支持，谢谢！')
             setTimeout(()=>{
               wx.navigateBack({
                 delta: 1
               })
             },1500)
           }else{
             that.setData({
               Loading: false
             })
             PublicFun._showToast('网络错误，请重新提交！')
           }
        }).catch(()=>{
          that.setData({
            Loading: false
          })
          PublicFun._showToast('网络错误，请重新提交！')
        })
  }
})