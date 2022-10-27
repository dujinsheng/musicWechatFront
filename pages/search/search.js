// pages/search/search.js
import request from '../../utils/request'
let isNotPermitted = false; // 定义此变量是用于进行请求节流的
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchContent: '', // 搜索框输入的内容
    placeholderContent: '', // 搜索框的提示字
    hotList: null, // 热搜列表
    searchList: [], // 这个字段表示input框输入后，查询到的数据
    searchHistoryList: [], //用户的历史输入搜索数据
  },
  // 定义一个函数，在刚进入页面的时候，去获取placeholderContent字段
  async getPlaceholedrContent() {
    let resultOne = await request('/search/default', {}, 'Get');
    let resultTwo = await request('/search/hot/detail', {}, 'Get');
    this.setData({
      placeholderContent: resultOne.data.showKeyword,
      hotList: resultTwo.data
    })
  },
  // input框输入改变触发的事件函数
  handleInputChange(event) {
    let searchContent = event.detail.value;
    this.setData({
      searchContent
    });
    if (isNotPermitted) {
      return // 如果已经发送过请求了，而且下次请求节流的时间还没到，那就需要先终止后续代码
    }
    this.defineFunctionToSearch(this.data.searchContent.trim());
    setTimeout(() => { //
      isNotPermitted = false;
    }, 1000)
  },
  // 点击清除input输入框的函数
  clearSearchContent() {
    this.recordSearchHistory(); // 清除input之前记录历史数据
    this.setData({
      searchContent: ''
    })
  },
  // 定义一个函数，用于在input输入框获取到的value发生改变时，去发送请求，模糊查询相关数据
  async defineFunctionToSearch(data) {
    let result = await request('/search', {
      keywords: data,
      limit: 10
    }, 'Get');
    this.setData({
      searchList: result.result.songs
    })
    isNotPermitted = true;
  },
  // 定义一个函数用于在清除input和离开当前页面的时候，对于历史数据进行记录
  recordSearchHistory() {
    let searchHistoryList = this.data.searchHistoryList;
    // 要先判断当前的input的value值是否已经放进到历史记录数组中了，如果已经放过了，就不要重复
    if (!searchHistoryList.includes(this.data.searchContent) && this.data.searchContent) {
      searchHistoryList.unshift(this.data.searchContent);
    }
    this.setData({
      searchHistoryList
    })
  },
  // 删除按钮的点击事件
  deleteSearchHistory() {
    wx.showModal({
      title: 'Tip',
      content: '是否要删除历史搜索记录？',
      // editable: true,
      success: (res) => {
        if (res.confirm) {
          this.setData({
            searchHistoryList: []
          });
          wx.clearStorageSync('searchHistoryList')
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getPlaceholedrContent()
    if (wx.getStorageSync('searchHistoryList')) {
      let searchHistoryList = JSON.parse(wx.getStorageSync('searchHistoryList'))
      this.setData({
        searchHistoryList
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.recordSearchHistory(); // 页面卸载的时候，注意是否有搜索数据还没有被记录
    // 将搜索记录数据保存在storage或者发请求保存在后端，下一次进入当前页面的时候去获取
    wx.setStorageSync('searchHistoryList', JSON.stringify(this.data.searchHistoryList))
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})