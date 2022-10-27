import request from '../../utils/request'
import {newVideoList} from '../../utils/mockData'
// pages/video/video.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNotShowBorder: null,
    navScrollData: [],
    videoList: null,
    videoId: null, //此参数用于进行判断，当前点击的图片对应的视频的的vid
    videoPlayTime: [], //定义一个数组用于存放不同的video的{vid,  播放时间}
    refresherTriggered: false, //下拉刷新的状态
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNavData()
  },
  // 定义一个函数，用于在页面进入的时候，获取navScrollData数据
  async getNavData() {
    let result = await request('/video/group/list', {}, 'Get');
    this.setData({
      navScrollData: result.data.slice(0, 10)
    })
    this.setData({
      isNotShowBorder: result.data[0].id
    })
    this.getVideoDataList(result.data[0].id)
  },
  // 绑定的nav点击事件
  changeNavItem(event) {
    this.setData({
      isNotShowBorder: event.currentTarget.id,
      videoList: [] // 当我们点击切换分类的时候，应该将之前的进行清空
    })
    // 需要将navScroll整体进行移动
    // 正在加载提示
    wx.showLoading({
      title: '正在加载'
    })
    this.getVideoDataList(this.data.isNotShowBorder)
  },
  // 定义一个函数用于在当前页面初始化的时候，就去获取视频列表的相关数据
  async getVideoDataList(param) {
    let result = await request('/video/group', {
      id: param
    }, 'Get')
    // 关闭正在加载的提示
    wx.hideLoading()
    this.setData({
      videoList: result.datas ? result.datas.map((element, index) => {
        element.id = index
        return element
      }) : [],
      refresherTriggered: false, // 在本函数中，数据请求成功之后，将下拉刷新的状态进行修改
    })
  },
  // 定义一个函数，该函数用于，播放下一个视频时，将上一个视频进行关闭
  handlePlay(event) {
    let vid = event.currentTarget.id;
    // 上一个this.vid和当前播放的vid是否相同 && 当前this上是否存在createVideoContext的实例 && 调用当前this上createVideoContext实例的stop方法
    this.vid !== vid && this.videoContext && this.videoContext.stop();
    this.vid = vid;
    this.setData({
      videoId: vid, //当前点击的图片带进来的vid 赋值到videoId上，用于判断应该显示那个video标签
    })
    this.videoContext = wx.createVideoContext(vid)
    // 判断当前的视频之前是否播放过，是否有播放记录, 如果有，跳转至指定的播放位置
    let {
      videoPlayTime
    } = this.data;
    let videoItem = videoPlayTime.find(item => item.vid === vid);
    if (videoItem) { //如果当前的视频播放过
      this.videoContext.seek(videoItem.currentTime); // 使用当前video的createVideoContext实例方法seek使视频到达指定进度
    }
    this.videoContext.play(); //使用当前video的createVideoContext实例的play方法，继续播放
  },
  //视频播放完成时触发的事件函数
  videoPlayed(event) {
    // 移除记录播放时长数组中当前视频的对象
    let {
      videoPlayTime
    } = this.data;
    videoPlayTime.splice(videoPlayTime.findIndex(item => item.vid === event.currentTarget.id), 1);
    this.setData({
      videoPlayTime
    })

  },
  // 视频播放的过程中，播放时间更新的事件函数
  videoPlayTimeUpdate(event) {
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime
    }
    // 解构赋值，获取this.data中的videoPlayTime
    let {
      videoPlayTime
    } = this.data;
    /*
     * 思路： 判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
     *   1. 如果有，在原有的播放记录中修改播放时间为当前的播放时间
     *   2. 如果没有，需要在数组中添加当前视频的播放对象
     *
     * */
    let videoItem = videoPlayTime.find(item => item.vid === videoTimeObj.vid);
    if (videoItem) { // 之前有
      videoItem.currentTime = event.detail.currentTime;
    } else { // 之前没有
      videoPlayTime.push(videoTimeObj);
    }
    // videoPlayTime
    this.setData({
      videoPlayTime
    })
  },
  //scroll下拉刷新绑定事件
  handleRefresher() {
    this.getVideoDataList(this.data.isNotShowBorder)
  },
  // 滚动到scroll的底部或者右边时触发的绑定事件
  handleScrolltolower() {
    // 在此函数中，第一种方法是后端分页，发请求去获取数据，第二种方式是前端分页，前端截取之前获得的数据
    let videoList = this.data.videoList;
    // 将视频最新的数据更新原有视频列表数据中
    videoList.push(...newVideoList); // newVideoList为模拟的数据
    this.setData({
      videoList
    })
  },
  // 跳转去search界面
  handlerToSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
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
  onShow: function () {},

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
    // 该函数如果需要起作用，需要我们在json文件中进行相应的配置
    // 可以在这里重新调接口，获取数据
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */  
  onShareAppMessage: function ({from}) { // 此处使用了解构赋值的方式，获取到的from如果为menu则是从右上角转发的，获取到的如果是button则是从设置了open-type="share"的button按钮触发的
    // 用户分享的事件函数，有两种触发的方式，第一种是对于button组件设置open-type="share",另外的一种是用户右上角点击分享
    if (from === 'menu') {
      return {
        title: '可以进行自定义标题',
        path: '/pages/video/video',
        imageUrl: '/static/image/user.jpg'
      }
    } else {
      return {
        title: '仅仅是修改了分享的标题'
      }
    }
  }
})