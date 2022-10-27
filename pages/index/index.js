// pages/index/index.js
import request from '../../utils/request.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用于轮播图的数据
    bannerList: [{
      pic: '/static/image/swiperOne.jpg',
      bannerId: '12581'
    }, {
      pic: '/static/image/user.jpg',
      bannerId: '12582'
    }],
    // 用于推荐栏目的数据
    recommendMusic: [{
      picUrl: '/static/image/swiperOne.jpg',
      name: '这是独一无二的这是独一无二的这是独一无二的'
    }, {
      picUrl: '/static/image/swiperOne.jpg',
      name: '这是独一无二的这是独一无二的这是独一无二的这是独一无二的'
    }],
    // 用于排行榜的数据
    musicTopList: {}
  },
  handlerToRecommendSong() {
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong',
    })
  },
  handlerToOther() {
    wx.navigateTo({
      url: '/pages/other/other',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 发送请求获取轮播图的数据
    request('/banner', {
      type: 2
    }, 'Get').then((res) => {
      this.setData({
        bannerList: res.banners
      })
    })
    // 发送请求获取推荐歌曲的数据
    request('/personalized', {
      limit: 30
    }, 'Get').then((res) => {
      this.setData({
        recommendMusic: res.result
      })
    })
    // 发送请求获取排行榜数据
    let index = 0;
    let resultArr = [];
    let topListData = await request('/toplist/detail',{}, 'Get')
    while (index < 5) { 
      index++;
      let topListItem = {name: topListData.list[index].name, tracks: topListData.list[index].tracks}
      resultArr.push(topListItem)
    }
    this.setData({
      musicTopList: resultArr
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})