'use strict'
const Axios = require('axios') 
class HttpAgent{
    constructor(){}
    static getHistoryToday(){
        console.log(Axios);
        this.$http.jsonp("http://v.juhe.cn/todayOnhistory/queryEvent.php",{params:{
            key:"d06d39435c4f8f5e77f48d09fa8d3848",
            date:this.date,
        } }).then(function(res){
            if(res.status == 200 && res.ok){
                this.initData = res.body.result;
                console.log(res);
            }
        }
        ).catch(function(res){ });

        
        
    }
}
module.exports=HttpAgent;