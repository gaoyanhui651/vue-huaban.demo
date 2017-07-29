
var Uitl = {
	tpl: function(id) {
		return document.getElementById(id).innerHTML
	},
	ajax: function(url, fn) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					fn(JSON.parse(xhr.responseText))
				}
			}
		}
		xhr.open("GET", url, true);
		xhr.send(null)
	},
	observer: (function() {
		var _msg = {};
		return {
			// 订阅方法
			on: function(type, fn) {
				// 将回调函数存储
				if (_msg[type]) {
					// 直接存储
					_msg[type].push(fn)
				} else {
					// 创建消息管道
					_msg[type] = [fn]
				}
			},
			fire: function(type) {
				// 从第二个开始表示数据
				// 消息已经注册过，遍历消息管道，然后执行
				if (_msg[type]) {
					for (var i = 0; i < _msg[type].length; i++) {
						_msg[type][i].apply(null, arguments)
					}
				}

			},
			// 注销方法
			off: function(type, fn) {
				// 如果没有fn，注销全部
				if (fn) {
					// 遍历管道，找到该fn，删除
					if (_msg[type]) {
						for (var i = _msg[type].length - 1; i >= 0; i--) {
							// 如果是这个函数，就删除
							if (fn === _msg[type][i]


							) {
								_msg[type].splice(i, 1)
							}
						}
					}
				} else {
					// 删除全部的消息
					if (_msg[type]) {
						delete _msg[type];
					}
				}
			}
		}


	})()
}
Vue.filter('cj', function(value) {
	return value + '  采集';
})
Vue.filter('fs', function(value) {
	return value + '  粉丝';
})
var Find = Vue.extend({
	template: Uitl.tpl('tpl-find'),
	data: function() {
		return {
			list: [],
			other: [],
			show: true,
			isShow: false
		}
	},
	created: function() {
		Uitl.ajax("data/find/find.json", function(res) {
			if (res && res.errno === 0) {
				this.list = res.data.slice(0, 4)
				this.other = res.data.slice(4)
			}
		}.bind(this))

	},
	methods: {
		showtop: function(argument) {
			$('#show').slideToggle(500)

		},
		toup: function() {
		
			$('.home').slideToggle(500, function(argument) {
				this.isShow = true
			}.bind(this))
		},
		more: function() {
			this.show = false;
			this.list = this.list.concat(this.other)
		},
		sear: function(e) {
			this.val = e.target.value
			Uitl.observer.fire("server", this.val)
		},
		clicksear: function(e) {
				this.val = $(e.target).siblings("input").val()
				Uitl.observer.fire("subserver", this.val)
			}
	}
})
var New = Vue.extend({
	props: ['firedata', 'fireval'],
	template: Uitl.tpl('tpl-new'),
	data: function() {
		return {
			list: [],
			lr: true,
			backups: [],
			doc: "全部",
		}
	},
	computed: {
		newlist: function() {
			if (this.firedata === "" && this.fireval === "") {
				return this.list;
			} else if (this.firedata) {
				this.doc = this.firedata
				if (this.firedata === "全部") {
					this.list = this.backups;
				} else {
					this.list = [];
					for (var i = 0; i < this.backups.length; i++) {
						if (this.backups[i].show.indexOf(this.firedata) >= 0 || this.backups[i].name.indexOf(this.firedata) >= 0 || this.backups[i].type.indexOf(this.firedata) >= 0) {
							this.list.push(this.backups[i])
						}
					}
				}

			} else if (this.fireval) {
				this.doc = this.fireval
				 if(this.fireval==="全部"){
				 	this.list=this.backups;
				 }else{

					this.list = []
					for (var i = 0; i < this.backups.length; i++) {
						if (this.backups[i].show.indexOf(this.fireval) >= 0 || this.backups[i].name.indexOf(this.fireval) >= 0 || this.backups[i].type.indexOf(this.fireval) >= 0) {
							this.list.push(this.backups[i])
						}
					}
				 }
				

			}
			return this.list;
		}



	},
	created: function() {
		this.getData()

		$(window).scroll(function() {
			// 距离底部200像素开始加载
			// 窗口高度 wh
			// 滚动条距顶部的高度 sh
			// 自定义高度 zh
			// 页面高度 bh
			// bh <= wh + sh + zh
			if ($(document).height() <= $(window).height() + $(window).scrollTop() + 200) {
				// 由于滚动事件是高频事件，因此，我们要节流
				if (this.doc === "全部") {

					this.lazyGetData()
				}
			}
		}.bind(this))
	},
	methods: {
		lazyGetData: function() {
			_.throttle(function() {
				this.getData();
			}.call(this), 2000)
		},
		getData: function(argument) {
		
			Uitl.ajax("data/new/new.json", function(res) {
				if (res && res.errno === 0) {
					this.backups = this.backups.concat(res.data)
					this.list = this.backups;
					this.renderlr()
				}
			}.bind(this))
		},

		renderlr: function() {
			this.leftH = 0;
			this.rightH = 0;
			for (var i = 0; i < this.list.length; i++) {
				if (this.leftH <= this.rightH) {

					this.list[i].pd = true
					this.leftH += +(this.list[i].height)
				} else {
					this.list[i].pd = false
					this.rightH += +(this.list[i].height)
				}
			}
		},
		showlist: function() {
			$('.new ul').slideToggle(500);
		},
		goto: function(e) {
			$(e.target).css({
				background: '#eee'
			}).siblings().css({
				background: '#fff'
			});

			this.showlist();

			this.doc = e.target.innerHTML;
			if (this.doc === "全部") {
				this.list = this.backups;
			} else {

				this.listnew = [];

				this.list = this.backups;

				for (var i = 0; i < this.list.length; i++) {
					if (this.list[i].type === e.target.innerHTML) {
						this.listnew.push(this.list[i])
					}
				}
				this.list = this.listnew
			}

			this.renderlr()
			this.firedata = "";
			this.fireval = ""
		}
	}
})
var Detail = Vue.extend({
		template: Uitl.tpl('tpl-detail'),
		data: function() {
			return {
				list: [],
			}
		},
		created: function() {

			Uitl.ajax("data/detail/detail.json", function(res) {
				if (res && res.errno === 0) {
					this.list = res.data;
					this.renderlr()
				}
			}.bind(this))
		},
		methods: {
			sortLove: true,
			sortBack: true,
			sort: function(e) {
				$(e.target).css({
					background: 'skyblue'
				}).siblings('span').css({
					background: '#efefef'
				});

				if (e.target.id === 'love') {
					if (this.sortLove) {
						this.list.sort(function(a, b) {
							return b.love - a.love
						})
						this.sortLove = !this.sortLove
					} else {
						this.list.sort(function(a, b) {
							return a.love - b.love
						})
						this.sortLove = !this.sortLove
					}
				} else if(e.target.id === 'back'){
					if (this.sortBack) {
						this.list.sort(function(a, b) {
							return b.back - a.back 
						})
						this.sortBack = !this.sortBack
					} else {
						this.list.sort(function(a, b) {
							return a.back - b.back
						})

						this.sortBack = !this.sortBack
					}
				}
			},
			renderlr: function() {
				this.leftH = 0;
				this.rightH = 0;
				for (var i = 0; i < this.list.length; i++) {
					if (this.leftH <= this.rightH) {
						this.list[i].pd = true
						this.leftH += +(this.list[i].height)
					} else {
						this.list[i].pd = false
						this.rightH += +(this.list[i].height)
					}
				}
			}
		}
})

