'use strict';
// 内置模块
const express = require('express');
const querystring = require('querystring');
let router = express.Router();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
//util 是一个Node.js 核心模块，提供常用函数的集合，用于弥补核心JavaScript 的功能 过于精简的不足。
var util = require('util');  
//express-ws是express的一个中间件，借助其我们可以在express中实现websocket的功能。
var expressWs = require('express-ws')(express);

const CtrlData = require('./ctrl_data_class');
const Calc = require('./calc_class');
const Token = require('./token');
const HttpAgent = require('./http_agent');
let userName = 'admin55';


// 请求的最开始，统一添加跨域响应头，
router.use((req, resp, next) => {
    
    resp.header('Access-Control-Allow-Origin', '*');
    resp.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Token5,Accept,X-Requested-With");
    resp.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // console.log(req.rawHeaders)
    // console.log(req.headers)
    // resp.set({    // console.log(req.rawHeaders); //这是请求头信息
    //     "Access-Control-Allow-Origin": "*",  //允许跨域请求
    //     'Access-Control-Allow-Methods': "*" 
    // });

    next(); 
});
/* 
get接口，用于测试
*/
router.get('/api/bz/getTest',(req,resp,next)=>{
    HttpAgent.getHistoryToday();

    
    console.log(req.url); //req.url获取URL
    console.log(req.query); //req.query获取查询信息 {id:'55'}
    resp.json({msg:'操作成功',code:0});
});
/* 
注册
入参：{userName:'',password:''}
*/
router.post('/api/bz/register',(req,resp,next)=>{
    CtrlData.register(req.body,function(res){
        resp.json(res);
    })
});
/* 
用户登录
入参：('username')
*/
router.post('/api/bz/login',(req,resp,next)=>{
    let userName = req.body.userName;
    let password = req.body.password;
    CtrlData.findUser(userName,function(res){
        if(res.code==0 && res.data.length>0){
            if(res.data[0].password == password){
                // resp.cookie('SESSIONID', "77007070");
                // resp.sendStatus(200);
                let token = Token.create(userName);
                resp.json({token:token,code:0,msg:'登录成功！'})
            }else{
                resp.json({code:-1,msg:'密码错误！'})
            }
        }else{
            resp.json({code:-1,msg:'用户名不存在！'})
        }
    })
});
/*//计算八字传参 {
    year:1987, 
    month:5, 
    day:5,
    hour:12,
    minute:55,
    sex:1,
    isLunar:false, //是否农历
    isLeap:false, //是否农历闰月
    isAuto23:true, //是否23点跳入下一天
}*/
router.post('/api/bz/calc',function(req,resp,next){
    let result = Calc.getBZ(req.body);
    resp.json(result);
});
/* 
获取某年某月数据
入参：{year:2000,month:2}
*/
router.post('/api/bz/getMonthCalendar',(req,resp,next)=>{
    console.log(req.body)
    let result = Calc.getMonthCalendar(req.body);
    resp.json(result);
});
/* 
获取某年节气
入参：{year:2000,num:2,isName:true} isName为可选，返回节气名
*/
router.post('/api/bz/getTerm',(req,resp,next)=>{
    let result = Calc.getTerm(req.body);
    resp.json(result);
});
//登录拦截
router.use((req, resp, next) => {
    // console.log(req.headers);
    //如果没传token,或token过期
    if(!req.headers.token5 || !Token.get(req.headers.token5)){
        resp.json({code:-5,msg:'会话已过期，需重新登陆！'});
    }else{
        let token = req.headers.token5;
        userName = Token.get(token);
        
        // console.log('1',req.headers.token5);
        // console.log(Token.get(req.headers.token5))
        // resp.json({msg:"OK"})
        next(); 
    }
});
//设置配置数据
router.post('/api/bz/setConfig',function(req,resp,next){
    CtrlData.setConfig(userName,req.body,function(){
        resp.json({code:0,msg:'操作成功'})
    });
});

//获取配置数据
router.get('/api/bz/getConfig',function(req,resp,next){
    CtrlData.getConfig(userName,function(data){
        resp.json(data);
    })
});
/* 
获取所有存储数据
入参：{page:1,size:10}
*/
router.post('/api/bz/list', function(req, resp, next){
    CtrlData.list(userName,req.body,function(res){
        resp.json(res);
    });
});
/* 
添加数据
入参：{name:'ss',sex:'1',solar:'',...}
*/
router.post('/api/bz/add',function(req,resp,next){
    CtrlData.add(userName,req.body,function(res){
        resp.json(res);
    })
});

/* 
删除数据
入参：{id:['fdfds','fdsfsd',..]}
*/
router.post('/api/bz/del',(req,resp,next)=>{
    let idArr = JSON.parse(req.body.id);
    CtrlData.del(userName,idArr,function(res){
        resp.json(res);
    });
});
/* 
查询数据
入参：{name:'',page:1,size:10} 或 {page:1,size:10}
*/
router.post('/api/bz/search',(req,resp,next)=>{
    CtrlData.search(userName,req.body,function(res){
        resp.json(res);
    })
});

/* 
注册用户查询
入参：('username')
*/
router.post('/api/bz/findUser',(req,resp,next)=>{
    CtrlData.findUser('',function(res){
        resp.json(res);
    })
});

module.exports = router;
