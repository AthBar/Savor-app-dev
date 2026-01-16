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

export function SettingsPopup({close}){
    const ctx = useContext(OverlayContext);
    console.log(ctx)

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
            <button className="green-wide-button" onClick={close}>
                Εντάξει
            </button>
        </div>
    </div>;
}

export default function Overlay({popupFunction}){
    const [errored,setErrored] = useState(false);

    if(errored)return null;
    if(!window.$savor){
        return popupFunction(
            <div className="fixed-centered big-container">
                <h2>Δεν βρέθηκε η παγκόσμια μεταβλητή window.$savor</h2>
                <hr/>
                <div>
                    Δεν είναι δυνατή η φόρτωση των εξωτερικών εργαλείων της εφαρμογής. Παρακαλώ ενημερώστε την υποστήριξη.<br/><br/>
                    Μπορείτε ακόμη να διαχειριστείτε το μαγαζί σας κανονικά όσο αφορά το Savor, αλλά δεν θα μπορέσετε να χρησιμοποιήσετε
                    λειτουργίες που αφορούν την συσκευή σας (και, κατ' επέκταση, άλλες συσκευές). Αυτό συμπεριλαμβάνει την εκτύπωση αποδείξεων/παραγγελιών.
                    <br/><br/>Εαν διαβάζετε αυτό το μήνυμα υπάρχει σίγουρα (99.9%) κάποιο λάθος με την εγκατάστασή σας
                </div>
                <hr/>
                <button className="green-wide-button" onClick={()=>{
                    setErrored(true);
                    popupFunction(null);
                }}>OK</button>
            </div>
        )
    }
    return  <div className="overlay container right hoverable" style={{bottom:"70px"}} key="settings-button">
                <div className="print" 
                    onClick={()=>popupFunction(<SettingsPopup close={()=>popupFunction(null)}/>)}
                />
            </div>
}