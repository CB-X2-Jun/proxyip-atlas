const DOMAIN="proxyip.etoj.run.place";

const TYPES=["","-res","-edu","-mob"];

const COUNTRIES=[
"AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR",
"AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE",
"BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ",
"BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD",
"CF","CG","CH","CI","CK","CL","CM","CN","CO","CR",
"CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM",
"DO","DZ","EC","EE","EG","ER","ES","ET","FI","FJ",
"FK","FM","FO","FR","GA","GB","GD","GE","GF","GG",
"GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT",
"GU","GW","GY","HK","HM","HN","HR","HT","HU","ID",
"IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE",
"JM","JO","JP","KE","KG","KH","KI","KM","KN","KP",
"KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR",
"LS","LT","LU","LV","LY","MA","MC","MD","ME","MG",
"MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS",
"MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE",
"NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM",
"PA","PE","PF","PG","PH","PK","PL","PM","PN","PR",
"PS","PT","PW","PY","QA","RE","RO","RS","RU","RW",
"SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK",
"SL","SM","SN","SO","SR","SS","ST","SV","SX","SY",
"SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM",
"TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM",
"US","UY","UZ","VA","VC","VE","VG","VI","VN","VU",
"WF","WS","YE","YT","ZA","ZM","ZW"
];


async function resolveDNS(name){

try{

const url=
"https://1.1.1.1/dns-query?"
+new URLSearchParams({
name,
type:"A"
});


const res=await fetch(url,{
headers:{
"accept":"application/dns-json"
}
});


if(!res.ok)
return [];


const json=await res.json();


return (json.Answer||[])
.filter(x=>x.type===1)
.map(x=>x.data);


}catch(e){

return [];

}

}

async function api(){

const tasks=[];


for(const c of COUNTRIES){

for(const t of TYPES){

const domain=
`${c.toLowerCase()}${t}.${DOMAIN}`;


tasks.push({
domain,
country:c,
type:t?t.substring(1):"dc"
});


}

}



const result=[];
const LIMIT=50;


for(let i=0;i<tasks.length;i+=LIMIT){

const batch=tasks.slice(i,i+LIMIT);


const data=await Promise.all(
batch.map(async x=>{

const ips=await resolveDNS(x.domain);


if(!ips.length)
return null;


return {
domain:x.domain,
country:x.country,
type:x.type,
ips
};


})
);


result.push(
...data.filter(Boolean)
);


}



return Response.json(result,{
headers:{
"Cache-Control":
"public,max-age=300"
}
});


}



export default {

async fetch(request,env,ctx){

    const url=new URL(request.url);


    if(url.pathname==="/api/dns")
        return api();


    return env.ASSETS.fetch(request);

}

};
