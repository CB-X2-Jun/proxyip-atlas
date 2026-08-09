const DOMAIN = "proxyip.etoj.run.place";


const COUNTRIES = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ
EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU
ID IE IL IM IN IO IQ IR IS IT
JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG UM US UY UZ
VA VC VE VG VI VN VU
WF WS YE YT
ZA ZM ZW
`
.trim()
.split(/\s+/);



const TYPES = [
    "",
    "-res",
    "-edu",
    "-mob"
];



async function resolve(name){

    const url =
    "https://cloudflare-dns.com/dns-query?" +
    new URLSearchParams({
        name,
        type:"A"
    });


    const r = await fetch(url,{
        headers:{
            accept:"application/dns-json"
        }
    });


    if(!r.ok)
        return [];


    const json = await r.json();


    if(!json.Answer)
        return [];


    return json.Answer
        .filter(x=>x.type===1)
        .map(x=>x.data);

}



function sleep(ms){
    return new Promise(r=>setTimeout(r,ms));
}



export async function onRequest(){

    const result=[];


    for(const country of COUNTRIES){

        for(const type of TYPES){


            const host =
            `${country.toLowerCase()}${type}.${DOMAIN}`;


            let ips=[];


            try{

                ips = await resolve(host);

            }catch(e){}



            if(ips.length){

                result.push({

                    domain:host,

                    country:
                    country.toUpperCase(),

                    type:
                    type.replace("-","") || "dc",

                    ips

                });

            }


            // 防止瞬间请求太猛
            await sleep(10);

        }

    }


    return Response.json(result,{
        headers:{
            "Cache-Control":
            "public,max-age=300"
        }
    });


}
