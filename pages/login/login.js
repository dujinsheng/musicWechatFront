import request from '../../utils/request.js'
// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    password: ''
  },
  // 由此函数进入index界面
  async handletap() {
    // 当我们将数据进行收集和更新后，需要对数据进行校验
    if (!this.data.phone.length) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return
    }
    const checkPhone = new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/)
    if (!checkPhone.test(this.data.phone)) {
      wx.showToast({
        title: '手机号码格式错误',
      })
      return
    }
    if (!this.data.password) {
      wx.showToast({
        title: '密码不能为空',
      })
      return
    }
    let result = await request('/login/cellphone', {
      phone: this.data.phone,
      password: this.data.password,
      isLogin: true
    }, 'Get')
    console.log(wx.getStorageSync('cookies').split(';;'))
    if (result.code === 200) {
      let userInfo = JSON.stringify(result.profile)
      wx.setStorageSync('userInfo', userInfo)
      // 成功登录
      wx.reLaunch({
        url: '/pages/index/index',
        success: function () {
          console.log('已经成功跳转至index页面')
        },
        fail: function (e) {
          console.log('跳转失败了，原因是', e)
        },
        complete: function () {
          console.log('这个过程已经结束了')
        }
      })
    } else if (result.code === 400) {
      // 电话号码错误
      wx.showToast({
        title: '手机号错误',
        icon: 'error'
      })
    } else {
      // 密码错误
      wx.showToast({
        title: '密码错误',
        icon: 'error'
      })
    }
  },
  // 通过input输入框来获得输入的账号和密码，并且修改data中的值
  handlerGetNameAndPassword(event) {
    let type = event.currentTarget.id;
    this.setData({
      [type]: event.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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