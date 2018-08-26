import PublicFun from '../../../utils/PublicFun.js';
const App = getApp();
Page({
  data: {
    systemInfo: null,
    store: "",
    BannerUrls: []
  },
  onLoad(options) {
    let that = this,
        BannerUrls = that.data.BannerUrls;
    let Store = JSON.parse(options.store);
    Store.img2 && BannerUrls.push(Store.img2);
    Store.img3 && BannerUrls.push(Store.img3);
    Store.img4 && BannerUrls.push(Store.img4);
    Store.img5 && BannerUrls.push(Store.img5);
    Store.img6 && BannerUrls.push(Store.img6);
    that.setData({
      systemInfo: App.globalData.systemInfo,
      store: Store,
      BannerUrls: BannerUrls
    })
    wx.setNavigationBarTitle({
      title: `关于${Store.name}`
    });
  },
  showMap() {
    let that = this,
        store = that.data.store;
    PublicFun.showMap(store.latitude, store.longitude)
  }
})