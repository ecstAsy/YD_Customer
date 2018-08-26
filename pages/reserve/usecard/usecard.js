import PublicFun from "../../../utils/PublicFun.js";
Page({
  data: {
    MoudleShow: false,
    LoadingShow: false,
    cardLists: [],
    animationData: "",
    selCard: []
  },
  onLoad(options) {
    let that = this;
    let selCard = JSON.parse(options.selCards);
    let cardList = JSON.parse(options.cardList);
    Array.prototype.in_array = function (e) {
      var r = new RegExp(',' + e + ',');
      return (r.test(',' + this.join(this.S) + ','));
    };
    if (selCard.length == 0) {
      that.setData({
        cardLists: cardList
      })
    } else {
      cardList.map(list => {
        selCard.in_array(list.id) ? list.checked = true : ""
      })
      that.setData({
        cardLists: cardList,
        selCard: selCard
      })
    }
  },
  selectCard(e) {
    let that = this,
      cardLists = that.data.cardLists,
      selCard = that.data.selCard,
      card = e.currentTarget.dataset;
    Array.prototype.remove = function (val) {
      const index = this.indexOf(val);
      if (index > -1) {
        this.splice(index, 1);
      }
    };
    cardLists.map(list => {
      if (card.id == list.id) {
        list.checked ? (list.checked = false, selCard.remove(card.id)) : (list.checked = true, selCard.push(card.id));
      }
    })
    that.setData({
      cardLists: cardLists,
      selCard: selCard
    })
  },
  confimCard() {
    let that = this;
    const pages = getCurrentPages(),
      prevPage = pages[pages.length - 2];
    prevPage.setData({
      selCards: this.data.selCard,
      cardToast: `选择${this.data.selCard.length}张卡券`
    })
    wx.navigateBack({
      delta: 1
    })
  }
})