/**
 *@author xiongxu
 *@description: 多个物体下落动画，下雨之类的
 */
function drag() {
    //绘画环境
    this.ctx = null;
    //定义下落的物体数组
    this.dropObj = [];
    /**
     * 初始化函数
     */
    this.init = function (options) {
        var options = options || {};
        //数据传进来的时候覆盖
        this.speedX = options.speedX || [0, 10];
        this.speedY = options.speedY || [0, 10];
        this.size = options.size || [1, 10];
        this.g = options.g || 9.8;
        this.speedWin = options.speedWin || 0;
        this.winDir = options.winDir || "";
        this.type = options.type || 0;
        //动画函数的兼容处理
        (function () {
            //高级浏览器的兼容
            var lastTime = 0;
            var vendors = ['webkit', 'moz'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                    window[vendors[x] + 'CancelRequestAnimationFrame'];
            }
            //低级浏览器的兼容
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }
            //低级浏览器停止的兼容
            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }
        }());
        //创建绘图环境
        var map = document.getElementById(options.id);
        this.ctx = map.getContext("2d");
        this.ctx.width = innerWidth || screen.width;
        this.ctx.height = innerHeight || screen.height;
    }
    //新生成雨滴的数据,后续只需要更新位置即可
    var drop = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    //新建对象
    drop.prototype.copy = function (x, y) {
        return new drop(x, y)
    }
    /**
     * 新建雨滴或则其他下落物体
     */
    this.draw = function () {
        //随机新生成雨滴的数据
        //半径随机生成
        var r = Math.random() * this.size[0] + this.size[1] - this.size[0];
        //开始画图
        this.ctx.beginPath();
        this.ctx.moveTo(drop.x, drop.y);
        //目前只分为两种情况，一种是rain  即贝塞尔曲线,其实用直线也是ok的
        if (this.type == 0) {
            var ax = Math.abs(this.radius * Math.cos(this.speedWin));
            var ay = Math.abs(this.radius * Math.sin(this.speedWin));
            this.ctx.bezierCurveTo(drop.pos.x + ax, drop.pos.y + ay, this.prev.x + ax, this.prev.y + ay, drop.pos.x, drop.pos.y);
            this.ctx.stroke();
        } else {
            //另一种是snow,五角扇形
            this.ctx.fillStyle = "#fff";
            this.ctx.moveTo(this.pos.x, this.pos.y);
            this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        //将雨滴保存下来
        this.dropObj.push(drop);
    }


    /**
     * 更新画布
     */
    this.update = function () {
        var self = this;
        var d = new Date;
        //清理画图
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        var i = this.dropObj.length;
        while (i--) {
            var drop = this.dropObj[i];
            drop.update();
            //如果drop实例下降到底部，则需要在drops数组中清楚该实例对象
            if (drop.pos.y >= canvas.height) {
                //如果需要回弹，则在bouncess数组中加入bounce实例
                if (OPTS.hasBounce) {
                    var n = Math.round(4 + Math.random() * 4);
                    while (n--)
                        bounces.push(new Bounce(drop.pos.x, canvas.height));
                }
                //如果drop实例下降到底部，则需要在drops数组中清楚该实例对象
                drops.splice(i, 1);
            }

            drop.draw();
        }
        //如果需要回弹
        if (OPTS.hasBounce) {
            var i = bounces.length;
            while (i--) {
                var bounce = bounces[i];
                bounce.update();
                bounce.draw();
                if (bounce.pos.y > canvas.height) bounces.splice(i, 1);
            }
        }
        //每次产生的数量
        if (drops.length < OPTS.maxNum) {
            if (Math.random() < drop_chance) {
                var i = 0,
                    len = OPTS.numLevel;
                for (; i < len; i++) {
                    drops.push(new Drop());
                }
            }
        }
        //不断循环update
        window.requestAnimationFrame(arguments.callee);
    }

}

