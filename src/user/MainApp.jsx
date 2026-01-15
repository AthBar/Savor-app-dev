import { Routes, Route } from "react-router";
import CartPage from './Cart.jsx';
import TablePage from './TablePage.jsx';
import  MainPage from './MainPage.jsx';
import TestPage from './TestPage.jsx';
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import GoodbyePage from "./GoodbyePage.jsx";
import UserApp from "./UserApp.js";
import { PlaceInactivePage, PlaceNonExistentPage } from "./PlaceClosedPage.jsx";

function Router(){//Empty string is root, * is unmatched
    //_UserApp.instance.nav = useNavigate();
    return <Routes>
            <Route path="" element={<TablePage/>}/>
            <Route path="menu" element={<MainPage/>}/>
            <Route path="cart" element={<CartPage/>}/>
            <Route path="test" element={<TestPage/>}/>
            <Route path="complete" element={<GoodbyePage/>}/>
            <Route path="*" element={<p>404</p>}/>
        </Routes>
}

function Disabled(){
    return <div style={{
        display:"flex",
        justifyContent:"center",
        flexDirection:"column",
        height:"100%",
        textAlign:"center",
        fontSize:"2em",
    }}>Αυτή η εφαρμογή προορίζεται για κινητά τηλέφωνα σε κάθετο προσανατολισμό (πορτρέτο)</div>
}

function FinishPopup(){
    return  <div className="big-container">
                <div>
                    <h2 style={{textAlign:"center"}}>Τέλος συνεδρίας</h2>
                    <hr/>
                </div>
                <div>
                    <p>
                        Αυτή η συνεδρία τραπεζιού τελείωσε. Ελπίζουμε να είχατε μία ευχάριστη εμπειρία!
                    </p>
                </div>
            </div>
}

const UserAppContext = createContext();
/**
 * @callback OpenPopup
 * @param {import("react").ReactNode} content
 * @returns {void}
 */
/**
 * @typedef {Object} UserAppContextValue
 * @property {UserApp} app
 * @property {OpenPopup} popup
 */
/**
 * @returns {UserAppContextValue}
 */
export const useApp = ()=>useContext(UserAppContext);

export function currency(price){
    return (price/100||0).toFixed(2)+"€";
}

export function UserApp2(){
    const media = useMemo(()=>matchMedia("screen and (orientation: portrait) and (min-width:300px) and (pointer:coarse)"));
    const app = useMemo(()=>new UserApp(),[]);
    const [_popup,setPopup] = useState(null);
    const [finished,setFinished] = useState(false);
    const [popupCanClose,setPopupCanClose] = useState(true);

    useEffect(()=>{app.initialize()},[app]);

    useSyncExternalStore(app.subscription,()=>app.isLoaded);
    useSyncExternalStore(app.subscription,()=>app.isFinished);
    useSyncExternalStore(app.subscription,()=>app.isActive);
    useSyncExternalStore(listener=>media.addEventListener("change",listener),()=>media.matches);

    function onClick(e){
        if(popupCanClose&&e.target&&(e.target.classList.contains("popup-background")||e.target.classList.contains("popup-wrapper")))
            setPopup(null)
    }

    function popup(el,canClose=true){
        setPopup(el);
        setPopupCanClose(canClose);
    }

    if(!app.isLoaded)return <img src="/images/logo.png" id="loading-screen"/>;
    if(!app.destination)return <PlaceNonExistentPage/>;
    if(!app.isActive)return <PlaceInactivePage/>;
    if(!media.matches)return <Disabled/>;
    if(app.isFinished&&!finished){
        popup(<FinishPopup/>,false);
        setFinished(true);
    }
    return <UserAppContext.Provider value={{app,popup}}>
        <Router/>
        {_popup?
            <div className="popup-background" onMouseDown={e=>onClick(e)}>
                <div className="popup-wrapper">
                    {_popup}
                </div>
            </div>
        :null}
    </UserAppContext.Provider>
}