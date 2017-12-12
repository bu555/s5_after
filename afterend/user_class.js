'use strict';
const mongoDB = require('mongodb'); //nodejs的mongdb驱动包
let dbURL = 'mongodb://localhost:27017/bz'; //链接到bz这个库
let ObjectID = mongoDB.ObjectID;

class CtrlData {
    constructor(userName){
        // this.init();
        // this.storeName = userName; 
        this.storeName = 'AH'; 

    };
    /*
	 * 设置用户配置信息
	 * @params {key1:value1, key2:value2, ...}
	 */
    setConfig(option,successful){
        let _this = this;
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){//链接成功
                db.collection(_this.storeName).update({'title': 'config'}, {$set:option}).then(successful);
            }else{
                console.log(err);
            }
        })
    }
    /*
     * 初始化用户信息
     * @params {key1:value1, key2:value2, ...}
     */
    initConfig(option,successful){
        let _this = this;
        option.title = 'config';
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){//链接成功
                db.collection(_this.storeName).insertOne(option).then(successful);
            }else{
                console.log(err);
            }
        })
    }
	/*
	 * 注册新用户
	 * @params {user:'',password:''}
	 */
    register(option,successful){
        /*
            用户名_user = [{user:'',password:'',config:[{thems:''}]}]
            用户名_data = [{},{},...]
        */ 
        let _this = this;
        option.title = 'config';
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){//链接成功
                db.collection(_this.storeName).insertOne(option).then(successful);
            }else{
                console.log(err);
            }
        })
    }
}
module.exports = CtrlData;

