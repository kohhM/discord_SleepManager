
const Discord = require('discord.js');
const cron = require('node-cron');

//クライアントのインスタンス
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES","GUILD_MEMBERS",'GUILD_VOICE_STATES'] })

const token = 'トークン';

const guild_id = 'ギルドid';

const suiminCH = 'ログ流すtext chのid';
const generalVC = '一般のvc chのid';
var wd_name = "健康推進"; 

var hour = "1";
var min = "0";

var hour_send = "12";
var min_send = "55";

var user_time = {};

    client.on('ready',(membar) =>{
        var StartDate = new Date();
        client.channels.cache.get(suiminCH).send(StartDate.toLocaleString() + " おはようございます！"); 
        client.user.setActivity('みんな',{type:'WATCHING'});     
    })

    client.on('message',message =>{
        if(message.author.bot){
            return;
        }

        var pattern = /!set [0-2][0-9][0-5][0-9]$/;
        //var result = /!set [0-9]{4}/.test(message.content);
        var result = pattern.test(message.content);
        if(result == true){
            var serch = message.content.match(/[0-2][0-9][0-5][0-9]$/).toString();
            console.log("serch >>" + serch);

            if(message.member.permissionsIn(message.channel).has("ADMINISTRATOR")){

                hour = serch.toString().substring(0,2);
                if(hour > 23){
                    message.channel.send("24時以降は00~04のように入力");
                    return;
                }
                min = serch.toString().substring(2);
                message.channel.send(hour + ":" + min + "にはおやすみだよ");

                hour_send = hour;
                min_send = min;

                if(hour < 10){
                    hour = hour.match(/[0-9]$/).toString();
                    hour_send = hour.match(/[0-9]$/).toString();
                }
                if(min < 10){
                    min = min.match(/[0-9]$/).toString();
                    min_send = min.match(/[0-9]$/).toString();
                }

                if(min_send < 5){
                    min_send = (60 + min_send) - 5;
                    if(hour_send > 0){
                        hour_send -= 1;
                    }else{
                        hour_send = 23;
                    }
                }
            }else{
                message.channel.send("管理者権限がないです...");
            }
        }

        if(message.content === "!time"){
            for(var key in user_time){
                var us = client.users.cache.get(key);

                var diff = user_time[key];
                var diff_hour = Math.floor(diff/(60*60));
                var diff_min = Math.floor((diff - (diff_hour * 60 * 60)) / 60);
                var diff_sec = Math.floor((diff - (diff_hour * 60 * 60)) % 60);

                message.channel.send(us.username + " >> " + diff_hour.toString()+":"+diff_min.toString().padStart(2,'0')+":"+diff_sec.toString().padStart(2,'0'));
            }
        }

        if(message.content === "!help"){
            message.channel.send("!help >> コマンド表示");
            message.channel.send("!time >> 累計時間表示");
            message.channel.send("!set HHMM >> おやすみの時間を設定！");
        }
    })

    client.on('voiceStateUpdate',  (oldState,newState) => {
        var newData;
        if(oldState.channelId == undefined && newState.channelId != undefined){
            newDate = new Date();
            
        }
        if(oldState.channelId != undefined && newState.channelId == undefined){
            var oldDate = new Date();
            var diff_time = Math.floor((oldDate.getTime() - newDate.getTime())/1000);
            var diff_hour = Math.floor(diff_time/(60*60));
            var diff_min = Math.floor((diff_time - (diff_hour * 60 * 60)) / 60);
            var diff_sec = Math.floor((diff_time - (diff_hour * 60 * 60)) % 60);

            var hour_log = oldDate.getHours();
            var min_log = oldDate.getMinutes();

            var name = oldState.member.displayName;
            var vcCH_name = oldState.channel.name;

            if(oldState.id.toString() in user_time){
                user_time[oldState.id.toString()] += diff_time;
            }else{
                user_time[oldState.id.toString()] = diff_time;
            }
            

            client.channels.cache.get(suiminCH).send(hour_log.toString().padStart(2,'0') + ":" + min_log.toString().padStart(2,'0') + " に "+name + " が "+ vcCH_name +" を退出しました．\n滞在時間は" + diff_hour.toString().padStart(2,'0')+":"+diff_min.toString().padStart(2,'0')+":"+diff_sec.toString().padStart(2,'0') + "でした．お疲れ様です");
        }
    });

    client.on("guildMemberRemove",member =>{
        if(member.id.toString() in user_time){
            delete user_time[member.id.toString()]
        }
    })

    cron.schedule('* * * */7 * *',() =>{
        //7日ごと
        cron_func3();    
    })
    
    cron.schedule('* '+ min_send + ' ' + hour_send + ' * * *',() =>{
        cron_func2();    
    })
    

    cron.schedule('* '+ min + ' ' + hour + ' * * *',() =>{
        //毎日h:mおき，s m h d m 曜日
        cron_func();      
    });

    async function cron_func(){
        var xxx = client.channels.cache.find(r => r.name === wd_name).members;

        if(xxx.size != 0){
            await client.channels.cache.find(r => r.name === wd_name).delete();
            await client.guilds.cache.get(guild_id).channels.create(wd_name,  { type: 'GUILD_VOICE' , parent: client.guilds.cache.get(guild_id).channels.cache.get(generalVC).parentId})
        }
    }
    
    async function cron_func2(){
        var vc_member = client.channels.cache.find(r => r.name === wd_name).members;

        if(vc_member.size != 0){
            vc_member.forEach(user => client.users.cache.get(user.id).send("もうすぐ時間です"));
        }
    }

    async function cron_func3(){
        client.channels.cache.get(suiminCH).send("今週の記録です\n");
        for(var key in user_time){
            var us = client.users.cache.get(key);

            var diff = user_time[key];
            var diff_hour = Math.floor(diff/(60*60));
            var diff_min = Math.floor((diff - (diff_hour * 60 * 60)) / 60);
            var diff_sec = Math.floor((diff - (diff_hour * 60 * 60)) % 60);

            client.channels.cache.get(suiminCH).send(us.username + " >> " + diff_hour.toString()+":"+diff_min.toString().padStart(2,'0')+":"+diff_sec.toString().padStart(2,'0'));
            user_time[key] = 0;
        }
    }

client.login(token);
