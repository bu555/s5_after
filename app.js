const express = require('express');
const bodyParser = require('body-parser');
const router = require('./afterend/router.js');

//util 是一个Node.js 核心模块，提供常用函数的集合，用于弥补核心JavaScript 的功能 过于精简的不足。
var util = require('util');  

let app = express();
//express-ws是express的一个中间件，借助其我们可以在express中实现websocket的功能。
var expressWs = require('express-ws')(app);

app.ws('/ws', function(ws, req) {  
    console.log(req)
    util.inspect(ws);  
    ws.on('message', function(msg) {  
      console.log('_message');  
      console.log(msg+"999");  
      ws.send('echo:' + (msg+"999"));  
      setInterval(()=>{
          ws.send(Math.random());
      },2700)
    });
    // setInterval(function(){
    //     ws.send("gaole");  
    // },3000)
  }) 
// use静态文件
app.use(express.static('./public'));
app.use(express.static('./frontend'));
app.use(express.static('./node_modules'));

// 使用第三方包来解析post请求发送的数据，
app.use(bodyParser.urlencoded({ extended: false }));

// 使用router
app.use(router);


// app.all('^\/api\/(login|register)/', loginControl);
// url为/api/goods/打头的，都要经过router中间件进一步处理
app.all('/api/bz/*', router);

app.listen(5555, () => console.log('走你'));