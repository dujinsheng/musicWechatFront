import request from '../../utils/request';
const PubSub = require('pubsub-js')
const appInstance = getApp();
const dayjs = require('dayjs')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isplay: false,
    songDetail: null, //用来存放当前的歌曲详细数据
    musicLink: null, // 用来存放音乐的链接，从而避免，每次恢复歌曲播放的时候，都要再一次去拿链接的请求
    currentTime: '00:00', // 歌曲当前播放的进度数据
    totalSongDuration: '00:00', //歌曲的总时长数据
    currentTimeWidth: 0, /// 实时进度条的宽度
  },
  // 定义一个函数用于获取，从recommendSong路由跳转过来时所携带的数据
  getDataFromRecommendSong() {
    // 获取事件总线对象
    this.eventChannel = this.getOpenerEventChannel();
    // 绑定获取数据的自定义事件
    this.eventChannel.on('acceptDataFromOpenerPage', (data) => {
      let songDetail = data.data;
      this.setData({
        songDetail
      })
      // 动态的设置小程序头
      wx.setNavigationBarTitle({
        title: this.data.songDetail.al.name,
      })
      // 初始化歌曲总时长的格式
      this.convertTimeFormate(this.data.songDetail.dt);
    })
  },
  // 定义一个函数，根据歌曲的id作为参数，发送请求获取歌曲的详细数据
  async getMusicDetail(id) {
    let songDetail = await request('/song/detail', {
      ids: id
    }, 'Get');
    this.setData({
      songDetail: songDetail.songs[0]
    })
    wx.setNavigationBarTitle({
      title: this.data.songDetail.name,
    });
    this.convertTimeFormate(this.data.songDetail.dt)
  },
  // 切换播放状态的事件回调
  handleMusicPlay() {
    let isplay = !this.data.isplay;
    this.setData({
      isplay
    })
    this.musicControl(isplay, this.data.musicLink);
  },
  // 定义一个函数，用于在播放和暂停时进行调用
  async musicControl(isplay, musicLink) {
    // 创建控制音乐播放的实例
    if (isplay) {
      if (!musicLink) {
        // 获取音乐播放的链接
        let musicLinkData = await request('/song/url', {
          id: this.data.songDetail.id
        }, 'Get');
        musicLink = musicLinkData.data[0].url;
        this.setData({
          musicLink
        })
      }
      // 设置音频播放的链接
      this.backgroundAudioManager.src = musicLink;
      // 下面这个后台控制的title必须要设置
      this.backgroundAudioManager.title = this.data.songDetail.al.name;
    } else {
      this.backgroundAudioManager.pause();
    }
  },
  changePlayState(isplay) {
    this.setData({
      isplay
    })
    appInstance.globalData.isMusicPlay = isplay;
  },
  // 切换歌曲事件的回调
  handleSwitch(event) {
    // 无论是上一首还是下一首，传回来的都是它们的歌曲的id
    PubSub.subscribe('translateMusicId', async (msg, id) => {
      if (id === 'specil') {
        wx.showToast({
          title: '当前已经是第一首或者是最后一首了',
          icon: 'none',
        })
      } else {
        await this.getMusicDetail(id)
        this.setData({
          isplay: true,
        })
        this.musicControl(true);
      }
      PubSub.unsubscribe('translateMusicId') //取消消息订阅
    })
    // 触发自定义事件
    this.eventChannel.emit('getChangeTyeAndSendDataToUrlPage', event.currentTarget.id)
  },
  // 定义一个函数，用于在获取到当前歌曲的数据之后，对于歌曲的总时长进行格式转化。
  convertTimeFormate(time) {
    let totalSongDuration = dayjs(time * 1).format('mm:ss');
    this.setData({
      totalSongDuration
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDataFromRecommendSong();
    if (appInstance.globalData.musicId === this.data.songDetail.al.id && appInstance.globalData.isMusicPlay) {
      this.setData({
        isplay: true
      })
    }
    // 全局创建实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager()
    // 该方法用于检测后台打开音乐
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);
      appInstance.globalData.musicId = this.data.songDetail.al.id;
    });
    // 该方法用于检测后台关闭音乐 监听背景音频停止事件
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    });
    // 该方法用于检测真机上后台播放时，小程序侧边关闭时
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    //recommendSong页面通过点击进入当前页面之后，应该将音乐直接打开
    if (!appInstance.globalData.isMusicPlay) {
      let isplay = !this.data.isplay;
      this.setData({
        isplay
      })
      this.musicControl(isplay, this.data.musicLink);
    }
    this.backgroundAudioManager.onTimeUpdate(() => {
      // 我们可以在this.backgroundAudioManager实例上的属性currentTime知道当前播放的进度
      let time = this.backgroundAudioManager.currentTime * 1000;
      let currentTime = dayjs(time).format('mm:ss');
      this.setData({
        currentTime // 当前音乐的播放进度
      });
      // 进度条的总宽度为450;
      let currentTimeWidth = (this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration) * 450;
      this.setData({
        currentTimeWidth // 当前音乐的实时进度条
      })
      if (this.backgroundAudioManager.currentTime === this.backgroundAudioManager.duration) {
        // 当我们的当前音乐播放结束时，我们需要切换到下一首
        let event = {
          currentTarget: {
            id: 'next'
          }
        }
        this.handleSwitch(event)
      }
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