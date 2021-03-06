// pages/checkList/checkList.js
//获取应用实例
var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',
        searchListArr: [
            //{
            //  id: 1,
            //  img: '../img/1.jpg',
            //  name: '西红柿炖牛腩',
            //  material:'牛腩 西红柿 土豆 胡萝卜',
            //  author:'小芊',
            //  collect:888,
            //  user_like:999
            //}
        ],
        totalCollect: 0,
        isLoading: false,//正在加载中
        noMore: false,//是否还有更多数据
        openid: null,
        pageId: 0,
        isHide: false,
        isRefresh: false,
        isAudit: false,
        auditText: '审核'
    },
    //事件处理函数
    getList: function (that, openid, pageId) {
        if (pageId != null && openid != null) {

            console.log({ pageId: pageId, openid: openid });
            wx.request({
                url: app.localUrl + 'audit/AdministratorsAudit',
                data: { pageId: pageId, openid: openid },
                // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                success: function (res) {
                    // success
                    console.log('管理员审核', res);
                    if (res.data.code == 1001) {
                        var arr = res.data.data.dataList;
                        var ListArr = that.data.searchListArr;
                        if (arr.length > 0) {
                            for (var i = 0; i < arr.length; i++) {
                                if (arr[i].inventory.length > 0) {
                                    var material = [];
                                    for (var n = 0; n < arr[i].inventory.length; n++) {
                                        material.push(arr[i].inventory[n].food_name);
                                    }
                                    material = material.join(' ');
                                }
                                ListArr.push({
                                    id: arr[i].id,
                                    img: arr[i].img,
                                    name: arr[i].name,
                                    material: material,
                                    author: arr[i].author,
                                    time: arr[i].time
                                });
                            }
                            //console.log(ListArr);
                            if (arr.length < 10) {
                                that.setData({
                                    searchListArr: ListArr,
                                    pageId: arr[arr.length - 1].id,
                                    totalCollect: res.data.data.count,
                                    noMore: true
                                })
                            } else {
                                that.setData({
                                    searchListArr: ListArr,
                                    pageId: arr[arr.length - 1].id,
                                    totalCollect: res.data.data.count,
                                    noMore: false
                                })
                            }

                        }

                    } else if (res.data.code == 1004) {
                        that.setData({
                            noMore: true
                        })
                    }
                },
                fail: function (res) {
                    // fail
                    console.log(res);
                },
                complete: function () {
                    // complete

                }
            })
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var openid = wx.getStorageSync('openid');
        if (openid) {
            this.setData({
                userInfo: wx.getStorageSync('userInfo')
            });
            that.getList(that, wx.getStorageSync('openid'), that.data.pageId);
        } else {
            wx:wx.redirectTo({
                url: '../user/user'
            })
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
        var that = this;
        if(that.data.isHide){
            that.setData({
                pageId: 0,
                searchListArr: [],
                isHide:false,
                totalCollect: 0,
            });
            that.getList(that, wx.getStorageSync('openid'), that.data.pageId);
        }

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        if(!this.data.isHide){
            this.setData({
                isHide:true
            })
        }
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
        var that = this;
        console.log('下拉刷新');
        var openid = wx.getStorageSync('openid');
        if (openid) {
            wx.showLoading({
                title: '刷新中'
            });
            var timer = setTimeout(function () {
                console.log(888);
                that.setData({
                    pageId: 1,
                    searchListArr: []
                });
                wx.hideLoading();
                that.getList(that, wx.getStorageSync('openid'), that.data.pageId);
                wx.stopPullDownRefresh(); //停止下拉刷新
                clearTimeout(timer);
            }, 500)
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      wx.showLoading({
        title: '加载中...',
      });
        if (!this.data.noMore) {
            var that = this;
            console.log('circle 下一页');
            this.setData({
                isLoading: true
            });
            var timer = setTimeout(function () {
                console.log(888);
                that.setData({
                    isLoading: false
                });

                that.getList(that, wx.getStorageSync('openid'), that.data.pageId);
                wx.hideLoading();
                clearTimeout(timer);
            }, 1000)
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '美食美荟开启你的美味生活！',
            path: '/pages/index/index',
            imageUrl: '../img/share.png',
            success: function (msg) {
                // 转发成功
                console.log(msg)
            },
            fail: function (msg) {
                // 转发失败
                console.log(msg)
            }
        }
    },
    /**审核控制**/
    auditHandle: function () {
        if (this.data.isAudit) {
            this.setData({
                isAudit: false,
                auditText: '审核'
            });
        } else {
            this.setData({
                isAudit: true,
                auditText: '完成'
            });
        }
    },
    sendAuditFun:function(id,url){
      wx.showLoading();
        var that = this;
        wx.request({
            url: app.localUrl + url,
            data: { id: id, openid: wx.getStorageSync('openid') },
            // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: function (res) {
                // success
                console.log(res);
                if (res.data.code == 1001) {
                    that.setData({
                        pageId: 1,
                        searchListArr: [],
                        totalCollect:0
                    });
                    that.getList(that, wx.getStorageSync('openid'), that.data.pageId);
                    var timer = setTimeout(function () {
                       wx.hideLoading();
                       clearTimeout(timer);
                    }, 300);
                
                }else if(res.data.code==1004){
                    wx.showToast({
                      title: '删除失败',
                      duration:500
                    })

                   
                }

            }
        })
    },
    /**审核通过**/
    auditpassFun: function (e) {
        console.log(e);
        var that = this;
        var id = e.target.dataset.id;
        that.sendAuditFun(id,'audit/greens_adopt');
    },
    /**审核驳回**/
    auditfailedFun:function(e){
        var that = this;
        var id = e.target.dataset.id;
        that.sendAuditFun(id, 'audit/greens_reject');
    }
})