import React, { createRef } from "react";
import DashboardTab from "./DashboardTab";
import Dashboard, { useDashboard } from "./Dashboard";
import { API } from "../common/API";
import { useState } from "react";
import { useEffect } from "react";


function QRComponent({text,width,height}){
    const [dataURL,setDataUrl] = useState(null);

    useEffect(()=>{
        if(!QRComponent.module)QRComponent.module = import('https://cdn.jsdelivr.net/npm/@cheprasov/qrcode/+esm').then(r=>r.default);
        QRComponent.module.then(r=>{
            setDataUrl(new r.QRCodeSVG(text).toDataURL());
        });
    },[]);

    if(!QRComponent.module)return <div>Loading...</div>;
    return <img src={dataURL} width={width} height={height}/>
}


let URLPromise;
export default function DashboardQrTab({placeId}){
    const [failure,setFailure] = useState(false);
    const [loaded,setLoaded] = useState(false);
    const [URLs,setURLs] = useState({});
    const {place} = useDashboard();

    if(!URLPromise){
        URLPromise = 
        API(`/dashboard/${place.id}/urls`);
    }
    URLPromise.then(r=>{
        setLoaded(true);
        if(!r.success)return setFailure("Ο API server δεν απάντησε επιτυχώς: "+r.reason);
        setURLs(r.URLs);
    });

    if(!loaded)return <div>Φόρτωση</div>;
    if(failure)return <div>Κάτι πήγε στραβά: {failure}</div>;

    const keys = Object.keys(URLs);
    return <div className="qr-tab">
        <div>
            <h1>Οι κωδικοί QR ανα τραπέζι σας:<a onClick={()=>print()}>Εκτύπωση</a></h1>
            <hr/>
        </div>
        <div className="qr-list-container">
            {keys.length>0?keys.map((r,i)=>
                <div className="qr-wrapper" key={i}>
                    <h2>{r}</h2>
                    <QRComponent text={URLs[r]} width="170"/>
                </div>
            ):"Δεν βρέθηκαν QR"}
        </div>
    </div>;
}