export function currency(price){
    return (price/100||0).toFixed(2)+"€";
}

const API_PORT = 7288;
export const API_ORIGIN = location.protocol+"//"+location.hostname+":"+API_PORT;
export function API(url,method="GET",body={},options={}){
    url = API_ORIGIN+url;
    if(method.trim().toUpperCase()=="GET")url += new URLSearchParams(body).toString();

    const initObj = {method,...options,credentials:"include"};
    if(method.trim().toUpperCase()=="POST"){
        initObj.body = JSON.stringify(body);
        initObj.headers = initObj.headers || {};

        initObj.headers["Content-type"] = "application/json";
    }
    return fetch(url,initObj)
    .then(r=>r.json())
    .catch(e=>{
        return Promise.reject({success:false,error:"Couldn't connect to API server"});
    });
}