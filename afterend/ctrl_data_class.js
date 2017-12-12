'use strict';
const mongoDB = require('mongodb'); //nodejs的mongdb驱动包
let dbURL = 'mongodb://localhost:27017/bz'; //链接到bz这个库
let ObjectID = mongoDB.ObjectID;
/*
数据表结构：
user:[{userName:'yhm',password:'123'},...]
config:[{userName:'yhm',theme:'red',...}]
yhm_data:[{name:'',solar:'2000-2-2'},...]
*/
class CtrlData {
    constructor(userName){

    };
    /*
	 * 用户-获取全部数据
	 * @params ('userName',option:{page:1,size:1},callback}
	 */
    static list(userName,option,successful){
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){
                db.collection(userName+"_data").find().toArray().then((data)=>{
                    let result = CtrlData.handleData(data,option); //处理数据分页
                    successful({data:result,code:0,msg:"操作成功"});
                },(err)=>{
                    successful({code:-1,msg:"操作失败"});
                });
            }else{
                successful({code:-1,msg:"操作失败"});
            }
            db.close();
        });
    }
    /*
	 * 用户-添加数据
	 * @params ('userName',option:{name:'',....},callback}
	 */
    static add(userName,option,successful){
        var _this = this;
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){//链接成功
                db.collection(userName+"_data").insert(option).then(function(data){
                    successful({code:0,msg:"操作成功"});
                });
            }else{
                successful({code:-1,msg:"操作失败"});
            }
            db.close();
        })
    }
    /*
	 * 用户-删除数据
	 * @params ('userName',['111','222'],callback}
	 */
    static del(userName,idArr,successful){
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){
                // db.collection('user').remove().then(successful);//删全部
                // db.collection(_this.storeName).remove({_id: ObjectID(id)}).then(successful);
                // db.collection(_this.storeName).deleteOne({_id: ObjectID(id)}).then(successful);

                delLoop(idArr.length-1,userName);
                function delLoop(i){
                    if(i>=0){
                        db.collection(userName+"_data").deleteMany({_id: ObjectID(idArr[i])},1).then(function(){
                            i--;
                            if(i<0){
                                successful({code:0,msg:"操作成功"});
                                db.close();
                            }else{
                                delLoop(i);
                            }
                        });              
                    }else{
                        successful({code:-2,msg:"参数错误"});
                        db.close();
                    }
                }
            }else{
                successful({code:-1,msg:"操作失败"});
                db.close();
            }
        })
    }
    /*
	 * 用户-查询数据
	 * @params ('userName',{name:'',page:5,size:12},callback} //查询指定的name
	 * @params ('userName',{page:5,size:12},callback} //不传name则查询所有
	 */
    static search(userName,option,successful){
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){
                if(option.name){
                    db.collection(userName+"_data").find({name: new RegExp(option.name)}).toArray().then((data)=>{
                        let result = CtrlData.handleData(data,option); //处理数据分页
                        successful({data:result,code:0,msg:"操作成功"});
                    });
                }else{
                    db.collection(userName+"_data").find({name: new RegExp(option.name)}).toArray().then((data)=>{
                        let result = CtrlData.handleData(data,option); //处理数据分页
                        successful({data:result,code:0,msg:"操作成功"});
                    });
                }
            }else{
                successful({code:-1,msg:"操作失败"});
            }
            db.close();
        })
    }
    /*
	 * 获取config 
	 * @params ('userName',{'key':'value',...}，callback)
	 */
    static getConfig(userName,successful){
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){
                db.collection("config").find({userName:userName}).toArray().then(res=>{
                    successful({data:res,code:0,msg:"操作成功"});
                });
            }else{
                successful({code:-1,msg:"操作失败"});
            }
            db.close();
        })
    }
    /*
	 * 设置config 
	 * @params ('userName',{'key':'value',...}，callback)
	 */
    static setConfig(userName,option,successful){
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){
                db.collection("config").update({'userName': userName}, {$set:option}).then(res=>{
                    successful({code:0,msg:"操作成功"});
                });
            }else{
                successful({code:-1,msg:"操作失败"});
            }
        })
    }
    /*
	 * 初始化config (在config表中增加一条数据)
	 * @params ('userName',callback)
	 */
    static initConfig(userName,successful){
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){//链接成功
                db.collection("config").insertOne({
                    userName:userName,
                    theme:'rgba(105,105,105,', //黯灰#696969
                    view:'rgba(205,205,205,',
                }).then(successful);
            }
        })
    }
	/*
	 * 注册新用户
	 * @params ({userName:'',password:''},callback)
	 */
    static register(option,successful){
        let userName = option.userName;
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){//链接成功
                db.collection('user').insertOne({
                    userName:option.userName,
                    password:option.password,
                    sex:option.sex,
                    email:option.email,
                }).then(function(data){
                    CtrlData.initConfig(userName,function(){
                        successful({code:0,msg:"操作成功"})
                    })
                });
            }else{
                successful({code:-1,msg:"操作失败"})
            }
            db.close();
        })
    }
    /*
	 * 查询已注册用户
	 * @params ("userName",callback)  查询指定用户
	 * @params ("",callback)  查询所有定用户
	 */
    static findUser(userName,successful){
        mongoDB.MongoClient.connect(dbURL,function(err,db){
            if(!err){
                if(userName){
                    db.collection('user').find({userName:userName}).toArray().then(function(data){
                        successful({data:data,code:0,msg:"操作成功"})
                    });
                }else{
                    db.collection('user').find().toArray().then(function(data){
                        successful({data:data,code:0,msg:"操作成功"})
                    });
                }
            }else{
                successful({code:-1,msg:"操作失败"})
            }
            db.close();
        })
    }

    //处理数据分页
    static handleData(data,option){
        //数据分页
        let page = option.page? parseInt(option.page):1;
        let size = option.size? parseInt(option.size):10;
        let total = data.length;
        let count = Math.ceil(data.length / size);
        //如果页码数大于实际count
        page = count<page? count:page;
        let clacData = data.splice((page-1)*size,size);
        return {list:clacData,count:count,page:page,total:total};
    }
}
module.exports = CtrlData;

