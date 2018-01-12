'use strict';
const BZ = require('./tools/calendar/calcBZ');
const LunarCalendar = require('./tools/calendar/LunarCalendar');
const {queryJQ} = require('./tools/calendar/queryJQ')

class Calc {
    constructor(){
    }
    static getCalendar(year,month,day){
        return LunarCalendar.solarToLunar(year,month,day);
    }
    static getMonthCalendar(option){
        let res =  LunarCalendar.calendar(option.year,option.month,true); //设true拼接前后月数据
        // let res =  LunarCalendar.solarCalendar(option.year,option.month);
        return {data:res,msg:'操作成功',code:0}
    }
    static getTerm(option){
        let res = queryJQ(option.year,option.num,option.isName); //设isName返回中文节气名
        let res1 = LunarCalendar.getTerm(option.year,option.num-1);

        res = res +"---"+ (res1<10?"0"+res1:res1);
        return {data:res,msg:'操作成功',code:0}
    }
    //params(year,month,day,hour,minute,yearGZ,monthGZ,dayGZ,sex)
    // static getBZ = BZ.getInfo;
    // static getBZ(year,month,day,hour,minute,yearGZ,monthGZ,dayGZ,sex){
    /*传参 {
        year:1987, 
        month:5, 
        day:5,
        hour:12,
        minute:55,
        sex:1,
        isLunar:false, //是否农历
        isLeap:'0', //是否农历闰月 0農曆
        isAuto23:true, //是否23点跳入下一天
    }
    */
    static getBZ(option){
        {
            if(!(option.year&&option.month&&option.day&&option.hour&&option.minute&&
                option.sex&&option.isLunar&&option.isLeap&&option.isAuto23)) {
                    return {code:-1,msg:'参数错误！'}
                }
            if(!(/^[1-2]\d{3}$/.test(option.year)&&(option.year<=2100&&option.year>=1891))){
                return {code:-1,msg:'year参数错误！'}
            }
        }
        let year = parseInt(option.year);
        let month = parseInt(option.month);
        let day = parseInt(option.day);
        let hour = parseInt(option.hour);
        let minute = parseInt(option.minute);
        let second = parseInt(option.second);
        // let dateObj = new Date(year+"-"+month+"-"+day); //用来计算农历的Date对象
        let dateObj = null; //用来计算农历的Date对象
        let lunarInfo = {
            solar : formatDate(new Date(year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second))
            // month:'', //农历月
            // day:'', //农历日
            // monthCH:'', //农历中文月
            // dayCH:'' //农历中文日
        };
        console.log(lunarInfo.solar);
        if(option.isLunar==="0"){ //农历
            if(option.isLeap==="1"){ //农历+闰月
                let clacMonth = month + 1; 
                //month+1去查询公历
                let result_1 = LunarCalendar.lunarToSolar(year,clacMonth,day);
                //公历结果转农历验证是否闰月
                let result_2 = LunarCalendar.solarToLunar(result_1.year,result_1.month,result_1.day);
                if(result_2.lunarLeapMonth!=month){
                    return {code:-2,msg:'该年无此闰月，请查证后输入！'}
                }else{
                    if(result2.lunarYear==year&&result2.lunarMonth==month&&result2.lunarDay==day){
                        dateObj = new Date(result_1.year+"-"+result_1.month+"-"+result_1.day)
                    }else{
                        return {code:-3,msg:'农历信息请查证后输入！'}
                    }
                }
            }else{
                //农历转公历
                let result_1 = LunarCalendar.lunarToSolar(year,month,day);
                let result2 = LunarCalendar.solarToLunar(result_1.year,result_1.month,result_1.day);
                //核对一致说明农历信息存在
                if(result2.lunarYear==year&&result2.lunarMonth==month&&result2.lunarDay==day){
                    dateObj = new Date(result_1.year+"-"+result_1.month+"-"+result_1.day);
                }else{
                    return {code:-3,msg:'农历信息请查证后输入！'}
                }
            }
            year = dateObj.getFullYear();
            month = dateObj.getMonth()+1;
            day = dateObj.getDate();
        }else{
            //非农历时
            dateObj = new Date(year+"-"+month+"-"+day); 
        }
        //这里计算农历只是为获取农历信息（即在23时跳入前）
        let _month;
        let getLunarRes = LunarCalendar.solarToLunar(dateObj.getFullYear(),dateObj.getMonth()+1,dateObj.getDate());
        if(getLunarRes.lunarLeapMonth!=0){
            _month = getLunarRes.lunarMonth>getLunarRes.lunarLeapMonth?getLunarRes.lunarMonth-1:getLunarRes.lunarMonth;
        }else{
            _month = getLunarRes.lunarMonth;
        }
        // lunarInfo.solar = formatDate(dateObj);
        lunarInfo.lunar = _month+'-'+getLunarRes.lunarDay; //月和日
        lunarInfo.lunarCH = getLunarRes.lunarMonthName+getLunarRes.lunarDayName; 
        //判断是否设定了23时跳入下一天
        if(option.isAuto23==="1"){
            if(option.hour==23){
                dateObj = new Date(dateObj.getTime() + 24*3600*1000); //跳入下一天
                // console.log(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate());
            }
        }
        //用计算到最后的DateObj计算农历八字信息(有可能是23跳下一天的)
        let result = LunarCalendar.solarToLunar(dateObj.getFullYear(),dateObj.getMonth()+1,dateObj.getDate());
        let bzInfo = BZ.getInfo(
            year, //跳入前的年月日时分
            month,
            day,
            hour,
            minute,
            result.GanZhiYear,
            result.GanZhiMonth,
            result.GanZhiDay, 
            option.sex
        );
        bzInfo.lunarInfo = lunarInfo;
        return {code:0,msg:'ok',data:bzInfo}
        function formatDate(dateObj){
            return dateObj.getFullYear()+"-"+trans(dateObj.getMonth()+1)+"-"+trans(dateObj.getDate())+" "+trans(dateObj.getHours())+":"+trans(dateObj.getMinutes())+":"+trans(dateObj.getSeconds());
            function trans(num){
              return num<10?'0'+num:num+''
            }
        }
    }
}
module.exports = Calc;