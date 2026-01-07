import { useEffect } from "react";
import { useState } from "react";


export default function POSPrinterSettings(){
    const [port,setPort] = useState(9100);
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
                    Port: <input type="number" onChange={e=>setPort(Number(e.target.value))} value={port}/>
                    <button onClick={performIPScan}>Scan subnet</button>
                    <h2>Έγκυρες τοπικές IP:</h2>
                    <div>
                        {ips.map((r,i)=><div key={i}>{r.toString()}</div>)}
                    </div>
                </div>
            </div>;
}