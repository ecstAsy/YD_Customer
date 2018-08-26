import Http from '../utils/Http.js';
import wxApi from '../utils/wxApi.js';
function throttle(fn, gapTime) {/*二次点击问题*/
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }
  let _lastTime = null
  return function () {// 返回新的函数
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)   //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}
function contactSop(phoneNumber) {
  wx.makePhoneCall({
    phoneNumber: phoneNumber
  })
}
function getLineDistance(lat1, lng1, lat2, lng2) {//lat经度 lng纬度
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  var s = s.toFixed(2) //得出距离
  return s
}
function _getLocation() {
  let promise = new Promise(function (resolve, reject) {
    wx.getLocation({
      success: res => {
        resolve(res)
      },
      fail: res => {
        reject(res.data)
      }
    })
  });
  return promise
}
function timeStyle(data){
  return  data.substring(0, 4) + "." + data.substring(4, 6) + "." + data.substring(6, 8)   
}
function showMap(latitude, longitude){
  wx.openLocation({
    latitude: latitude,
    longitude: longitude
  })
}
function _showToast(title) {
  wx.showToast({
    icon: "none",
    title: title
  })
}
function _userInfo(userId, jwtStr) {
  let promise = new Promise(function (resolve, reject) {
    let info_url = 'user',
      info_params = {
        userId: userId
      };
      let data;
    Http.Get(info_url, info_params, jwtStr).then(res => {
      if (res.code == '200') {
       resolve(res.data.data)
      } else {
        reject(false)
      }
    }).catch(() => {
      reject(false)
    })
  });
  return promise
}
module.exports ={
  throttle,
  contactSop,
  timeStyle,
  getLineDistance,
  _getLocation,
  showMap,
  _showToast,
  _userInfo
}