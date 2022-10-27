import request from '../../utils/request'
// pages/personal/personal.js
let startY , moveY, moveDistance
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobileTop: '460rpx',
    userInfo: {},
    recentPlayList:[]
  },
  touchStart(e) {
     startY = e.touches[0].pageY;
  },
  touchMove(e) {
    moveY = e.touches[0].pageY;
    moveDistance = moveY - startY;
    let top = `${moveDistance + 460}rpx`
    if (0 < moveDistance && moveDistance < 100) {
      this.setData({
        "mobileTop" : top
      })
    }
  },
  touhEnd() {
    this.setData({
      "mobileTop" : '460rpx'
    })
  },
  toLoginPage() {
    // 切换到登录页去
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  async getRecentPlayList(userId) {
    // 定义此函数，用于获取用户的最近播放列表
    let index = 0;
    let recentPlayList = await request('/user/record', {uid: userId,type: 0}, 'Get')
    this.setData({
      'recentPlayList': recentPlayList.allData.slice(0, 10).map((item) => {
        item.idx = index++;
        return item
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 当登陆成功时，需要获取一些用户信息进行展示
    let userData = wx.getStorageSync('userInfo')
    if (userData) {
      this.setData({
        userInfo: JSON.parse(userData)
      })
      this.getRecentPlayList(this.data.userInfo.userId);
    }
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