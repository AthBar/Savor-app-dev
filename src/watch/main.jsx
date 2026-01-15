import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useParams } from "react-router";
import PlaceSelector from './PlaceSelector.jsx';
import { useEffect, useState } from 'react';
import { API } from '../common/API.js';
import SessionStarter from './SessionStarter.jsx';
import WatchApp from './WatchPage.jsx';

function _Main(){
    const [exists, setExists] = useState(null);
    const [connectionError, setConnectionError] = useState(false);
    const { placeId } = useParams();

    useEffect(()=>{
        API(`/place/status/${placeId}`)
        .then(
            r=>setExists(r.success&&r.status.exists&&r.status.isActive),
            r=>setConnectionError(true,console.log("err"))
        );
    },[]);

    if(connectionError)return <div className="content-centered">Υπάρχει πρόβλημα με την σύνδεσή σας</div>;
    if(exists==null)return <div className="content-centered">Loading...</div>;

    return exists?<WatchApp placeId={placeId}/>:<SessionStarter placeId={placeId} setExists={setExists}/>;
}

function _WatchApp(){
    return  <BrowserRouter>
            <Routes>
                <Route path="/watch" element={<PlaceSelector/>}/>
                <Route path="/watch/:placeId/" element={<_Main/>}/>
                <Route path="*" element="404"/>
            </Routes>
            </BrowserRouter>
}

const ROOT = createRoot(document.querySelector("div#root"));
ROOT.render(<_WatchApp/>);

window.addEventListener("DOMContentLoaded",()=>{
    const el = document.querySelector("#loading-screen");
    if(el)el.style.display = "none";
})