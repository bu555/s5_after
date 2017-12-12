

// 登陆接口：
// 通过req.body取到客户端传来的用户名与密码，
// 然后一般会做一个效验，看看有没有这个用户，我们先靠后一下，这里先默认通过
// 通过后使用resp.cookie()给客户端设置一个cookie信息，
// 以后客户端只要拿着这个cookie信息就可以访问其他接口的
router.post('/api/login', function(req, resp, next) {
    // 登陆成功后，创建一个session，然后把sessionID设置给前端
    resp.cookie('SESSIONID', sessions.create(req.body));
    resp.sendStatus(200);
});

module.exports = router;