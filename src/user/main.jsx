import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useNavigate, useParams } from "react-router";
import UserApp from "./MainApp";
import TestPage from "./TestPage.jsx";
import { useEffect, useState } from 'react';
import { API } from '../common/API.js';
import {PlaceClosedPage,  PlaceInactivePage,  PlaceNonExistentPage } from './PlaceClosedPage.jsx';
import ErrorManager from './ErrorManager.jsx';

function _UserApp(){
    const nav = useNavigate();
    const [exists, setExists] = useState(true);
    const [isActive,setActive] = useState(null);
    const [isExpired,setIsExpired] = useState(null);
    const [d,setDestination] = useState(null);

    useEffect(()=>{
        (async ()=>{
            const destination = await API("/order/destination");
            setDestination(destination.response);
            if(!destination.success)return setExists(false);
            if(destination.response==null)return setIsExpired(true);

            const status = await API(`/place/status/${destination.response.placeId}`)

            setActive(status.success&&status.exists&&status.isActive)
        })()
    },[]);

    if(!exists)return <PlaceNonExistentPage/>;
    if(isActive==null)return <div className="content-centered">Loading...</div>;
    //if(isClosed)return <PlaceClosedPage/>
    return isActive?<UserApp destination={d}/>:<PlaceInactivePage/>;
}

const ROOT = createRoot(document.querySelector("div#root"));
ROOT.render(<BrowserRouter>
<Routes>
    <Route path="/error/*" element={<ErrorManager/>}/>
    <Route path="/test/*" element={<TestPage/>}/>
    <Route path="/store/*" element={<_UserApp/>}/>
</Routes>
</BrowserRouter>);

window.addEventListener("DOMContentLoaded",()=>{
    if(window.loadingElement)window.loadingElement.style.display = "none";
})