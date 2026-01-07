import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useParams } from "react-router";
import OwnerApp3 from '../owner/App3.jsx';
import PlaceSelection from '../dashboard/PlaceSelection.jsx';
import PlaceSelector from './PlaceSelector.jsx';
import { useEffect, useState } from 'react';
import { API } from '../common/API.js';
import SessionStarter from './SessionStarter.jsx';

function _WatchApp(){
    const [exists, setExists] = useState(null);
    const { placeId } = useParams();

    useEffect(()=>{
        API(`/place/status/${placeId}`)
        .then(r=>setExists(r.success&&r.exists&&r.isActive))
    },[]);

    if(exists==null)return <div className="content-centered">Loading...</div>;

    return exists?<OwnerApp3 placeId={placeId}/>:<SessionStarter placeId={placeId} setExists={setExists}/>;
}

const ROOT = createRoot(document.querySelector("div#root"));
ROOT.render(<BrowserRouter>
<Routes>
    <Route path="/watch" element={<PlaceSelector/>}/>
    <Route path="/watch/:placeId/" element={<_WatchApp/>}/>
    <Route path="*" element="404"/>
</Routes>
</BrowserRouter>);

window.addEventListener("DOMContentLoaded",()=>{
    if(window.loadingElement)window.loadingElement.style.display = "none";
})