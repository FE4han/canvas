(function () {
    var v = {
        preCanvas: document.getElementById('begin'),
        currentCanvas: document.getElementById('content'),
        index: 0,
        imageNum: 0,
        imgBg: ["shizijia.jpg"],
        imgWalk: ["walk_0.png", "walk_1.png", "walk_2.png", "walk_3.png"],
        imgJump: ["jump_0.png"],
        ImageBg: [],
        ImageWalk: [],
        ImageJump: [],
        boxW: [],
        jump: false,
        walk: true,
        walkW: 0,
        jumpH: 600,
        jumpEnd: true,
        showIndex: null,
        rainArr: [],
        //单个教程是否结束
        isOver: true,
        //默认向右走
        dir: "right",
        endTip: "神 语 曰 : 凡 是 不 会 用 canvas 加 特 效 的 异 教 徒 都 应 被 捆 绑 在 电 路 板 让 电 火 花 洗 涤 他 们 的 原 罪。"
    }
    v.ctx = v.currentCanvas.getContext("2d");
    var cw = v.currentCanvas.width;
    var ch = v.currentCanvas.height;
    var requestFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    var cancelRequest = webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        function (callback) {
            window.clearTimeout(callback, 1000 / 60);
        };
    //初始化
    v.init = function () {
        //一开始就加载所有图片
        this.loadImage();
        var self = this;
        //一定这里设置宽度和高低，用css设置的话图像会导致不清晰
        cw = v.currentCanvas.width = window.innerWidth;
        ch = v.currentCanvas.height = window.innerHeight;

        //绑定事件
        v.preCanvas.addEventListener('click', function (e) {
            //需要判断以下资源是否加载完毕了，游戏中用到的会比较的多
            if (v.imageNum < v.imgBg.length + v.imgWalk.length + v.imgJump.length) {
                alert("资源加载中，请稍后");
                return;
            }
            this.style.display = "none";
            v.drawBox(true);
        }, false);

        //键盘操作
        v.currentCanvas.addEventListener("keyup", function (evt) {
            //return
            if (!self.jumpEnd || !self.isOver) {
                return;
            }
            var evt = evt || window.event;
            //删除掉这个定时执行的东东
            cancelRequest(v.beginRain);
            switch (evt.keyCode) {
                //空格 跳跃
                case 32:
                    self.walk = false;
                    self.jump = true;
                    break;
                //前进
                case 39:
                    self.walk = true;
                    self.jump = false;
                    self.dir = "right";
                    break;
                //后退
                case 37:
                    self.walk = true;
                    self.jump = false;
                    self.dir = "left";
                    break;
                //状态恢复
                case 13:
                    v.drawBox(true);
                    self.jump = false;
                    self.walk = false;
                    break;
                default :
                    self.jump = false;
                    self.walk = true;
                    break;
            }
            v.update();
        }, true)

        window.onresize = function () {
            //重新调整大小
            cw = v.currentCanvas.width = window.innerWidth;
            ch = v.currentCanvas.height = window.innerHeight;
            if (!this.showIndex) {
                v.drawBox(true);
            }

        }
    };
    //更新画布
    v.update = function () {
        if (this.walkInteval) {
            window.clearInterval(this.walkInteval);
        }
        if (this.jumpInteval) {
            window.clearInterval(this.jumpInteval);
        }
        if (this.walk) {
            this.walkInteval = window.setInterval(function () {
                v.drawWalk();
            }, 34)
        }
        if (this.jump) {
            this.jumpInteval = window.setInterval(function () {
                v.drawJump();
            }, 1000 / 60)
        }
    }
    //画box以及文字
    v.drawBox = function (init) {
        v.ctx.clearRect(0, 0, cw, ch);
        v.ctx.strokeStyle = "#fff";
        v.ctx.lineWidth = "2";
        var arr = ["基础", "实例进阶", "单个动画", "多个动画", "性能", "结束语"]
        var w = Math.floor(cw / 7);
        v.ctx.fillStyle = "#fff";
        v.ctx.font = "40px Arial";
        this.isCollison = false;
        for (var i = 1; i < 7; i++) {
            v.ctx.beginPath();
            v.ctx.arc(w * i + 100, 400 - i * 50 + 50, 50, 0, 2 * Math.PI);
            v.ctx.stroke();
            //检测碰撞.只能在画的时候去检测
            if (this.ctx.isPointInPath(Math.abs(this.walkW), this.jumpH)) {
                this.isCollison = true;
                //记录下碰撞的是第几个元素
                this.showIndex = i;
            }
            this.boxW.push(w * i + 50);
            v.ctx.fillText(arr[i - 1], w * i + 60, 400 - i * 50 + 65, 80);
        }
        //画人
        if (init) {
            var self = this;
            this.index = this.index % this.ImageWalk.length;
            if (this.dir == "right") {
                this.ctx.save();
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(this.ImageWalk[this.index], this.walkW - 54, this.jumpH, 54, 82);
                this.ctx.restore();
            } else {
                this.ctx.drawImage(this.ImageWalk[this.index], Math.abs(this.walkW) - 54, this.jumpH, 54, 82);
            }
        }
    }
    //跳起来
    v.drawJump = function () {
        this.jumpEnd = false;
        if (this.jumpH >= 600 && this.fall) {
            window.clearInterval(this.jumpInteval);
            this.fall = false;
            this.jumpEnd = true;
            //跑起来了
            this.drawWalk();
            //落地以后展示结果
            if (this.showIndex) {
                window.clearInterval(this.jumpInteval);
                this.showOther();
                return;
            }
            return;
        }
        var self = this;
        this.drawBox();
        //检测碰撞
        if (this.isCollison || this.fall || this.jumpH <= 5) {
            this.fall = true;
            this.jumpH += 15;
        } else {
            this.jumpH -= 15;
        }
        if (this.dir == "right") {
            this.ctx.save();
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(this.ImageJump[0], self.walkW - 54, self.jumpH, 54, 82);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(this.ImageJump[0], Math.abs(self.walkW) - 54, self.jumpH, 54, 82);
        }

    }
    /**
     * 教程来了
     */
    v.showOther = function () {
        switch (this.showIndex) {
            case 1:
                //弹出基本的内容
                window.open("base.html");
                break;
            case 2:
                //弹出抽奖页面
                window.open("lottery.html");
                break;
            case 3:
                //就看这个动画吧,一场雨
                this.drawRain();
                break;
            case 4:
                //就看这个动画吧,一场雨
                this.drawRain();
                break;
            case 5:
                //性能问题啦
                break;
            case 6:
                this.drawEnd();
                break;
            default :
                break;
        }
        this.showIndex = null;
    }
    //跑起来了
    v.drawWalk = function () {
        this.drawBox();
        var self = this;
        this.index = this.index % this.ImageWalk.length;
        if (this.dir == "left") {
            this.ctx.drawImage(this.ImageWalk[this.index], Math.abs(self.walkW) - 54, 600, 54, 82);
            if (Math.abs(this.walkW) <= 54) {
                //window.clearInterval(self.walkInteval);
            } else {
                this.walkW += 3;
            }
        } else {
            //默认向右跑
            this.ctx.save();
            this.ctx.scale(-1, 1);
            //var w = step * -6 - 54;
            this.ctx.drawImage(this.ImageWalk[this.index], self.walkW - 54, 600, 54, 82);
            //跑完也就结束了
            if (Math.abs(this.walkW - 54) >= cw) {
                //window.clearInterval(self.walkInteval);
            } else {
                this.walkW -= 3;
            }
            this.ctx.restore();
        }
        this.index++;
    }

    //画结局图
    v.drawEnd = function () {
        this.isOver = false;
        this.ctx.clearRect(0, 0, cw, ch);
        //结束语
        if (this.ImageBg.length > 0) {
            this.ctx.drawImage(this.ImageBg[0], 0, 0, cw, ch);
        }
        var arr = v.endTip.split(" ");
        //结束语
        this.drawTxt(150, 250, arr);
    }


    //判断数字是否在数组中
    v.isInArray = function (a, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == a) {
                return true;
            }
        }
        return false;
    }
    /**
     * 载入图片
     * @param url
     */
    v.loadImage = function () {
        for (var i = 0; i < v.imgBg.length; i++) {
            var img = new Image();
            img.src = "image/" + v.imgBg[i];
            img.onload = function () {
                v.imageNum++;
                //放入全局中
                v.ImageBg.push(this);
            }
            img.onerror = function () {
                v.imageNum++;
            }
        }
        for (var j = 0; j < v.imgJump.length; j++) {
            var img = new Image();
            img.src = "image/" + v.imgJump[j];
            img.onload = function () {
                v.imageNum++;
                //放入全局中
                v.ImageJump.push(this);
            }
            img.onerror = function () {
                v.imageNum++;
            }
        }

        for (var i = 0; i < v.imgWalk.length; i++) {
            var img = new Image();
            img.src = "image/" + v.imgWalk[i];
            img.onload = function () {
                v.imageNum++;
                //放入全局中
                v.ImageWalk.push(this);
            }
            img.onerror = function () {
                v.imageNum++;
            }
        }
    }
    //下雨
    v.drawRain = function () {
        var self = this;
        this.isOver = false;
        //至少看个几秒吧，不然太不给力了
        window.setTimeout(function () {
            self.isOver = true;
        }, 5000);
        //下雨的话需要将雨滴保持下来
        this.beginRain();
        //this.rain = window.setInterval(self.beginRain, 17);
    }
    //下雨咯
    v.beginRain = function () {
        //清空画布
        v.ctx.clearRect(0, 0, cw, ch);
        v.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        //来，画个地面吧
        v.ctx.fillStyle = "#0000ff";
        v.ctx.fillRect(0, ch - 100, cw, ch);
        //新增雨滴
        var drop = {
            x: cw * Math.random(),
            y: 0,
        }
        //将雨滴保存下来
        v.rainArr.push(drop);
        //遍历雨滴，进行操作
        for (var j = v.rainArr.length - 1; j >= 0; j--) {
            //100米以上都是地行不
            if (v.rainArr[j].y + 10 > ch - 100) {
                v.rainArr.splice(j, 1);
                continue;
            }
            v.ctx.beginPath();
            v.ctx.moveTo(v.rainArr[j].x, v.rainArr[j].y);
            v.ctx.lineTo(v.rainArr[j].x, v.rainArr[j].y + 10);
            v.rainArr[j].y = v.rainArr[j].y + 10;
            v.ctx.lineWidth = 2;
            v.ctx.stroke();
        }
        requestFrame(arguments.callee);

    }
    //写文字
    v.drawTxt = function (w, h, arr) {
        if (arr.length < 1) {
            this.isOver = true;
            return;
        }
        this.ctx.font = "110px 微软雅黑";
        this.ctx.fillStyle = "#ff0000";
        this.ctx.align = "center";
        var text = arr.shift();
        var textS = this.getTextSize(text);// this.ctx.measureText(text);
        if (w + textS.w + 150 > cw) {
            h += textS.h + 30;
            w = 150;
        }
        v.ctx.fillText(text, w, h);
        w += textS.w + 40;

        window.setTimeout(function () {
            v.drawTxt(w, h, arr)
        }, 200);
    }

    //计算文字的高和宽
    v.getTextSize = function (text) {
        var d = document.getElementById('testSizeDiv');
        if (!d) {
            d = document.createElement("div");
            d.id = "testSizeDiv";
            d.style.display = "inline";
            d.style.fontSize = "110px";
            d.style.color = "#fff";
            //不能隐藏不然就算不出来了
            //d.style.display = "none";
            document.body.appendChild(d);
        }
        d.innerHTML = text;
        return {w: d.offsetWidth, h: d.offsetHeight};
    }


    //基础知识


    //动画
    v.animate = function () {

    }
    v.init();
})
();
