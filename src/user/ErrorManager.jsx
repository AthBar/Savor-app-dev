import { Route, Routes, useSearchParams } from "react-router";

function RateLimitPage(){
    const [params] = useSearchParams();
    const reason = JSON.parse(params.get("reason"));

    return <div>
        <h2>Σφαλμα: 429 TOO MANY REQUESTS</h2>
        <hr/>
        <p>
            Φαίνεται πως αποστείλατε υπαρβολικά πολλά HTTP αιτήματα σε σχετικά μικρό χρονικό διάστημα. 
            Το Savor δεν αναμένει μεγάλο όγκο αιτημάτων καθώς βασίζεται σε πιο προηγμένες τεχνολογίες για την λειτουργία του
            Live συστήματός του. Αυτό το πρόβλημα πιθανόν να προέκυψε από πολλές επαναφορτώσεις μίας σελίδας, μεγάλη μετακίνηση μεταξύ σελίδων ή άλλων επαναμβανόμενων ενεργειών
        </p>
        <h2>Λύση:</h2>
        <p>
            Πρέπει να περιμένετε μερικά λεπτά για να σας ξαναεπιτραπεί πρόσβαση στον API server.
            Μετά από αυτό θα μπορείτε να ξανασυνδεθείτε χωρίς απολύτως κανένα πρόβλημα.
        </p>
        {reason?.retryAfter?<strong>Ξαναδοκιμάστε μετά από τουλάχιστον {reason.retryAfter} δευτερόλεπτα</strong>:null}
    </div>;
}

export default function ErrorManager(){
    return  <div style={{padding:"15px"}}>
                <Routes>
                    <Route path="rate-limited" element={<RateLimitPage/>}/>
                </Routes>
            </div>
}