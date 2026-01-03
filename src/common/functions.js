export function currency(price){
    return (price/100||0).toFixed(2)+"€";
}
console.log(process.env.TEST);
const API_PORT = import.meta.env.VITE_API_PORT || 7288;
const API_HOST = import.meta.env.VITE_API_HOST || location.hostname;

export const API_ORIGIN = location.protocol+"//"+API_HOST+":"+API_PORT;

console.log(API_ORIGIN);
export async function API(url,method="GET",body={},options={}){
    url = API_ORIGIN+url;
    if(method.trim().toUpperCase()=="GET")url += new URLSearchParams(body).toString();

    const initObj = {method,...options,credentials:"include"};
    if(method.trim().toUpperCase()=="POST"){
        initObj.body = JSON.stringify(body);
        initObj.headers = initObj.headers || {};

        initObj.headers["Content-type"] = "application/json";
    }
    try {
        const r = await fetch(url, initObj);
        return await r.json();
    } catch (e) {
        return await Promise.reject({ success: false, error: "Couldn't connect to API server" });
    }
}