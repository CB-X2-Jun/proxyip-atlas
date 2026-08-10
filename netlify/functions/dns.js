const { Packet, UDPClient } = require("dns2");


const DOMAIN =
"proxyip.etoj.run.place";


const TYPES=[
    {
        suffix:"",
        name:"DC"
    },
    {
        suffix:"-res",
        name:"Residential"
    },
    {
        suffix:"-edu",
        name:"Education"
    },
    {
        suffix:"-mob",
        name:"Mobile"
    }
];


// ISO 国家代码

const COUNTRIES=[
"AD","AE","AF","AG","AI","AL","AM","AO","AR",
"AT","AU","AZ","BA","BB","BD","BE","BG",
"BH","BI","BJ","BN","BO","BR","BS","BT",
"BW","BY","BZ","CA","CD","CF","CG","CH",
"CI","CL","CM","CN","CO","CR","CU","CY",
"CZ","DE","DJ","DK","DM","DO","DZ","EC",
"EE","EG","ES","ET","FI","FJ","FR","GA",
"GB","GD","GE","GH","GI","GL","GM","GN",
"GR","GT","GU","HK","HN","HR","HT","HU",
"ID","IE","IL","IN","IQ","IR","IS","IT",
"JM","JO","JP","KE","KG","KH","KR",
"KZ","LA","LB","LK","LR","LS","LT",
"LU","LV","MA","MC","MD","ME","MG",
"MK","ML","MM","MN","MO","MT","MU",
"MV","MX","MY","MZ","NA","NG","NI",
"NL","NO","NP","NZ","OM","PA","PE",
"PH","PK","PL","PT","PY","QA","RO",
"RS","RU","SA","SE","SG","SI","SK",
"SN","SO","SR","SV","TH","TJ","TN",
"TR","TW","TZ","UA","UG","US",
"UY","UZ","VE","VN","ZA","ZM","ZW"
];



// DNS轮换

const SERVERS=[
"1.1.1.1",
"8.8.8.8",
"9.9.9.9",
"208.67.220.220",
"1.10.10.10"
];


let pointer=0;



async function resolve(name){

const server =
SERVERS[
pointer++ %
SERVERS.length
];


try{

const dns =
UDPClient({
    dns: server
});


const response =
await dns(name);


return response.answers
.filter(
x =>
x.type === 1
)
.map(
x =>
x.address
);


}catch(e){

console.log(
"DNS failed:",
name,
e.message
);


return [];

}

}




async function scan(){


const tasks=[];


for(const country of COUNTRIES){


for(const type of TYPES){


tasks.push({

country,

type:type.name,

domain:
`${country.toLowerCase()}${type.suffix}.${DOMAIN}`

});


}

}



const result=[];



// 控制并发

for(
let i=0;
i<tasks.length;
i+=20
){


const batch=
tasks.slice(
i,
i+20
);



const data=
await Promise.all(

batch.map(async item=>{


const ips=
await resolve(
item.domain
);



if(!ips.length)
return null;



return item.ips
?
item
:
{
country:item.country,
type:item.type,
domain:item.domain,
ips
};


})

);



result.push(
...data.filter(Boolean)
);


}


return result;

}



exports.handler=async()=>{


const data=
await scan();



return {

statusCode:200,

headers:{
"content-type":
"application/json;charset=utf-8",

"cache-control":
"public,max-age=600"
},

body:
JSON.stringify(data)

};


};
