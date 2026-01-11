export default function PlaceClosedPage(){
    return <div className="content table-page" style={{padding:"20px"}}>
                <div>
                    <div style={{width:"100%",display:"flex",justifyContent:"center"}}>
                        <img src="/images/logo.png" style={{width:"50%"}}/>
                    </div>
                    <hr/>
                    <h2>Φαίνεται πως αυτή η επιχείρηση είναι κλειστή</h2>
                    <hr/>
                </div>
                <p>
                    Το Savor προς το παρόν δεν υποστηρίζει προβολή επιχειρήσεων από πελάτες ενώ αυτές είναι κλειστές
                </p>
            </div>
}

export function PlaceNonExistentPage(){
    return <div className="content table-page" style={{padding:"20px"}}>
                <div>
                    <div style={{width:"100%",display:"flex",justifyContent:"center"}}>
                        <img src="/images/logo.png" style={{width:"50%"}}/>
                    </div>
                    <hr/>
                    <h2>Δεν βρέθηκαν δεδομένα QR</h2>
                    <hr/>
                </div>
                <p>
                    Σκανάρετε ένα έγκυρο QR για να ξεκινήσετε
                </p>
            </div>
}