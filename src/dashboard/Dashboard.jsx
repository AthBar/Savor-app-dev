//The main dashboard entry point for a specific place

import React from "react";
import DashboardMainTabRouter from "./DashboardMainTabRouter";
import DashboardSidebar from "./DashboardSidebar";
import { API } from "../common/API";
import { useState } from "react";
import { createContext } from "react";
import { useContext } from "react";
import { useEffect } from "react";

const DashboardContext = createContext();
export const useDashboard = ()=>useContext(DashboardContext);

export default function Dashboard({placeId}){
    const [placeLoaded,setPlaceLoaded] = useState(false);
    const [permitted,setPermitted] = useState(null);
    const [place,setPlace] = useState({});

    useEffect(()=>{
        API(`/dashboard/${placeId}/permission`).then(r=>setPermitted(r.success));
        API(`/place/view/${placeId}`).then(r=>{
            if(!r.success)return setPermitted(false);

            delete r.success;

            setPlace(r);
            setPlaceLoaded(true);
        });
    },[]);

    if(!permitted)return <div>Δεν έχετε άδεια διαχείρησης αυτής της επιχείρησης <br/>{place.code}/{place.reason}</div>;
    return  <DashboardContext.Provider value={{
                currency: p=>(p/100||0).toFixed(2)+"€",
                place,
            }}>
            <div className="dashboard-editor-wrapper">
                <DashboardSidebar/>
                <div className="dashboard-tab-wrapper">
                    {placeLoaded?<DashboardMainTabRouter/>:<div style={{fontSize:"25px",fontWeight:"bold"}}>Φόρτωση...</div>}
                </div>
            </div>
            </DashboardContext.Provider>
}