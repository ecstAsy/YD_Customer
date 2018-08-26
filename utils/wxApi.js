function _showMoudle(title, content, cancel) {
  let promise = new Promise(function (resolve, reject) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: cancel,
      success: data => {
        resolve(data)
      },
      fail: data => {
        reject(data)
      }
    })
  });
  return promise
}
function _showLoading(title, mask) {
  let promise = new Promise(function (resolve, reject) {
   wx.showLoading({
     title: title,
     mask: mask,
     success:res=>{
       resolve(res)
     },
     fail:res=>{
       reject(res)
     }
   },1500)
  });
  return promise
}

module.exports={
  _showMoudle: _showMoudle,
  _showLoading: _showLoading
}