const { Packet, UDPClient } = require("dns2");


const DOMAIN =
"proxyip.etoj.run.place";


const TYPES = [
    "",
    "-res",
    "-edu",
    "-mob"
];


const COUNTRIES = [
"AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR",
"AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE",
"BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ",
"BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD",
"CF","CG","CH","CI","CK","CL","CM","CN","CO","CR",
"CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM",
"DO","DZ","EC","EE","EG","ER","ES","ET","FI","FJ",
"FK","FM","FO","FR","GA","GB","GD","GE","GF","GH",
"GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU",
"GW","GY","HK","HN","HR","HT","HU","ID","IE","IL",
"IN","IQ","IR","IS","IT","JP","KR","LA","LB","LK",
"LT","LU","LV","MA","MC","MD","ME","MG","MK",
"ML","MM","MN","MO","MP","MT","MU","MV","MX",
"MY","MZ","NA","NC","NE","NG","NL","NO","NP",
"NZ","OM","PA","PE","PH","PK","PL","PT","QA",
"RO","RS","RU","SA","SB","SC","SE","SG","SI",
"SK","SL","SM","SN","SO","SR","SV","SY","TH",
"TR","TW","TZ","UA","UG","US","UY","UZ","VN",
"WS","ZA","ZM","ZW"
];



// DNS服务器轮换

const DNS_SERVERS=[
"1.1.1.1",
"8.8.8.8",
"9.9.9.9",
"208.67.220.220"
];


let dnsIndex=0;



async function resolve(name){


const server =
DNS_SERVERS[
dnsIndex++ % DNS_SERVERS.length
];


try{


const dns =
UDPClient({
dns:server
});


const response =
await dns(
Packet.createQuery({
questions:[
{
name,
type:"A"
}
]
})
);


return response.answers
.filter(
x=>x.type===1
)
.map(
x=>x.address
);


}catch(e){

return [];

}

}



exports.handler = async function(){

const tasks=[];


for(const c of COUNTRIES){

for(const t of TYPES){


tasks.push({

domain:
`${c.toLowerCase()}${t}.${DOMAIN}`,

country:c,

type:
t ?
t.substring(1)
:
"dc"

});


}

}



const result=[];


// 限制并发

const LIMIT=20;


for(
let i=0;
i<tasks.length;
i+=LIMIT
){


const batch =
tasks.slice(
i,
i+LIMIT
);



const data =
await Promise.all(

batch.map(async item=>{


const ips =
await resolve(
item.domain
);


if(!ips.length)
return null;


return {

domain:item.domain,

country:item.country,

type:item.type,

ips

};


})

);



result.push(
...data.filter(Boolean)
);


}



return {

statusCode:200,

headers:{
"content-type":
"application/json",

"cache-control":
"public,max-age=300"
},

body:
JSON.stringify(result)

};


};
