import { useState } from "react";
import { API } from "../common/API";
import { useDashboard } from "./Dashboard";
import DashboardTab from "./DashboardTab";
import MenuComponent from "../user/Menu";

let menuPromise;
export default function DashboardMenuTab(){
    const {place} = useDashboard();
    const [menu,setMenu] = useState();

    if(!menuPromise)menuPromise = API(`/place/menu/${place.id}`);
    menuPromise.then(r=>setMenu(r.data));

    function Emulator(){
        if(!menu)return <div>Loading....</div>;
        //return <MenuComponent menu={menu}/>;
    }
    return <div className="menu-tab">
        <div><h1 style={{textAlign:"center"}}>Προβολή πελάτη</h1></div>
        <hr/>
        <div className="emulator-wrapper">
            <div className="mobile-emulator">
                <Emulator/>
            </div>
            <div className="pc-emulator">
                <Emulator/>
            </div>
        </div>
    </div>;
}