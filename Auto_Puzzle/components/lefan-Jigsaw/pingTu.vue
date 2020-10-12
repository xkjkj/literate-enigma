<template>
	<view class="">
		<transition-group name="PingTu" class="PingTu">
			<VUnitview class="item" :class="'pt_item_' + item" :style="[itemStyle,{'background-image': 'url('+imageArray[imgIndex]+')'}]" v-for="(item,index) in levelArray"
			 :data-index="index" :key="item" @tap="change"></VUnitview>
		</transition-group>
		<view class="btn-group">
			<view class="cu-btn bg-green shadow" @tap="start">{{startText}}</view>
			<view class="cu-btn bg-green shadow" @tap="back">返回</view>
			<view class="cu-btn bg-green shadow" @tap="change_image">换图</view>
			<view class="cu-btn bg-green shadow" @click="autoPlay">自动拼图</view>
		</view>
	</view>
</template>

<script>
	let that;
	let level = 3;
	let imgNumber=5;
	
	export default {
		props: {
			url: {
				default: '../../static/lupin.jpg'
			},
			timeOut: {
				default: -1
			},
			
			//imageArray:{
			//	type:Array,
			//	default:()=>["../../static/lupin.jpg","http://cdn.test.lfwellness.cn/pintu/xinpin.jpg"]
			//}
			
		},
		data() {
			return {
				levelArray: [],
				// url: 'http://cdn.test.lfwellness.cn/pintu/xinpin.jpg',
				startText: '开始游戏',
				gameStart: false,
				timeCounter: null,
				imgIndex:0,
				imageArray:["../../static/pintupicture/p1.jpg",
							"../../static/pintupicture/p2.jpg",
							"../../static/pintupicture/p3.jpg",
							"../../static/pintupicture/p4.jpg",
							"../../static/pintupicture/p5.jpg"
							]
							
			};
		},
		created() {
			let that = this;
			let array = {};
			for (var i = 1; i <= level * level; i++) {
				array[i] = i;
			}
			that.levelArray = array;
		},
		computed: {
			itemStyle() {
				let res = uni.getSystemInfoSync();
				let width = parseInt(res.windowWidth * 0.33);
				return {
					width: width + 'px',
					height: width + 'px',
				}
			}
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: -1
				})
			},
			rand(arr) {
				let old_arr = {};
				old_arr = arr;
				let len = level * level;
				for (let i in arr) {
					if (len != i) {
						let idx = Math.ceil(Math.random() * (len - 1));
						let temp = arr[idx];
						arr[idx] = arr[i];
						arr[i] = temp;
					}
				}
				//逆序数验证
				let last = 0;
				let num = 0;
				for (let i in arr) {
					for (let j in arr) {
						if (j > i && arr[i] > arr[j]) {
							num++;
						}
					}
				}
				// console.log(num);
				if (num % 2 != 0) {
					arr = that.rand(old_arr)
				}
				return arr;
			},
			autoPlay() {
				that = this;
				let array = [];
				for (var i = 1; i <= level * level; i++) {
					array[i] = i;
				}
				var if_rand = true;
				for(var i = 0;i<level*level;i++){
					if(!(this.levelArray[i]==i+1)){
						if_rand=false;
					}	
				}
				if(if_rand){
					array = this.rand(array);
					this.levelArray=array;
				}
				array = JSON.parse(JSON.stringify(this.levelArray));
				this.levelArray = array;
			    let Setting = {
			        originalNode: [[this.levelArray[1],this.levelArray[2],this.levelArray[3]],
					[this.levelArray[4],this.levelArray[5],this.levelArray[6]],
					[this.levelArray[7],this.levelArray[8],this.levelArray[9]]],
			        //originalNode: _.chunk(this.levelArray,3),
			        resultNode: [[1,2,3],[4,5,6],[7,8,9]],
			        delayTime: "500"
			    };
			    this.autoPuzzles(Setting).searchPath();
			},
			// 自己玩执行
			autoPuzzles(Setting) {
			    let that = this;
			    let queueArr = [];//队列
			    let hashObj = {};//hash
			    let NodeObj = {}; //记录节点
			    let originalNode = Setting.originalNode;//原始节点
			    let originalNodeStr = originalNode
			        .toString()
			        .split(",")
			        .join("");
			    let resultNode = Setting.resultNode;//结果节点
			    let resultNodeStr = resultNode
			        .toString()
			        .split(",")
			        .join("");
			    let isFind = false;
			    let delay = Setting.delayTime || 1000;//动画延迟
			
			    return {
			        // 寻找路径
			        searchPath() {
			            var _this = this;
			            queueArr.push(originalNode);
			            hashObj[originalNodeStr] = originalNode;
			            while (!isFind) {
			                if (!queueArr.length) {
			                    alert("没搜索到结果");
			                    return;
			                }
			                let currentNode = queueArr.shift(),
			                    currentNodeStr = currentNode
			                        .toString()
			                        .split(",")
			                        .join("");
			                if (resultNodeStr === currentNodeStr) {
			                    let path = []; 
			                    let pathLength = 0;
			                    let resultPath = [];
			                    for (
			                        let v = resultNodeStr;
			                        v != originalNodeStr;
			                        v = NodeObj[v]
			                    ) {
			                        path.push(hashObj[v]); 
			                    }
			                    path.push(hashObj[originalNodeStr]);
			                    pathLength = path.length;
			                    for (let i = 0; i < pathLength; i++) {
			                        resultPath.push(path.pop());
			                    }
			                    setTimeout(function() {
			                        _this.returnStep(resultPath);
			                    }, 500);
			                    isFind = true;
			                    return;
			                }
			                // return;
			                let result = this.getChildNodes(currentNode);
							if(!result) return;
			                result.forEach(function(item, i) {
			                    let itemStr = item
			                        .toString()
			                        .split(",")
			                        .join("");
			                    if (!hashObj[itemStr]) {
			                        queueArr.push(item);
			                        hashObj[itemStr] = item;
			                        NodeObj[itemStr] = currentNodeStr;
			                    }
			                });
			            }
			        },
			        // 返回步骤信息
			        returnStep(path) {
			            var _this = this;
			            path.forEach(function(item, index) {
			                setTimeout(
			                    function(node) {
			                        _this.readerDom(node);
			                    }.bind(_this, item),
			                    index * delay
			                );
			            });
			        },
			        // 渲染dom
			        readerDom(node) {
			            let nodeArr = node.toString().split(",");
			            that.levelArray = nodeArr;
			            that.isSuccess(that.levelArray);
			        },
			        // 获取子节点
			        getChildNodes(currentNode) {
			            if (!Array.isArray(currentNode)) return;
						if (!Array.isArray(currentNode[0])) return;
			            let target = {},
			                childNodesArr = [],
			                direction = [],
			                rowNum = currentNode.length,
			                colNum = currentNode[0].length;
			            currentNode.forEach(function(item, i) {
			                item.forEach(function(obj, k) {
			                    if (obj === 9 || obj ==="9") {
			                        target = { x: k, y: i };
			                    }
			                });
			            });
			            direction = this.getDirection(target, rowNum, colNum);
			            return this.changePos(currentNode, target, direction);
						
			        },
			        // 获取方向
			        getDirection(target, rowNum, colNum) {
			            let direction = [];
			            if (!target.x) {
			                direction.push("right");
			            } else if (target.x === colNum - 1) {
			                direction.push("left");
			            } else {
			                direction = direction.concat(["left", "right"]);
			            }
			
			            if (!target.y) {
			                direction.push("down");
			            } else if (target.y === rowNum - 1) {
			                direction.push("up");
			            } else {
			                direction = direction.concat(["down", "up"]);
			            }
			            return direction;
			        },
			        // 改变位置
			        changePos(node, target, direction) {
			            if (direction.length) {
			                let childNodesArr = [];
			                direction.forEach(function(item, index) {
			                    let temp;
			                    let _node = JSON.parse(JSON.stringify(node));
			                    switch (item) {
			                        case "left":
			                            temp = _node[target.y][target.x];
			                            _node[target.y][target.x] =
			                                _node[target.y][target.x - 1];
			                            _node[target.y][target.x - 1] = temp;
			                            break;
			                        case "right":
			                            temp = _node[target.y][target.x];
			                            _node[target.y][target.x] =
			                                _node[target.y][target.x + 1];
			                            _node[target.y][target.x + 1] = temp;
			                            break;
			                        case "down":
			                            temp = _node[target.y][target.x];
			                            _node[target.y][target.x] =
			                                _node[target.y + 1][target.x];
			                            _node[target.y + 1][target.x] = temp;
			                            break;
			                        case "up":
			                            temp = _node[target.y][target.x];
			                            _node[target.y][target.x] =
			                                _node[target.y - 1][target.x];
			                            _node[target.y - 1][target.x] = temp;
			                            break;
			                    }
			                    childNodesArr.push(_node);
			                });
			                return childNodesArr;
			            }
			        }
			    };
			},
		
			change_image()
			{
				let that=this;
				that.imgIndex=(that.imgIndex+1)%imgNumber;
				//that.url='http://cdn.test.lfwellness.cn/pintu/xinpin.jpg';
				that.start();
			},
			start() {
				that = this;
				let array = {};
				for (var i = 1; i <= level * level; i++) {
					array[i] = i;
				}
				array = that.rand(array);
				that.levelArray = array;
				that.gameStart = true;
				that.startText = '重新开始';
				clearInterval(that.timeCounter);
				if (that.timeOut != -1) {
					that.timeCounter = setTimeout(function() {
						uni.showToast({
							icon: 'none',
							title: '很遗憾！拼图失败了'
						})
						let array = {};
						for (var i = 1; i <= level * level; i++) {
							array[i] = i;
						}
						that.levelArray = array;
						that.$emit('result', 'failed');
					}, that.timeOut)
				}
			},
			
			change(e) {
				let that = this;
				let ele = e.currentTarget.dataset.index;
				let emptyNum = parseInt(level * level);
				if (that.gameStart && emptyNum != that.levelArray[ele]) {
					let topNum = that.levelArray[ele - level] ? that.levelArray[ele - level] : -1;
					let leftNum = that.levelArray[ele - 1] ? that.levelArray[ele - 1] : -1;
					let rightNum = that.levelArray[parseInt(ele) + 1] ? that.levelArray[parseInt(ele) + 1] : -1;
					let bottomNum = that.levelArray[parseInt(ele) + parseInt(level)] ? that.levelArray[parseInt(ele) + parseInt(level)]
						 : -1;
					let temp = {};
					// console.log(topNum, leftNum, rightNum, bottomNum);
					switch (emptyNum) {
						case topNum:
							{
								temp = that.levelArray[ele];
								that.levelArray[ele] = that.levelArray[ele - level];
								that.levelArray[ele - level] = temp;
								break;
							}
						case leftNum:
							{
								if ((ele - 1) % 3 != 0) {
									temp = that.levelArray[ele];
									that.levelArray[ele] = that.levelArray[ele - 1];
									that.levelArray[ele - 1] = temp;
								}
								break;
							}
						case rightNum:
							{
								if (ele % 3 != 0) {
									temp = that.levelArray[ele];
									that.levelArray[ele] = that.levelArray[parseInt(ele) + 1];
									that.levelArray[parseInt(ele) + 1] = temp;
								}
								break;
							}
						case bottomNum:
							{
								temp = that.levelArray[ele];
								that.levelArray[ele] = that.levelArray[parseInt(ele) + parseInt(level)];
								that.levelArray[parseInt(ele) + parseInt(level)] = temp;
								break;
							}
					}

					//检查是否成功了
					if (that.isSuccess(that.levelArray)) {
						uni.showToast({
							icon: 'none',
							title: '恭喜！完成拼图'
						})
						that.gameStart = false;
						that.startText = '再玩一次';
						that.$emit('result', 'success');
					}
				}
			},
			isSuccess(arr) {
				//console.log(arr);
				let temp = -1;
				for (let s in arr) {
					if (arr[s] > temp) {
						temp = arr[s];
					} else {
						return false;
					}
				}
				return true;
			}
		}
	}
</script>

<style>
	.PingTu {
		width: 100%;
		margin-top: 10upx;
		margin: auto;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}

	.PingTu .item {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		background-size: calc(300%) calc(300%);
		background-repeat: no-repeat;
		background-color: #C0C0C0;
		box-shadow: 0 10upx 10upx rgba(0, 0, 0, 0.1);
	}

	.pt_item_1 {
		background-position: left top;
	}

	.pt_item_2 {
		background-position: center top;
	}

	.pt_item_3 {
		background-position: right top;
	}

	.pt_item_4 {
		background-position: left center;
	}

	.pt_item_5 {
		background-position: center center;
	}

	.pt_item_6 {
		background-position: right center;
	}

	.pt_item_7 {
		background-position: left bottom;
	}

	.pt_item_8 {
		background-position: center bottom;
	}

	.pt_item_9 {
		background-position: right bottom;
		background-image: none !important;
	}

	.btn-group {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 30upx;
	}
	
	.PingTu-move {
	    transition: transform 0.5s;
	}
</style>
