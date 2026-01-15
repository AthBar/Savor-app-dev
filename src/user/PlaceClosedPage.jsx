export function PlaceClosedPage(){
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
                    Η επιχείρηση δεν δέχεται νέους
                </p>
            </div>
}

export function PlaceInactivePage(){
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
                    Δεν μπορείτε να δείτε πληροφορίες για αυτή την επιχείρηση αυτή την στιγμή
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