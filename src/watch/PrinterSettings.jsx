import { useEffect } from "react";
import { useState } from "react";

function PrinterOption({IP}){
    function select(){
        window.$savor.send("printer-select",IP);
    }
    return <div className="printer-option" style={{padding:"8px",border:"1px solid"}}>
                <div>{IP.toString()}</div>
                <div>
                    <button>Test Print</button>
                </div>
                <div>
                    <button onClick={select}>Επιλογή</button>
                </div>
            </div>
}

export default function POSPrinterSettings(){
    const port = 80;
    const [ips,setIps] = useState([]);

    useEffect(()=>{
        window.$savor.on("subnet-scanned",arr=>setIps(arr));
    })

    function performIPScan(){
        window.$savor.send("subnet-scan",port);
    }

    return  <div>
                <h1>Εκτύπωση</h1>
                <div>
                    <button className="green-wide-button" onClick={performIPScan}>Αναζήτηση για εκτυπωτές</button>
                    <h2>Έγκυρες τοπικές IP:</h2>
                    <div className="printer-list">
                        {ips.map((r,i)=><PrinterOption key={i} IP={r}/>)}
                    </div>
                </div>
            </div>;
}