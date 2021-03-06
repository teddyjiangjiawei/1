// pages/depression/depression.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [
      { name: '', value: '0' },
      { name: '', value: '1' },
      { name: '', value: '2' },
      { name: '', value: '3' },
    ],
    val:[],
    check: [],
    checked: false,
    result: [],
    ifShow: [false],
    dataReturn: [],
    question: [],
    nowQuestion: [],
    index: null,
    d1: null,
    d2: null,
    duration: null,
    time: [],
    width: null,
  },

  radioChange(e) {
    //计算答题所用时间
    this.data.d2 = new Date()
    this.data.duration = this.data.d2 - this.data.d1
    this.data.time = this.data.time.concat(this.data.duration)
    this.data.d1 = new Date()
    console.log('——————————————————————————————')
    console.log('回答题目的时间',this.data.time)

    if (this.data.index + 1 < this.data.question.length) {
      this.data.result = this.data.result.concat(e.detail.value)
      this.setData({
        'nowQuestion': this.data.question[this.data.index + 1],
        'index': this.data.index + 1,
        'checked': false,
      })
      this.initRadio()
    } else {
      this.data.result = this.data.result.concat(e.detail.value)
      var that = this
      wx.request({
        url: 'https://tang.newif.cn/psychology',
        data: { 'type': "depression", 'result': this.data.result },
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success(res) {
          app.globalData.depressionScore = res.data
          app.globalData.SCLScore = null
          app.globalData.upiScore = null
          app.globalData.time = that.data.time
          console.log(app.globalData.time)
          wx.reLaunch({
            url: '../assess/assess',
          })
        }
      })
    }
    var that = this
    this.progress()
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    console.log('答题结果：',this.data.result)
  },

  progress() {
    var a = Math.ceil((this.data.index / this.data.question.length) * 100)
    this.setData({
      'width': a
    })
    console.log('当前题目为：',this.data.index + 1, '题目总数：',this.data.question.length)
    console.log('进度',a,'%')
  },

  //点击开始测试按钮后
  start() {
    //提取有用的数据
    for (var i in this.data.dataReturn) {
      this.data.question[i] = this.data.dataReturn[i].fields
    }
    //初始化data
    this.setData({
      'ifShow': true,
      'question': this.data.question,
      'nowQuestion': this.data.question[this.data.index],
    })
    //初始化计时
    this.data.d1 = new Date()
    this.initRadio()
    this.progress()
  },

  initRadio(){
    //重置数据
    this.setData({
      'val':[],
      'items': [
        { name: '', value: '0' },
        { name: '', value: '1' },
        { name: '', value: '2' },
        { name: '', value: '3' },
      ],
    })
    //将选项与分值对应
    for (var i in this.data.question[this.data.index]) {
      this.data.val = this.data.val.concat(this.data.question[this.data.index][i])
    }
    for (var j = 0; j < this.data.val.length; j++) {
      this.data.items[j].name = this.data.val[j]
    }
    this.setData({
      'items': this.data.items
    })
    console.log('当前题目内容：',this.data.items)
  },

  /**
  formSubmit(e) {
    this.data.result = e.detail.value
    this.data.check = e.detail.value
    var obj = []
    for (var i in this.data.result) {
      if (this.data.result[i] != "") {
        obj = obj.concat(this.data.result[i])
      }
    }
    for (var a in this.data.check) {
      if (this.data.check[a] == "") {
        this.data.check[a] = false
        this.setData({ 'check': this.data.check })
      } else {
        this.data.check[a] = true
        this.setData({ 'check': this.data.check })
      }
    }
    console.log(this.data.check)
    if (obj.length < 20) {
      wx.showToast({
        title: '请填写所有题目',
        icon: 'none',
        duration: 2000
      })
    } else {
      console.log('success')
      var that = this
      wx.request({
        url: 'https://tang.newif.cn/psychology',
        data: { 'type': "depression", 'result': obj },
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success(res) {
          app.globalData.depressionScore = res.data
          app.globalData.anxietyScore = null
          console.log(res.data)
          wx.reLaunch({
            url: '../assess/assess',
          })
        }
      })
    }
  }, */

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showModal({
      title: '知情同意',
      content: '亲爱的同学：您好！以下是一些心理测量与评估问卷。心理测量与评估是临床工作的重要组成部分。为了更好的帮助到您，请您真实并且认真的完成测验，同时对自己的选择与行为负责。我们将严格遵守保密原则，对相关资料进行保密。若涉及保密例外相关情况，我们将与您充分地沟通说明。对于测验结果的解释与说明，您可自行查阅或联系心理中心，感谢您的配合。',
      confirmText:'同意',
      cancelText:'拒绝',
      success(res) {
        if (res.confirm) {} 
        else if (res.cancel) {
          wx.navigateBack({
            delta:1
          })
        }
      }
    })
    var that = this
    wx.showLoading({
      title: '获取题目中',
    })
    wx.request({
      url: 'https://tang.newif.cn/psychology',
      data: { 'type': "depressionScale" },
      method: 'GET',
      header: { 'content-type': 'application/json' },
      success(res) {
        that.data.dataReturn = res.data
        wx.hideLoading()
      }
    })
    this.setData({
      'ifShow': false,
      'index': 0,
      'newQuestion': [],
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