// import {queryJQ,jqArr} from "./queryJQ.js";
const {queryJQ,jqArr} = require('./queryJQ.js');
const Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const Nayi={
    甲子:["海中金"],乙丑:["海中金"],丙寅:["炉中火"],丁卯:["炉中火"],戊辰:["大林木"],己巳:["大林木"],庚午:["路旁土"],辛未:["路旁土"],壬申:["剑锋金"],癸酉:["剑锋金"],
    甲戌:["山头火"],乙亥:["山头火"],丙子:["涧下水"],丁丑:["涧下水"],戊寅:["城墙土"],己卯:["城墙土"],庚辰:["白腊金"],辛巳:["白腊金"],壬午:["杨柳木"],癸未:["杨柳木"],
    甲申:["泉中水"],乙酉:["泉中水"],丙戌:["屋上土"],丁亥:["屋上土"],戊子:["霹雳火"],己丑:["霹雳火"],庚寅:["松柏木"],辛卯:["松柏木"],壬辰:["长流水"],癸巳:["长流水"],
    甲午:["沙中金"],乙未:["沙中金"],丙申:["山下火"],丁酉:["山下火"],戊戌:["平地木"],己亥:["平地木"],庚子:["壁上土"],辛丑:["壁上土"],壬寅:["金箔金"],癸卯:["金箔金"],
    甲辰:["覆灯火"],乙巳:["覆灯火"],丙午:["天河水"],丁未:["天河水"],戊申:["大驿土"],己酉:["大驿土"],庚戌:["钗钏金"],辛亥:["钗钏金"],壬子:["桑柘木"],癸丑:["桑柘木"],
    甲寅:["大溪水"],乙卯:["大溪水"],丙辰:["沙中土"],丁巳:["沙中土"],戊午:["天上火"],己未:["天上火"],庚申:["石榴木"],辛酉:["石榴木"],壬戌:["大海水"],癸亥:["大海水"]
    };
const cangGan={
    子:"癸",
    丑:"己癸辛",
    寅:"甲丙戊",
    卯:"乙",
    辰:"戊乙癸",
    巳:"丙戊庚",
    午:"丁己",
    未:"己丁乙",
    申:"庚壬戊",
    酉:"辛",
    戌:"戊辛丁",
    亥:"壬甲",
}

