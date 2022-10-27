import config from './config'
export default function request(url, data = {}, method) {
  return new Promise((reslove, reject) => {
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').split(';;').find(item => item.indexOf('MUSIC_U')  !== -1) : ''
      },
      success: (res) => {
        if (data.isLogin) {
          wx.setStorage({
            key: 'cookies',
            data: res.data.cookie
          })
        }
        // console.log(wx.getStorageSync('cookies').split(';;').find(item => item.indexOf('MUSIC_U=') !== -1 ), '检查fffff')
        // let arr = wx.getStorageSync('cookies').split(';;');
        // arr.forEach((element, index) => {
        //   console.log(element.indexOf('MUSIC_U'), 'JJJJJJJJJJJJJJJJs');
        //   if (element.indexOf('MUSIC_U') !== -1 ) {
        //     console.log(arr ,index)
        //     console.log(arr[index])
        //   }
        // })
        reslove(res.data)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}