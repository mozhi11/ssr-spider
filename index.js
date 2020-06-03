var request = require('request');
const cheerio = require('cheerio')
var url = "https://tizi.space/auth/register";
setInterval(() => {

    let user = Date.now()
    var requestData = {
        email: user + '@yopmail.com',
        name: user,
        passwd: user,
        repasswd: user,
        wechat: user,
        imtype: 1,
        code: 0,
    };
    console.log(requestData.email + ' ' + requestData.name)

    register(url, requestData);

    function register(url, data) {
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.ret == 1) {
                    //注册成功 登录
                    login({
                        email: requestData.email,
                        passwd: requestData.passwd
                    })
                } else {

                    //注册失败 发送钉钉消息
                    sendDingDingError(JSON.parse(body))
                }
            }
        });
    };


    function login(data) {
        request({
            url: 'https://tizi.space/auth/login',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.ret == 1) {
                    console.log('登陆成功')
                    let hearders = response.headers['set-cookie']
                    let cookieStr = hearders.join(';');
                    getElement(cookieStr)
                } else {
                    //注册失败 发送钉钉消息
                    sendDingDingError(JSON.parse(body))
                }
            }
        });
    };

    function getElement(cookie) {
        console.log(cookie)
        request({
            url: 'https://tizi.space/user',
            method: "GET",
            json: true,
            headers: {
                "cookie": cookie,
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {

                console.log('获取页面成功')
                parseHtml(body)

            } else {
                sendDingDingError(JSON.parse(body))
            }
        });
    };

    function parseHtml(element) {
        var $ = cheerio.load(element)
        $ = cheerio.load($('.float-clear',
            '#all_ssr_windows').html())
        let url = $('input').attr('value')
        sendDingDing(url, requestData.email, requestData.passwd)
    }

    function sendDingDing(url, email, pwd) {
        request({
            url: 'https://oapi.dingtalk.com/robot/send?access_token=769c3c83e444a4c2dbc8cae3476086a06c26ee821697c88e5635ea159d31eb3b',
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                "msgtype": "text",
                "text": {
                    "content": "GAIA: 更新链接成功 \n账号:" + email + '\n 密码:' + pwd + '\n 订阅链接:' + url
                }
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
                console.log('发送钉钉消息完成')

            } else {
                console.log(response.statusCode)
            }
        });
    }

    function sendDingDingError(msg) {
        request({
            url: 'https://oapi.dingtalk.com/robot/send?access_token=769c3c83e444a4c2dbc8cae3476086a06c26ee821697c88e5635ea159d31esadf',
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            json: true,
            body: {
                "msgtype": "text",
                "text": {
                    "content": " 更新链接失败\n" + msg
                }
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
                console.log('发送钉钉消息完成')

            } else {
                console.log(response.statusCode)
            }
        });
    }
}, 1000 * 60 * 60 * 12);