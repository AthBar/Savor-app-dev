import { useEffect } from "react";
import { ListenerClientHandler } from "./ListenerSocket";
import { useState } from "react";
import "./Popup";

function BasicPopup(){
    return  <div className="big-container">
                <div style={{textAlign:"center"}}>
                    <h2>Ασταθής σύνδεση</h2>
                </div>
                <div style={{paddingLeft:"15px"}}>
                    <hr/>
                    <p>
                        Η εφαρμογή Savor κανονικά προσπαθεί να σας επανασυνδέσει στο σύστημα<br/>
                        Όταν και αν αυτό συμβεί, αυτό το παράθυρο θα κλείσει<br/>
                        Μην αγχώνεστε, η συνεδρία της επιχείρησής σας και τα δεδομένα της είναι όλα απολύτως ασφαλή, οι πελάτες και το προσωπικό σας
                        εξακολουθούν να μπορούν να παραγγείλουν, εφ' όσον έχουν σταθερή σύνδεση με τον server.<br/>
                        Όταν ξανασυνδεθείτε όλα τα δεδομένα και τυχόν εξελίξεις θα συγχρονιστούν έγκυρα και αυτόματα<br/>
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
                    <button className="auto-detect-button">Το παράθυρο θα κλείσει όταν αποκατασταθεί η σύνδεση</button>
                </div>
            </div>
}

function OfflinePopup(){
    return  <div className="big-container">
                <div style={{textAlign:"center"}}>
                    <h2>Είστε εκτός σύνδεσης</h2>
                    <hr/>
                </div>
                <div>
                    <p>
                        Φαίνεται πως βρίσκεστε εκτός σύνδεσης. Το Savor χρειάζεται σύνδεση στο διαδίκτυο για να επικονωνήσει με όλες τις συσκευές
                        που απαρτίζουν το σύστημά σας.<br/>
                        Εντοπίσαμε ότι η ίδια η συσκευή σας βρίσκεται εκτός σύνδεσης με το διαδίκτυο, οπότε για αυτό δεν ευθύνεται το Savor. Μην ανησυχείτε,
                        τα δεδομένα σας είναι ασφαλή, οι παραγγελίες μπορούν να εξακολουθήσουν να εισέρχονται εφ'όσον το προσωπικό και οι πελάτες σας 
                        έχουν σύνδεση στο διαδίκτυο, και αν εσείς επανέλθετε, θα δείτε άμεσα και αυτόματα τις εξελίξεις.<br/>
                        Το Savor θα προσπαθήσει να σας επανασυνδέσει την στιγμή που η σύνδεσή σας με το διαδίκτυο αποκατασταθεί.<br/>
                    </p>
                    <p>
                        Στο μεταξύ:
                    </p>
                    <ul>
                        <li>Ελέγξτε τις συνδέσεις δικτύου της συσκευής σας (Καλώδιο ethernet/Wifi)</li>
                        <li>Ελέγξτε την συνδεσιμότητα του router σας με το διαδίκτυο</li>
                        <li>Ελέγξτε την κατάσταση του παρόχου υπηρεσιών διαδικτύου σας (cosmote/vodafone)</li>
                    </ul>
                    <hr/>
                </div>
                <div style={{padding:"10px"}}>
                    <button className="auto-detect-button">Το παράθυρο θα κλείσει όταν αποκατασταθεί η σύνδεση</button>
                </div>
            </div>
}

let disconnectionPopupTimeout;
export function ConnectionStateVisualizer({wsh}){
    if(!(wsh instanceof ListenerClientHandler))return null;
    const [enabled,setEnabled] = useState(true);
    const [status,setStatus] = useState(true);
//window.popup(<DisconnectedPopup/>,"disconnected")
    let DisconnectedPopup = BasicPopup;
    function onclose(e){
        setStatus(false);
        disconnectionPopupTimeout = setTimeout(()=>
            window.popup(<DisconnectedPopup/>,"wsh-disconnect-normal")
        ,2000);
    }

    ConnectionStateVisualizer.disable = ()=>setEnabled(false);
    ConnectionStateVisualizer.enable = ()=>setEnabled(true);

    function onoffline(e){
        DisconnectedPopup = OfflinePopup;

        addEventListener("online",()=>{
            window.popup(false);
            if(DisconnectedPopup==OfflinePopup){
                DisconnectedPopup=BasicPopup
            }
        },
        {once:true});
    }

    function onkick(e){
        console.log("KICKED",e);
    }

    function onconnected(){
        clearTimeout(disconnectionPopupTimeout);
        setStatus(true);

        window.currentPopup.startsWith("wsh-disconnect")?
            window.popup(false)
            :null;
    }

    useEffect(()=>{
        wsh.on("offline",onoffline);
        wsh.on("close",onclose);
        wsh.on("kick",onkick);
        wsh.on("connected",onconnected);

        return ()=>{
            wsh.off("close",onclose);
        };
    },[]);

    if(!enabled)return null;
    return <div className="container overlay bottom right hoverable" style={{padding:"10px",boxShadow:"0 0 5px 5px #0001",background:(status?"white":"#f66")}}>
        <div>{status?
            <span style={{fontWeight:"bold",color:"green"}}>Συνδεδεμένοι</span>:
            <span style={{fontWeight:"bold",color:"white"}}>Αστάθεια σύνδεσης</span>
        }</div>
    </div>
}