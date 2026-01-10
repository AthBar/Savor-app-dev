import { createContext, useContext } from "react";
import { useState } from "react"
import POSPrinterSettings from "./PrinterSettings";
import { ConnectionStateVisualizer } from "../common/WshVisuals";

const OverlayContext = createContext();

function SettingsMain(){
    
    return <div>
        <POSPrinterSettings/>
    </div>;
    //return [...Array(100)].map((r,i)=><div>Row {i}</div>)
}

function SettingsPopup(){
    const {setPopup} = useContext(OverlayContext);

    return <div className="container settings-page">
        <div>
            <img src="/images/logo.svg" style={{height:"150px",pointerEvents:"none"}}/><br/>
            Χρησιμοποιείτε το Savor Desktop™ v{$savor.version} <br/>
            <sub>© {$savor.copyright}</sub>
            <hr/>
        </div>
        <div className="y-scrollable elegant-scrollbar">
            <SettingsMain/>
        </div>
        <div>
            <hr/>
            <button className="green-wide-button" onClick={()=>setPopup(null)}>
                Εντάξει
            </button>
        </div>
    </div>;
}

export default function Overlay(){
    const [popup,setPopup] = useState(null);

    function PopupCover(){
        if(!popup)return null;
        document.getSelection()?.removeAllRanges()
        return <div 
                    className="backdrop full-size content-centered" 
                    onClick={
                        e=>setPopup(null)
                    }
                >
            <div style={{display:"flex",justifyContent:"center"}}>
                <div onClick={e=>e.stopPropagation()}>{popup}</div>
            </div>
        </div>
    }

    if(!window.$savor)return (
    <div className="fixed-centered" style={{fontSize:"1.5em"}}>
        Δεν βρέθηκε η παγκόσμια μεταβλητή window.$savor. Δεν είναι δυνατή η φόρτωση των εργαλείων της εφαρμογής
    </div>);
    return  <OverlayContext.Provider value={{setPopup}}>
                {popup?<PopupCover key="popup"/>:
                <div className="overlay container right hoverable" style={{bottom:"70px"}} key="settings-button">
                    
                    <div className="print" onClick={()=>setPopup(popup?null:<SettingsPopup/>)}></div>
                </div>}
            </OverlayContext.Provider>
}