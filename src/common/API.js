export function currency(price){
    return (price/100||0).toFixed(2)+"€";
}

const API_HOST = import.meta.env.VITE_API_HOST || "api.savor.com.gr";
const API_PROTOCOL = import.meta.env.VITE_HTTP_PROTOCOL || "http";

export const API_ORIGIN = API_PROTOCOL+"://"+API_HOST;

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
        return fetch(url, initObj).then(async r=>{
            if(r.status==429){
                let reason = await r.json();
                reason = (reason instanceof Object)?JSON.stringify(reason):reason;
                const search = encodeURIComponent(reason);
                location.replace(`/error/rate-limited?reason=${search}`);
            }
            else return r.json();
        });
    } catch (e) {console.log("error")
        return await Promise.reject({ success: false, error: "Couldn't connect to API server" });
    }
}