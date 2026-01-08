import { useEffect } from "react";
import { ListenerClientHandler } from "./ListenerSocket";
import { useState } from "react";
import "./Popup";

function DisconnectedPopup(){
    return  <div className="container" style={{width:"50vw"}}>
                <div style={{textAlign:"center"}}>
                    <h2>Αποσυνδεθήκατε</h2>
                </div>
                <div style={{paddingLeft:"15px"}}>
                    <hr/>
                    <p>
                        Η εφαρμογή Savor κανονικά προσπαθεί να σας επανασυνδέσει στο σύστημα<br/>
                        Όταν και αν αυτό συμβεί, αυτό το παράθυρο θα κλείσει<br/>
                        Μην αγχώνεστε, η συνεδρία της επιχείρησής σας και τα δεδομένα της είναι όλα απολύτως ασφαλή, οι πελάτες και το προσωπικό σας
                        εξακολουθούν να μπορούν να παραγγείλουν, εφ' όσον έχουν σταθερή σύνδεση με τον server.<br/>
                        Στο μεταξύ, μπορείτε να κάνετε τα εξής:
                    </p>
                    <ul>
                        <li>Ελέγξτε τις ρυθμίσεις δικτύου της συσκευής σας</li>
                        <li>Επιβεβαιωθείτε οτι δεν πρόκειται για προγραμματισμένη, προειδοποιημένη απώλεια του συστήματος</li>
                    </ul>
                    <p>
                        <strong>Εάν και μόνο</strong> αν είστε <strong>βέβαιοι</strong> ότι η σύνδεσή σας είναι σταθερή, μπορείτε να δοκιμάσετε να&nbsp;
                        <button onClick={()=>location.reload()}>επαναφορτώσετε την σελίδα</button>
                    </p>
                    
                    <hr/>
                    <sub><strong>Προσοχή: </strong>Αν δοκιμάσετε επαναφόρτωση χωρίς να έχετε σύνδεση υπάρχει πιθανότητα να χάσετε εξ'ολοκλήρου πρόσβαση στην εφαρμογή</sub>
                    <hr/>
                    
                </div>
                <div style={{padding:"10px"}}>
                    <button className="auto-detect-button">Κλείσιμο</button>
                </div>
            </div>
}

let disconnectionPopupTimeout;
export function ConnectionStateVisualizer({wsh}){
    if(!(wsh instanceof ListenerClientHandler))return null;
    const [status,setStatus] = useState(true);
//window.popup(<DisconnectedPopup/>,"disconnected")
    function onclose(e){
        console.log("Close ",e);
        setStatus(false);
        disconnectionPopupTimeout = setTimeout(()=>
            window.popup(<DisconnectedPopup/>,"disconnected")
        ,2000);
        wsh.on("connected",()=>
            window.currentPopup=="disconnected"?
                window.popup(false)
                :null
        ,true);
    }

    function onkick(e){
        console.log("KICKED",e);
    }

    useEffect(()=>{
        wsh.on("close",onclose);
        wsh.on("kick",onkick);
        return ()=>{
            wsh.off("close",onclose);
        };
    },[]);

    return <div className="container overlay bottom right hoverable">
        <div>Connected</div>
        <div>{status.toString()}</div>
    </div>
}