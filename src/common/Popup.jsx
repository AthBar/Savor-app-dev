import { createRoot } from 'react-dom/client';
import { useState } from 'react';

window.currentPopup = null;
window.popupLocked = false;
function Popup(){
    const [popup,setPopup] = useState(null);
    window.popup = (v,id,lock)=>{
        if(window.currentPopup!==id&&window.popupLocked)return;
        window.currentPopup = !!v?(id||true):null;
        window.popupLocked = lock;
        setPopup(!!v?v:null);
    };
    return popup?
            <div key="popup" className="popup-background">
                <div className="popup-wrapper">
                    {popup}
                </div>
            </div>
            :null;
}

const element = document.createElement("div");
element.id = "popup-container";
const ROOT = createRoot(element);
ROOT.render(<Popup/>);

document.body.appendChild(element);