Vue.component('find', Find);
Vue.component('new', New);
Vue.component('detail', Detail);

var app = new Vue({
		el: '#app',
		data: {
			view: "find",
			pd: true,
			val: '',
			topshow: false,
			searchData: '',
		},
		beforeCreate: function() {
			Uitl.observer.on("server", function(type, val) {
				this.val = val
				location.hash = "#/new"
			}.bind(this))
			Uitl.observer.on("subserver", function(type, val) {
				this.val = val
				location.hash = "#/new"
			}.bind(this))
		},
		methods: {
			top: function() {
				$('body').animate({
					scrollTop: 0
				}, 400)
			},
			showtop: function(argument) {
				$('#show').slideToggle(500)
			},
			hidetop: function(argument) {
				$("#show").slideToggle(500)
			},
			search: function(e) {
				location.hash = "#/new";
				this.searchData = e.target.value;
			},
			block: function(argument) {
				if (this.pd) {
					$(".ser").css({
						opacity: 1,
					});
					this.pd = false
				} else {
					$(".ser").css({
						opacity: 0,
					});
					this.pd = true
				}
			},
			showhome: function() {
				$('.home').slideToggle(500);
				$(".ser").css({
					opacity: 0,
				}).val("");
				this.pd = true;
				this.searchData = ""
			}

		},
		created: function(argument) {
			
	
			$(window).scroll(function(event) {
				if (document.body.scrollTop >= 1000) {
					this.topshow = true
				} else {
					this.topshow = false
				}
			}.bind(this));

		}
})

function router () {
	var hash = location.hash;
	var hash = hash.replace(/^#\/?/, "");
	var hash = hash.split('/');
	var arr = {
		find: true,
		new: true,
		detail: true
	}
	if (arr[hash[0]]) {

		app.view = hash[0]

	} else {
		app.view = "find"
	}
	window.scrollTo(0, 0)
}

window.addEventListener("hashchange", router)
window.addEventListener("load", router)