import { useEffect, useState } from "react";
import { LiveTime, TimeSince } from "../common/TimeComponents";
import { useSearchParams } from "react-router";
import { API } from "../common/API";

export default function SessionStarter({placeId,setExists}){
    const [time,setTime] = useState(Date.now());
    const [error,setError] = useState(false);

    async function startPlace(){
        API(`/watch/${placeId}/open`, "POST").then(r=>{
            if (r.success) setExists(true);
            else console.log("error ",r.reason);
        },(e)=>{
            
        });
    }

    useEffect(()=>{
        API(`/place/status/${placeId}`).then(r=>{
            if(!r.success){
                setExists(false);
                setError(r.reason);
            }
        })
    },[]);

    if(error)return <div>
        <div><h1>Υπήρξε ένα πρόβλημα</h1></div>
        <div>Ζητήσατε να παρακολουθήσετε την επιχείρηση με ID "{placeId}", αλλά ο server αποκρίθηκε με το εξής σφάλμα:</div>
        <div>"{error}"</div>
    </div>
    return <div className="fixed-centered">
        <div>
            <h1>Η επιχείρηση δεν είναι ανοιχτή</h1>
            <hr/>
        </div>
        <div>
            Η ώρα είναι <LiveTime/>. Πατήστε το κουμπί για να ξεκινήσετε συνεδρία με την επιχείρηση σας στο Savor
            <hr/>
        </div>
        <div>
            <button className="green-wide-button" onClick={()=>startPlace()}>
                Άνοιγμα
            </button>
        </div>
    </div>
}