// *根据年、月、日、时、性别，返回bz信息
let BZ = {
     //计算四柱
    getInfo:function(year,month,day,hour,minute,nz,yz,rz,sex){
       let bzInfo = {};
       let shizhu = BZ.calcShizhu(rz,hour); //计算时柱
        //八字的信息
       let sizhuObj = { 
           nGan:{
               zi:nz.substr(0,1)
            },
           nZhi:{
               zi:nz.substr(1,1)
            },
           yGan:{
               zi:yz.substr(0,1)
            },
           yZhi:{
               zi:yz.substr(1,1)
            },
           rGan:{
               zi:rz.substr(0,1)
            },
           rZhi:{
               zi:rz.substr(1,1)
            },
           sGan:{
               zi:shizhu.substr(0,1)
            },
           sZhi:{
               zi:shizhu.substr(1,1)
            },
       }
       for(let key in sizhuObj){
           let ry = sizhuObj.rGan.zi;
        //    如果是日元，不计算十神，只区分男女
           if(key=="rGan"){
                sizhuObj[key].shishen = "元" + (sex==1?"男":"女");
           }else{
               if(cangGan[sizhuObj[key].zi]){ //如果是地支，找出藏干
                   let ziStr = cangGan[sizhuObj[key].zi];//获取藏干字符串
                   sizhuObj[key].canggan = ziStr;
                   sizhuObj[key].shishen = '';
                   for(let i=0;i<ziStr.length;i++){
                    sizhuObj[key].shishen += BZ.calcShiShen(ziStr[i],ry);
                   }
               }else{  //如果是天干
                 sizhuObj[key].shishen = BZ.calcShiShen(sizhuObj[key].zi,ry);
               }
           }
        }
        let liunianObj = BZ.calcLiunian(year,month,day); //计算流年信息
        //计算小运
        let xiaoyunTime = BZ.calcQiyun(year,month,day,hour,minute,nz,sex,bzInfo); //多少毫秒后是节令
        let xiaoyunMs = (Math.round(xiaoyunTime/1000/3600/2))*10*24*3600*1000; //多少毫秒后走运：时辰数*10天*24小时*3600 = 总毫秒数
        let ryMs = Date.parse(year+"-"+month+"-"+day+" "+hour+":"+minute+":"+"00"); //出生时间的毫秒数
        let qiyunDate = new Date(ryMs + xiaoyunMs); //起运时间的日期对象
        let xiaoyun = qiyunDate.getFullYear() - year; //几年后起运（即小运时长）
        //计算起运时间点
        let qiyunTime = BZ.formatDate(qiyunDate);
        let count = 11; //大运步数
        //计算大运+流年
        let dayunAndLiunian = [];
        if(xiaoyun!=0){ //如果不在同一年,添加小运
            count=10; //为了保证length11的数组，方便渲染
            dayunAndLiunian.push({
                dayun:"小運",
                liunian:liunianObj.slice(0,xiaoyun)
            });
        }

        let dayun = BZ.calcDayun(yz,nz,sex,count); //大运（10或11步）
        for(let i=0;i<dayun.length;i++){
            dayunAndLiunian.push({
                dayun:dayun[i],
                liunian:liunianObj.slice(xiaoyun,(xiaoyun+10))
            });
            xiaoyun += 10;
        }
        //五行信息
        let wuXing = BZ.wuXingPower(sizhuObj);

        bzInfo.sizhu = sizhuObj;
        bzInfo.dayunAndLiunian = dayunAndLiunian;
        bzInfo.wuXing = wuXing;
        bzInfo.other={
            nayin : Nayi[rz][0], //纳音
            qiyunTime : qiyunTime,
            sex : sex==1?"乾造":"坤造",
            myWX : BZ.calcWuXing(rz.substr(0,1)),
            jie : jqArr[month*2-2]+" "+queryJQ(year,month*2-1), //当月节
            qi : jqArr[month*2-1]+" "+queryJQ(year,month*2), //当月气
        }

       return  bzInfo;
       
    },
    //计算五行之力
    /*
    1.与邻字生克制化(地支取主气)，计算权重分数；（天干单独作战，地支实为团伙，主气为头头）

    強弱：印梟+日元 VS 官殺+食傷+才財*（33.3%）
    */
    wuXingPower:function(sizhu){
        const score={ //权重分数配置
            t:35, //天干
            d1:40, //一个藏干的地支
            dd1:35, dd2:10, //二个藏干的地支，如：亥、午
            ddd1:30, ddd2:10, ddd3:5, //三个藏干的地支
            t_he:13, //天干合化加成
            d_6he:10, //地支六合加成
            d_3he:18, //地支三合加成
            d_3hui:0.3, //地支三会加成（乘系数）
            d_chong1:-0.15, //主冲 （自身耗损系数）
            d_chong2:-0.30, //被冲 （自身耗损系数）
            d_chong:-0.1, //平冲 如：丑未 辰戌 （自身耗损系数）
            //与邻字生剋泄耗作用 
            sheng:0.2,//被生或助（乘系数）
            ke:-0.25, //被剋制（乘系数）
            xie:-0.1, //被泄或食（乘系数）--
            hao:-0.033, //被耗 （乘係數）--才財
            //月令加成
            yueHelp1:15, //主气元素点数加成
            yueHelp2:0.15, //主气元素系数加成
            yueSheng:0.05, //得月令生元素系数加成（乘系数）
            yueKe:-0.08, //被月令剋元素系数减力（乘系数）
        }
        let tianZi=[sizhu.sGan.zi,sizhu.rGan.zi,sizhu.yGan.zi,sizhu.nGan.zi];
        let diZhi=[sizhu.sZhi.zi,sizhu.rZhi.zi,sizhu.yZhi.zi,sizhu.nZhi.zi];
        let diZi=[sizhu.sZhi.canggan,sizhu.rZhi.canggan,sizhu.yZhi.canggan,sizhu.nZhi.canggan];
        // console.log(tianZi)
        // console.log(diZhi)
        // console.log(diZi)
        let WXPower={ //先聲明賦值，避免NaN
            '金':0,
            '木':0,
            '水':0,
            '火':0,
            '土':0
        };
        //計算天字 與鄰柱和地支作用
        for(let i=0;i<tianZi.length;i++){
            let ss;
            let wx = BZ.calcWuXing(tianZi[i]);
            //先分配分值
                WXPower[wx] += score.t;
            //在計算損耗得失
            if(i==0){
                ss = BZ.calcShiShen(tianZi[i+1],tianZi[i]); //天字第一個元素
                WXPower[wx] += score.t*getScore(ss);
            }else if(i==(tianZi.length-1)){
                ss = BZ.calcShiShen(tianZi[i-1],tianZi[i]); //最後一個元素
                WXPower[wx] += score.t*getScore(ss);
            }else{
                ss = BZ.calcShiShen(tianZi[i-1],tianZi[i]); //中間的元素，與相鄰的計算
                WXPower[wx] += score.t*getScore(ss);
                ss = BZ.calcShiShen(tianZi[i+1],tianZi[i]); 
                WXPower[wx] += score.t*getScore(ss);
            }
            ss = BZ.calcShiShen(diZi[i].substr(0,1),tianZi[i]);//所有元素與地支計算
            WXPower[wx] += score.t*getScore(ss);
        }
        //計算地字 與鄰柱和天干作用(以主氣藏干計算)
        let scoreVal; //記錄自身的分值,計算增減分值
        for(let i=0;i<diZi.length;i++){
            let ss;
            let wx = BZ.calcWuXing(diZi[i][0]);
            if(diZi[i].length==1){ //子卯酉40
                WXPower[wx] += score.d1; 
                scoreVal = score.d1;
            }else if(diZi[i].length==2){ //亥午主氣 中氣
                WXPower[wx] += score.dd1; 
                scoreVal = score.dd1;
                let wx1 = BZ.calcWuXing(diZi[i][1]); 
                WXPower[wx1] += score.dd2;
            }else{ //其餘主氣 中氣 余氣
                WXPower[wx] += score.ddd1;
                scoreVal = score.ddd1;
                let wx1 = BZ.calcWuXing(diZi[i][1]); 
                WXPower[wx1] += score.ddd2;
                let wx2 = BZ.calcWuXing(diZi[i][2]);
                WXPower[wx2] += score.ddd3;
            }
            if(i==0){
                ss = BZ.calcShiShen(diZi[i+1][0],diZi[i][0]); //第一個元素 與下一個地支元素作用
                WXPower[wx] +=  scoreVal*getScore(ss);
            }else if(i==(diZi.length-1)){
                ss = BZ.calcShiShen(diZi[i-1][0],diZi[i][0]); //最後一個元素 與上一個地支元素作用
                WXPower[wx] += scoreVal*getScore(ss);
            }else{
                ss = BZ.calcShiShen(diZi[i-1][0],diZi[i][0]); //中間的元素，與相鄰地支元素作用
                WXPower[wx] += scoreVal*getScore(ss);
                ss = BZ.calcShiShen(diZi[i+1][0],diZi[i][0]); 
                WXPower[wx] += scoreVal*getScore(ss);
            }
            ss = BZ.calcShiShen(tianZi[i],diZi[i][0]);//所有元素與天字計算
            WXPower[wx] += scoreVal*getScore(ss);
        }
        function getScore(ss){
            if(ss=="比"||ss=="劫"||ss=="印"||ss=="梟"){
                return score.sheng; //得生 系数
            }else if(ss=="食"||ss=="傷"){
                return score.xie; //被泄 系数
            }else if(ss=="才"||ss=="財"){
                return score.hao; //被耗 系数
            }else{
                return score.ke; //被克制 系数
            }
        }

        //合化影响 
        let hehuaObj = {tg:'',dz:'',chong:'',other:''}; //存合化信息
        //天干合化 甲己合化土 乙庚合化金　丙辛合化水　丁壬合化木　戊癸合化火 两种天干同时出现在命宫时，会带来另一种能量源*/
        {
            let tianS = tianZi.join('');
            if(/甲/g.test(tianS) && /己/g.test(tianS)){
                hehuaObj.tg += '甲己合化土;';
                WXPower['土'] +=  score.t_he;
            }
            if(/乙/g.test(tianS) && /庚/g.test(tianS)){
                hehuaObj.tg += '乙庚合化金;';
                WXPower['金'] +=  score.t_he;
            }
            if(/丙/g.test(tianS) && /辛/g.test(tianS)){
                if(WXPower['水']){ 
                    hehuaObj.tg += '丙辛合化水;';
                    WXPower['水'] +=  score.t_he;
                }else{ //如果沒有此元素
                    hehuaObj.tg += '丙辛合(可化水);';
                }
            }
            if(/丁/g.test(tianS) && /壬/g.test(tianS)){
                if(WXPower['木']){
                    hehuaObj.tg += '丁壬合化木;';
                    WXPower['木'] +=  score.t_he;
                }else{ //如果沒有此元素
                    hehuaObj.tg += '丁壬合(可化木);';
                }
            }
            if(/戊/g.test(tianS) && /癸/g.test(tianS)){
                if(WXPower['火']){
                    hehuaObj.tg += '戊癸合化火;';
                    WXPower['火'] +=  score.t_he;
                }else{ //如果沒有此元素
                    hehuaObj.tg += '戊癸合(可化火);';
                }
            }
        }
        //地支合化（三会→三合→六合 冲-破-害-刑 ）
        let diS = diZhi.join(''); 
        //地支三会：亥子丑會北方水局　寅卯辰會東方木局　巳午未會南方火局　申酉戌會西方金局
        {
            if(/亥/g.test(diS) && /子/g.test(diS) && /丑/g.test(diS)){
                hehuaObj.dz += '亥子丑會北方水局;';
                WXPower['水'] +=  WXPower['水']* score.d_3hui;
            }
            if(/寅/g.test(diS) && /卯/g.test(diS) && /辰/g.test(diS)){
                hehuaObj.dz += '寅卯辰會東方木局;';
                WXPower['木'] +=  WXPower['木']* score.d_3hui;
            }
            if(/巳/g.test(diS) && /午/g.test(diS) && /未/g.test(diS)){
                hehuaObj.dz += '巳午未會南方火局;';
                WXPower['火'] +=  WXPower['火']* score.d_3hui;
            }
            if(/申/g.test(diS) && /酉/g.test(diS) && /戌/g.test(diS)){
                hehuaObj.dz += '申酉戌會西方金局;';
                WXPower['金'] +=  WXPower['金']* score.d_3hui;
            }
        }
        //地支三合：申子辰合成水局　巳酉丑合成金局　寅午戌合成火局　亥卯未合成木局
        {
            if(/子/g.test(diS) && /申/g.test(diS) && /辰/g.test(diS)){
                hehuaObj.dz += '申子辰合成水局;';
                WXPower['水'] +=  score.d_3he;
            }
            if(/巳/g.test(diS) && /酉/g.test(diS) && /丑/g.test(diS)){
                hehuaObj.dz += '巳酉丑合成金局;';
                WXPower['金'] +=  score.d_3he;
            }
            if(/寅/g.test(diS) && /午/g.test(diS) && /戌/g.test(diS)){
                hehuaObj.dz += '寅午戌合成火局;';
                WXPower['火'] +=  score.d_3he;
            }
            if(/亥/g.test(diS) && /卯/g.test(diS) && /未/g.test(diS)){
                hehuaObj.dz += '亥卯未合成木局;';
                WXPower['木'] +=  score.d_3he;
            }
        }
        // 地支六合：子丑合化土　寅亥合化木　卯戌合化火　辰酉合化金　巳申合化水　午未為陰陽中正合化土
        {
            if(/子/g.test(diS) && /丑/g.test(diS)){
                hehuaObj.dz += '子丑合化土;';
                WXPower['土'] +=  score.d_6he;
            }
            if(/寅/g.test(diS) && /亥/g.test(diS)){
                hehuaObj.dz += '寅亥合化木;';
                WXPower['木'] +=  score.d_6he;
            }
            if(/卯/g.test(diS) && /戌/g.test(diS)){
                hehuaObj.dz += '卯戌合化火;';
                WXPower['火'] +=  score.d_6he;
            }
            if(/辰/g.test(diS) && /酉/g.test(diS)){
                hehuaObj.dz += '辰酉合化金;';
                WXPower['金'] +=  score.d_6he;
            }
            if(/巳/g.test(diS) && /申/g.test(diS)){
                hehuaObj.dz += '巳申合化水;';
                WXPower['水'] +=  score.d_6he;
            }
            if(/午/g.test(diS) && /未/g.test(diS)){
                hehuaObj.dz += '午未合化土;';
                WXPower['土'] +=  score.d_6he;
            }
        }
        // 地支相冲: 子午相沖　丑未相沖　寅申相沖　卯酉相沖　辰戌相沖　巳亥相沖
        {
            if(/子/g.test(diS) && /午/g.test(diS)){
                hehuaObj.chong += '子午相沖;';
                WXPower['火'] +=  score.dd1*score.d_chong2;//被冲
                WXPower['水'] +=  score.d1*score.d_chong1;;//主冲
            }
            if(/申/g.test(diS) && /寅/g.test(diS)){
                hehuaObj.chong += '寅申相沖;';
                WXPower['木'] +=  score.ddd1*score.d_chong2;//被冲
                WXPower['金'] +=  score.ddd1*score.d_chong1;;//主冲
            }
            if(/卯/g.test(diS) && /酉/g.test(diS)){
                hehuaObj.chong += '卯酉相沖;';
                WXPower['木'] +=  score.ddd1*score.d_chong2;//被冲
                WXPower['金'] +=  score.ddd1*score.d_chong1;;//主冲
            }
            if(/巳/g.test(diS) && /亥/g.test(diS)){
                hehuaObj.chong += '巳亥相沖;';
                WXPower['火'] +=  score.ddd1*score.d_chong2;//被冲
                WXPower['水'] +=  score.dd1*score.d_chong1;;//主冲
            }
            if(/丑/g.test(diS) && /未/g.test(diS)){
                hehuaObj.chong += '丑未相沖;';
                WXPower['土'] +=  score.ddd1*score.d_chong*2;//土平冲
            }
            if(/辰/g.test(diS) && /戌/g.test(diS)){
                hehuaObj.chong += '辰戌相沖;';
                WXPower['土'] +=  score.ddd1*score.d_chong*2;//土平冲
            }
        }
        // 地支相破：子酉相破　午卯相破　巳申相破　寅亥相破　辰丑相破　戌未相破
        {
            if(/子/g.test(diS) && /酉/g.test(diS)){
                hehuaObj.other += '子酉相破;';
            }
            if(/午/g.test(diS) && /卯/g.test(diS)){
                hehuaObj.other += '午卯相破;';
            }
            if(/巳/g.test(diS) && /申/g.test(diS)){
                hehuaObj.other += '巳申相破;';
            }
            if(/寅/g.test(diS) && /亥/g.test(diS)){
                hehuaObj.other += '寅亥相破;';
            }
            if(/辰/g.test(diS) && /丑/g.test(diS)){
                hehuaObj.other += '辰丑相破;';
            }
            if(/戌/g.test(diS) && /未/g.test(diS)){
                hehuaObj.other += '戌未相破;';
            }
        }
        // 地支相害： 子未相害　丑午相害　寅巳相害　卯辰相害　申亥相害　酉戌相害
        {
            if(/子/g.test(diS) && /未/g.test(diS)){
                hehuaObj.other += '子未相害;';
            }
            if(/丑/g.test(diS) && /午/g.test(diS)){
                hehuaObj.other += '丑午相害;';
            }
            if(/寅/g.test(diS) && /巳/g.test(diS)){
                hehuaObj.other += '寅巳相害;';
            }
            if(/卯/g.test(diS) && /辰/g.test(diS)){
                hehuaObj.other += '卯辰相害;';
            }
            if(/申/g.test(diS) && /亥/g.test(diS)){
                hehuaObj.other += '申亥相害;';
            }
            if(/酉/g.test(diS) && /戌/g.test(diS)){
                hehuaObj.other += '酉戌相害;';
            }
        }
        // 地支相刑：
        // 寅刑巳　巳刑申　申刑寅　為無恩之刑　　
        // 未刑丑　丑刑戌　戌刑未　為持勢之刑
        // 子刑卯　卯刑子　為無禮之刑　　
        // 辰刑辰　午刑午　酉刑酉　亥刑亥　為自刑之刑
        {
            if(/寅/g.test(diS) && /巳/g.test(diS)){
                hehuaObj.other += '寅刑巳;';
            }
            if(/申/g.test(diS) && /巳/g.test(diS)){
                hehuaObj.other += '巳刑申;';
            }
            if(/申/g.test(diS) && /寅/g.test(diS)){
                hehuaObj.other += '申刑寅;';
            }
            if(/未/g.test(diS) && /丑/g.test(diS)){
                hehuaObj.other += '未刑丑;';
            }
            if(/戌/g.test(diS) && /丑/g.test(diS)){
                hehuaObj.other += '丑刑戌;';
            }
            if(/戌/g.test(diS) && /未/g.test(diS)){
                hehuaObj.other += '戌刑未;';
            }
            if(/子/g.test(diS) && /卯/g.test(diS)){
                hehuaObj.other += '子卯相刑;';
            }
            let res = diS.split('').reduce((p, k) => (p[k]++ || (p[k] = 1), p), {});
            if(res['辰']>=2) hehuaObj.other += '辰辰自刑;';
            if(res['午']>=2) hehuaObj.other += '午午自刑;';
            if(res['酉']>=2) hehuaObj.other += '酉酉自刑;';
            if(res['亥']>=2) hehuaObj.other += '亥亥自刑;';     
        }
        //月令影響
        const yWuXing = ['木','火','土','金','水'];
        let YLwx = BZ.calcWuXing(sizhu.yZhi.canggan[0]); //月令主气
        // console.log(YLwx)
        let wxIndex = yWuXing.indexOf(YLwx);
        WXPower[yWuXing[wxIndex]] += score.yueHelp1 ; //加成点数20
        WXPower[yWuXing[wxIndex]] += WXPower[yWuXing[wxIndex]]*score.yueHelp2 ; //乘系数
        if(WXPower[yWuXing[(wxIndex+1)%5]]){ //如果不等於0
            WXPower[yWuXing[(wxIndex+1)%5]] += WXPower[yWuXing[wxIndex]] * score.yueSheng ; //得月令生加成
        }
        if(WXPower[yWuXing[(wxIndex+2)%5]]){ //如果不等於0
            WXPower[yWuXing[(wxIndex+2)%5]] += WXPower[yWuXing[wxIndex]] * score.yueKe ; //被月令剋减力
        }
        //四舍五入后，保留一位小数
        for(let key in WXPower){
            WXPower[key]=Math.round(WXPower[key]*10)/10;
        }
        //八字阵势 印梟+日元 VS 官殺+食傷+才財*（33.3%）
        let resultPK = {
            own:0,
            enemy:0,
        };
        let myWX = BZ.calcWuXing(sizhu.rGan.zi);
        let myWXIndex = yWuXing.indexOf(myWX); 
        // 己方力量和异方力量
        // resultPK.own = Math.round((WXPower[myWX]+WXPower[myWX]+WXPower[yWuXing[(myWXIndex+4)%5]])*10)/10;
        // let e1;
        // if(WXPower[yWuXing[(myWXIndex+3)%5]]){
        //     resultPK.enemy += WXPower[yWuXing[(myWXIndex+3)%5]];
        // } 
        // if(WXPower[yWuXing[(myWXIndex+1)%5]]){
        //     resultPK.enemy += WXPower[yWuXing[(myWXIndex+1)%5]];
        // }
        // if(WXPower[yWuXing[(myWXIndex+2)%5]]){
        //     resultPK.enemy += WXPower[yWuXing[(myWXIndex+2)%5]]*0.33; //才財的33%
        // }
        // let e1 = WXPower[yWuXing[(myWXIndex+3)%5]] ? WXPower[yWuXing[(myWXIndex+3)%5]] :
        resultPK.enemy = Math.round((WXPower[yWuXing[(myWXIndex+3)%5]]+ WXPower[yWuXing[(myWXIndex+1)%5]]+WXPower[yWuXing[(myWXIndex+2)%5]]*0.33)*10)/10;
        //找參考用、忌、闲神
        /*1.天干找 根据身强弱，先找天干→看月支藏干选第一用神→第二用神(喜神)；忌神(制喜忌的)*/ 
        {   
            let xiJiInfo = {
                yongS:'',
                jiS:'',
                details:''
            }
            // if(resultPK.own>resultPK.enemy){
                //身强 顺序：用官杀→食伤-→才
                if(new RegExp(sizhu.nGan.shishen).test("官殺食傷財才")){
                    resultPK.own>resultPK.enemy? xiJiInfo.yongS+=sizhu.nGan.zi:xiJiInfo.jiS+=sizhu.nGan.zi;
                }
                if(new RegExp(sizhu.yGan.shishen).test("官殺食傷財才")){
                    resultPK.own>resultPK.enemy? xiJiInfo.yongS+=sizhu.yGan.zi:xiJiInfo.jiS+=sizhu.yGan.zi;
                    // xiJiInfo.yongS+=sizhu.yGan.zi;
                }
                if(new RegExp(sizhu.sGan.shishen).test("官殺食傷財才")){
                    resultPK.own>resultPK.enemy? xiJiInfo.yongS+=sizhu.sGan.zi:xiJiInfo.jiS+=sizhu.sGan.zi;
                    // xiJiInfo.yongS+=sizhu.sGan.zi;
                }
                if(new RegExp(sizhu.nGan.shishen).test("印梟比劫")){
                    resultPK.own>resultPK.enemy? xiJiInfo.jiS+=sizhu.nGan.zi:xiJiInfo.yongS+=sizhu.nGan.zi;
                }
                if(new RegExp(sizhu.yGan.shishen).test("印梟比劫")){
                    resultPK.own>resultPK.enemy? xiJiInfo.jiS+=sizhu.yGan.zi:xiJiInfo.yongS+=sizhu.yGan.zi;
                }
                if(new RegExp(sizhu.sGan.shishen).test("印梟比劫")){
                    resultPK.own>resultPK.enemy? xiJiInfo.jiS+=sizhu.sGan.zi:xiJiInfo.yongS+=sizhu.sGan.zi;
                }
                if(!xiJiInfo.yongS){ //如果沒有找用神，在月支藏干找
                    for(let i=0;i<sizhu.yZhi.shishen.length;i++){
                        if(new RegExp(sizhu.yZhi.shishen[i]).test("官殺食傷財才")){
                            xiJiInfo.yongS += sizhu.yZhi.canggan[i];
                        }
                    }
                    if(xiJiInfo.yongS){
                        xiJiInfo.details = `此造無用神透干，可取月支藏干「${xiJiInfo.yongS}」作喜神為日元所用;`
                    }else{
                        xiJiInfo.details = `此造無用神透干，且月支藏干亦無日元所喜;`
                    }
                }else{
                    //去重
                    let str = '';
                    for(let i=0;i<xiJiInfo.yongS.length;i++){
                        if(str.indexOf(xiJiInfo.yongS[i])==-1){
                            str+=xiJiInfo.yongS[i];
                        }
                    }
                    xiJiInfo.yongS = str;
                    xiJiInfo.details = `此造用神「${xiJiInfo.yongS}」透干;`
                }
                if(!xiJiInfo.jiS){ //如果沒有找用神，在月支藏干找
                    for(let i=0;i<sizhu.yZhi.shishen.length;i++){
                        if(new RegExp(sizhu.yZhi.shishen[i]).test("印梟比劫")){
                            xiJiInfo.jiS += sizhu.yZhi.canggan[i];
                        }
                    }
                    if(xiJiInfo.jiS){
                        xiJiInfo.details += `月支所藏「${xiJiInfo.jiS.substr(0,1)}」為忌神;`
                    }else{
                        xiJiInfo.details += `天干或月支藏干均未見忌神;`
                    }
                }else{
                    //去重
                    let str = '';
                    for(let i=0;i<xiJiInfo.jiS.length;i++){
                        if(str.indexOf(xiJiInfo.jiS[i])==-1){
                            str+=xiJiInfo.jiS[i];
                        }
                    }
                    xiJiInfo.jiS = str;
                    xiJiInfo.details += `天干所透「${xiJiInfo.jiS}」為忌神;`
                }
                // if(sizhu.nGan.shishen=='官'||sizhu.nGan.shishen=='殺') yongShen+=sizhu.nGan.zi;
                // if(sizhu.yGan.shishen=='官'||sizhu.yGan.shishen=='殺') yongShen+=sizhu.yGan.zi;
                // if(sizhu.sGan.shishen=='官'||sizhu.sGan.shishen=='殺') yongShen+=sizhu.sGan.zi;
                // if(sizhu.nGan.shishen=='食'||sizhu.nGan.shishen=='傷') yongShen+=sizhu.nGan.zi;
                // if(sizhu.yGan.shishen=='食'||sizhu.yGan.shishen=='傷') yongShen+=sizhu.yGan.zi;
                // if(sizhu.sGan.shishen=='食'||sizhu.sGan.shishen=='傷') yongShen+=sizhu.sGan.zi;
                // if(sizhu.nGan.shishen=='才'||sizhu.nGan.shishen=='財') yongShen+=sizhu.nGan.zi;
                // if(sizhu.yGan.shishen=='才'||sizhu.yGan.shishen=='財') yongShen+=sizhu.yGan.zi;
                // if(sizhu.sGan.shishen=='才'||sizhu.sGan.shishen=='財') yongShen+=sizhu.sGan.zi;
                
            // }else{
            //     if(new RegExp(sizhu.nGan.shishen).test("印梟比劫")){
            //         xiJiInfo.yongS+=sizhu.nGan.zi;
            //     }
            //     if(new RegExp(sizhu.yGan.shishen).test("印梟比劫")){
            //         xiJiInfo.yongS=sizhu.yGan.zi;
            //     }
            //     if(new RegExp(sizhu.sGan.shishen).test("印梟比劫")){
            //         xiJiInfo.yongS+=sizhu.sGan.zi;
            //     }
            //     if(!xiJiInfo.yongS){ //如果沒有找喜神
            //         for(let i=0;i<sizhu.yZhi.shishen.length;i++){
            //             if(new RegExp(sizhu.yZhi.shishen[i]).test("印梟比劫")){
            //                 xiJiInfo.yongS += sizhu.yZhi.canggan[i];
            //             }
            //         }
            //     }
                // if(sizhu.nGan.shishen=='印'||sizhu.nGan.shishen=='梟') yongShen+=sizhu.nGan.zi;
                // if(sizhu.yGan.shishen=='印'||sizhu.yGan.shishen=='梟') yongShen+=sizhu.yGan.zi;
                // if(sizhu.sGan.shishen=='印'||sizhu.sGan.shishen=='梟') yongShen+=sizhu.sGan.zi;
                // if(sizhu.nGan.shishen=='比'||sizhu.nGan.shishen=='劫') yongShen+=sizhu.nGan.zi;
                // if(sizhu.yGan.shishen=='比'||sizhu.yGan.shishen=='劫') yongShen+=sizhu.yGan.zi;
                // if(sizhu.sGan.shishen=='比'||sizhu.sGan.shishen=='劫') yongShen+=sizhu.sGan.zi;
            // }
            // console.log("xiJiInfo:",xiJiInfo);
            // 如果沒有，月支藏干找喜神，如果還沒有
        }
        // console.log(WXPower)
        // console.log(hehuaObj)
        return {
            WXPower:WXPower, //五行势力
            resultPK:resultPK, //交战结果
            hehuaObj:hehuaObj, //合化信息
        }
    },
    //转化日期对象
    formatDate:function(date){
        return date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日"+date.getHours()+"时"+date.getMinutes()+"分";
    },
    // 计算时柱
    calcShizhu:function(rz,h) {
        /** 计算时柱（论日上起时） 甲己还加甲， 乙庚丙作初， 丙辛从戊起， 丁壬庚子居， 戊癸何方发， 壬子是真途. */
        let szIndex = Math.ceil( h/2 ) % 12; //时支所在索引
        let rg = rz.substr(0, 1); //日干
        let st = 0;
        if (rg === "甲" || rg === "己") {
            st = 0; //"甲";
        } else if (rg === "乙" || rg === "庚") {
            st = 2; //"丙";
        } else if (rg === "丙" || rg === "辛") {
            st = 4;//"戊";
        } else if (rg === "丁" || rg === "壬") {
            st = 6;//"庚";
        } else if (rg === "戊" || rg === "癸") {
            st = 8;//"壬";
        }
        return Gan[(szIndex + st) % 10] + Zhi[szIndex];
    },
    //计算大运  以月柱做顺逆排序
    calcDayun(yz,nz,sex,count){ //传入yz月柱、rz日柱、sex性别（乾1坤0，返回字符串的数组
        let gan = yz.substr(0,1);
        let zhi = yz.substr(1,1); //分解干、支
        let nIndex = Gan.indexOf(nz[0])%2; //阳年还是阴年（0阳 1阴）
        let ganIndex = Gan.indexOf(gan); //查找干所在索引
        let zhiIndex = Zhi.indexOf(zhi); //查找支所在索引
        let ganArr = []; //存干  
        let zhiArr = []; //存支
        let dayun = []; //存放大运和对应的流年
        if((sex==1 && nIndex==0)||(sex==0 && nIndex==1)){ //阳男或阴女
            for(let i=0 ; i<count ; i++){
                ganArr[i] = Gan[++ganIndex%10]; //干为10进
                zhiArr[i] = Zhi[++zhiIndex%12]; //支为12进
            }
        }else if((sex==1 && nIndex==1)||(sex==0 && nIndex==0)){ //阴男或阳女
            for(let i=0 ; i<count ; i++){
                ganArr[i] = Gan[(--ganIndex+10)%10]; //干为10进
                zhiArr[i] = Zhi[(--zhiIndex+12)%12]; //支为12进
            }
        }
        //拼接大运
        for(let i=0;i<ganArr.length;i++){

            dayun.push(ganArr[i]+zhiArr[i]);
        }
        return dayun;
    },
    //计算流年与岁数
    calcLiunian(year,month,day){
        // let nz = Gan[(year-1900+6)%10]+Zhi[(year-1900)%12];//计算公历对应的年柱(用于显示大运和流年)
        //1891辛卯年
        let nz = Gan[(year-1891+7)%10]+Zhi[(year-1891+3)%12];//计算公历对应的年柱(用于显示大运和流年)
        let gan = nz.substr(0,1);
        let zhi = nz.substr(1,1); //分解干、支
        let ganIndex;
        let zhiIndex;
        ganIndex = Gan.indexOf(gan); //查找干所在索引
        zhiIndex = Zhi.indexOf(zhi); //查找支所在索引 
        let ganArr = []; //存干  
        let zhiArr = []; //存支
        let liunian = []; //存流年
        for(let i=0;i<110;i++){
            ganArr.push(Gan[(ganIndex++)%10]);
            zhiArr.push(Zhi[(zhiIndex++)%12]);
        }
        //拼接流年
        for(let i=0;i<ganArr.length;i++){
            liunian.push({
                nian: ganArr[i]+zhiArr[i],
                sui: i+1,
                year:(year-0)+i
            });
        }
        return liunian;
    },
    //计算起运时间  
    calcQiyun(year,month,day,hour,minute,nz,sex,bzInfo){
        let ngIndex = Gan.indexOf(nz.substr(0,1)); //判定年柱阴阳
        //判断公历年是否是闰年
        let isLeapYear = (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0); 
        //阳年男或阴年女正推
        //计算要找第几个节令
        let jieNum = month*2 - 1; //当月是第几个节令
        let jieqiMs = Date.parse(queryJQ(year,jieNum)); //当月节令毫秒值
        let ryMs = Date.parse(year+"-"+month+"-"+day+" "+hour+":"+minute+":"+"00");
        if((ngIndex%2==0&&sex==1) || (ngIndex%2==1&&sex==0)){ //阳年男或阴年女
            if(jieqiMs>ryMs){
                return (jieqiMs-ryMs);  //多少毫秒后是节令
            }else if(jieqiMs<=ryMs){
                if(month<12){ //去找下一个月的节令
                    jieNum = jieNum + 2; 
                }else{ //如果是12月
                    jieNum = 1;
                    year=parseInt(year)+1;
                }
                let nextMs = Date.parse(queryJQ(year,jieNum)); //下个节令毫秒
                return (nextMs - ryMs); //距离多久起运（毫秒）
            }
        }else if((ngIndex%2==1&&sex==1) || (ngIndex%2==0&&sex==0)){ //阴男或阳女
            if(jieqiMs>ryMs){ //节令在日后面
                if(month>1){ //去找前一个月月令
                    jieNum = jieNum -2;
                }else{
                    jieNum = 23;
                    year = year-1;
                }
                let prevMs = Date.parse(queryJQ(year,jieNum)); //上个节令毫秒
                return (jieqiMs-ryMs);
            }else if(jieqiMs<ryMs){
                return (ryMs-jieqiMs); //距离多久起运（毫秒）
            }
        }
    },

    //判断五行
    calcWuXing(gan){
    	let wux="";
        if(gan=="甲"||gan=="乙") wux="木";
        if(gan=="丙"||gan=="丁") wux="火";
        if(gan=="戊"||gan=="己") wux="土";
        if(gan=="庚"||gan=="辛") wux="金";
        if(gan=="壬"||gan=="癸") wux="水";
        return wux;
    },
    //推算十神 传参干和日元
    calcShiShen(gan,ry){  
        let ryIndex = Gan.indexOf(ry);
        let gIndex = Gan.indexOf(gan);
        let shishen = "";
        // {
            // if(ryIndex-gIndex==0) shishen="比";
            // if(Gan[(ryIndex+2)%10]==gan) shishen="食";
            // if(Gan[(ryIndex+4)%10]==gan) shishen="才";
            // if(Gan[(ryIndex+6)%10]==gan) shishen="殺";
            // if(Gan[(ryIndex+8)%10]==gan) shishen="梟";
            // if(ryIndex%2==0){
            //     if(Gan[(ryIndex+1)%10]==gan) shishen="劫";
            //     if(Gan[(ryIndex+3)%10]==gan) shishen="傷";
            //     if(Gan[(ryIndex+5)%10]==gan) shishen="財";
            //     if(Gan[(ryIndex+7)%10]==gan) shishen="官";
            //     if(Gan[(ryIndex+9)%10]==gan) shishen="印";
            // }
            // if(ryIndex%2==1){
            //     if(Gan[(ryIndex+1)%10]==gan) shishen="傷";
            //     if(Gan[(ryIndex+3)%10]==gan) shishen="財";
            //     if(Gan[(ryIndex+5)%10]==gan) shishen="官";
            //     if(Gan[(ryIndex+7)%10]==gan) shishen="印";
            //     if(Gan[(ryIndex+9)%10]==gan) shishen="劫";
            // }
        // }
        if(ryIndex-gIndex==0) shishen="比";
        if(ryIndex%2==0){
            if(ryIndex-gIndex==-1) shishen="劫";
            if(ryIndex-gIndex==-2||ryIndex-gIndex==8) shishen="食";
            if(ryIndex-gIndex==-3||ryIndex-gIndex==7) shishen="傷";
            if(ryIndex-gIndex==-4||ryIndex-gIndex==6) shishen="才";
            if(ryIndex-gIndex==-5||ryIndex-gIndex==5) shishen="財";
            if(ryIndex-gIndex==-6||ryIndex-gIndex==4) shishen="殺";
            if(ryIndex-gIndex==-7||ryIndex-gIndex==3) shishen="官";
            if(ryIndex-gIndex==-8||ryIndex-gIndex==2) shishen="梟";
            if(ryIndex-gIndex==-9||ryIndex-gIndex==1) shishen="印";
        }
        if(ryIndex%2==1){
            if(ryIndex-gIndex==1) shishen="劫";
            if(ryIndex-gIndex==2||ryIndex-gIndex==-8) shishen="梟";
            if(ryIndex-gIndex==3||ryIndex-gIndex==-7) shishen="印";
            if(ryIndex-gIndex==4||ryIndex-gIndex==-6) shishen="殺";
            if(ryIndex-gIndex==5||ryIndex-gIndex==-5) shishen="官";
            if(ryIndex-gIndex==6||ryIndex-gIndex==-4) shishen="才";
            if(ryIndex-gIndex==7||ryIndex-gIndex==-3) shishen="財";
            if(ryIndex-gIndex==8||ryIndex-gIndex==-2) shishen="食";
            if(ryIndex-gIndex==9||ryIndex-gIndex==-1) shishen="傷";
        }
        return shishen;
    },
}
module.exports = BZ;