export default function PlaceClosedPage(){
    return <div className="content table-page" style={{padding:"20px"}}>
                <div>
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
                    <h2>Κάτι πήγε στραβά</h2>
                    <hr/>
                </div>
                <p>
                    Δοκιμάστε να (ξανα-) σκανάρετε ένα έγκυρο QR
                </p>
            </div>
}