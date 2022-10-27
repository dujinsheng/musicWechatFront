// pages/recommendSong/recommendSong.js
import request from '../../utils/request'
const PubSub = require('pubsub-js')
const date = new Date()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: date.getDate(),
    month: date.getMonth() + 1,
    recommendList: [], // 获取每日推荐歌曲的列表
    index: 0, //recommednSong页面中索引号为index的歌曲进入了songDetail页面
  },
  // 定义一个函数，用于获取推荐歌曲的列表
  async getRecommendList() {
    let result = await request('/recommend/songs', {}, 'Get')
    this.setData({
      recommendList: result.data.dailySongs
    })
  },
  // 定义一个函数，用于点击进入歌曲详情页面
  toSongDetail(event) {
      let index = event.currentTarget.dataset.index;
      this.setData({
        index
      })
      wx.navigateTo({
        url: '/pages/songDetail/songDetail',
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          getChangeTyeAndSendDataToUrlPage: (data) => {
            let {index} = this.data
            if ((index < 1 && data === 'pre') || (index === this.data.recommendList.length - 1 && data === 'next')) {
              // 这种情况下，应该让songDetail页面展示已经是第一首，或者已经是最后一首歌了
              // 通过消息发布的方式，将当前不可切歌传递到songDetail去
              PubSub.publish('translateMusicId', 'specil')
            } else {
              if (data === 'pre') {
                index -= 1
              } else {
                index += 1
              }
              // 通过索引号找到上一首或者是下一首的歌曲id并且通过消息发布的方式传递到songDetail页面去
              let musicId = this.data.recommendList[index].id;
              // 通过消息发布的方式,将当前歌曲的id传递到songDetail页面去
              PubSub.publish('translateMusicId', musicId)
            }
            this.setData({
              index
            })
          }
        },
        success: function (res) {
          // 使用此方法，向打开的页面传递数据（触发自定义事件，并且传递参数）
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            data: event.currentTarget.dataset.song
          })
        }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先进行登录',
        icon: 'none',
        success: () => {
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
    };
    this.getRecommendList()
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