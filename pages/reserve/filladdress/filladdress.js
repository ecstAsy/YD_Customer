import Promisify from '../../../utils/Promisify.js';
import PublicFun from '../../../utils/PublicFun.js';
const App = getApp();
const Wx_chooseLocation = Promisify(wx.chooseLocation);

Page({
  data: {
   Position:{
     address:'',
     latitude: '', 
     longitude:'',
     name:'',
     detail:''
   }

  },
  chooseLocation(){
    let that = this,
        Position = that.data.Position;
    Wx_chooseLocation().then(res => {
      Position.address = res.address;
      Position.latitude = res.latitude;
      Position.longitude = res.longitude;
      Position.name = res.name;
      that.setData({
        Position: Position
      })
    }).catch(()=>{
      PublicFun._showToast('获取位置失败，请重新选择！')
    })
  },
  formSubmit(e){
    let pages = getCurrentPages(),
        prevPage = pages[pages.length - 2],
        that = this,
        Position = that.data.Position;
    prevPage.setData({
      Position: Position
    })
    wx.navigateBack({
      delta: 1
    })
  },
  addressInput(e){
    let that = this,
      Position = that.data.Position;
    Position.detail = e.detail.value;
    that.setData({
      Position: Position
    })
  }
})

