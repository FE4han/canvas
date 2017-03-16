/**
 *@author xiongxu
 *@description: ����������䶯��������֮���
 */
function drag() {
    //�滭����
    this.ctx = null;
    //�����������������
    this.dropObj = [];
    /**
     * ��ʼ������
     */
    this.init = function (options) {
        var options = options || {};
        //���ݴ�������ʱ�򸲸�
        this.speedX = options.speedX || [0, 10];
        this.speedY = options.speedY || [0, 10];
        this.size = options.size || [1, 10];
        this.g = options.g || 9.8;
        this.speedWin = options.speedWin || 0;
        this.winDir = options.winDir || "";
        this.type = options.type || 0;
        //���������ļ��ݴ���
        (function () {
            //�߼�������ļ���
            var lastTime = 0;
            var vendors = ['webkit', 'moz'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                    window[vendors[x] + 'CancelRequestAnimationFrame'];
            }
            //�ͼ�������ļ���
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
            //�ͼ������ֹͣ�ļ���
            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }
        }());
        //������ͼ����
        var map = document.getElementById(options.id);
        this.ctx = map.getContext("2d");
        this.ctx.width = innerWidth || screen.width;
        this.ctx.height = innerHeight || screen.height;
    }
    //��������ε�����,����ֻ��Ҫ����λ�ü���
    var drop = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    //�½�����
    drop.prototype.copy = function (x, y) {
        return new drop(x, y)
    }
    /**
     * �½���λ���������������
     */
    this.draw = function () {
        //�����������ε�����
        //�뾶�������
        var r = Math.random() * this.size[0] + this.size[1] - this.size[0];
        //��ʼ��ͼ
        this.ctx.beginPath();
        this.ctx.moveTo(drop.x, drop.y);
        //Ŀǰֻ��Ϊ���������һ����rain  ������������,��ʵ��ֱ��Ҳ��ok��
        if (this.type == 0) {
            var ax = Math.abs(this.radius * Math.cos(this.speedWin));
            var ay = Math.abs(this.radius * Math.sin(this.speedWin));
            this.ctx.bezierCurveTo(drop.pos.x + ax, drop.pos.y + ay, this.prev.x + ax, this.prev.y + ay, drop.pos.x, drop.pos.y);
            this.ctx.stroke();
        } else {
            //��һ����snow,�������
            this.ctx.fillStyle = "#fff";
            this.ctx.moveTo(this.pos.x, this.pos.y);
            this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        //����α�������
        this.dropObj.push(drop);
    }


    /**
     * ���»���
     */
    this.update = function () {
        var self = this;
        var d = new Date;
        //����ͼ
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        var i = this.dropObj.length;
        while (i--) {
            var drop = this.dropObj[i];
            drop.update();
            //���dropʵ���½����ײ�������Ҫ��drops�����������ʵ������
            if (drop.pos.y >= canvas.height) {
                //�����Ҫ�ص�������bouncess�����м���bounceʵ��
                if (OPTS.hasBounce) {
                    var n = Math.round(4 + Math.random() * 4);
                    while (n--)
                        bounces.push(new Bounce(drop.pos.x, canvas.height));
                }
                //���dropʵ���½����ײ�������Ҫ��drops�����������ʵ������
                drops.splice(i, 1);
            }

            drop.draw();
        }
        //�����Ҫ�ص�
        if (OPTS.hasBounce) {
            var i = bounces.length;
            while (i--) {
                var bounce = bounces[i];
                bounce.update();
                bounce.draw();
                if (bounce.pos.y > canvas.height) bounces.splice(i, 1);
            }
        }
        //ÿ�β���������
        if (drops.length < OPTS.maxNum) {
            if (Math.random() < drop_chance) {
                var i = 0,
                    len = OPTS.numLevel;
                for (; i < len; i++) {
                    drops.push(new Drop());
                }
            }
        }
        //����ѭ��update
        window.requestAnimationFrame(arguments.callee);
    }

}

