import { BrowserRouter, Route, Routes } from 'react-router';
import { createRoot } from 'react-dom/client';
import OwnerApp from './OwnerApp';


const ROOT = createRoot(document.querySelector("div#root"));
ROOT.render(<BrowserRouter>
<Routes>
    <Route path="/dashboard/*" element={<OwnerApp/>}/>
</Routes>
</BrowserRouter>);
window.addEventListener("DOMContentLoaded",()=>{
    const el = document.querySelector("#loading-screen");
    if(el)el.style.display = "none";
})

export function _start(){
console.log(
  "%cSAV%cÓ%cR",
  "font-size:100px;color:#fff;",
  "font-size:100px;color:#faa;",
  "font-size:100px;color:#fff;"
);
const style2 = "font-size:15px;color:#faa";
console.log(
`%c«Άν κάποιος νομίζει οτι μπορεί να παραβιάσει το σύστημά μου είναι ευπρόσδεκτος να δοκιμάσει» %c     -Θανάσης Μπαρτζώκας

%cΑν κάποιος δεν είναι εδώ για αυτόν τον σκοπό, παρακαλείται να προσέχει τι πρόκειται να εισάγει.
Το Savor δεν περιέχει καμία λειτουργία που να %cαπαιτεί%c την χρήση του console.
Το console έχει την δυνατότητα να αλλάξει την λειτουργία της εφαρμογής σας, να επιτεθεί στο σύστημά μας, αλλά και να κλέψει δεδομένα.
Επομένως αν κάποιος σας πρότεινε να εισάγετε κάτι εδώ, πιθανότατα να έχει κακόβουλες προθέσεις, και σε αυτή την περίπτωση συστήνεται να γίνει αναφορά του.`,
"font-size:15px;color:#f22","font-size: 10px;color:white",style2,"font-size:15px;color:red;text-decoration:underline",style2);
}
_start();