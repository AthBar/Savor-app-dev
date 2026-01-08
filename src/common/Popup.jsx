import { createRoot } from 'react-dom/client';
import { useState } from 'react';

window.currentPopup = null;
function Popup(){
    const [popup,setPopup] = useState(null);
    window.popup = (v,id)=>{
        window.currentPopup = !!v?(id||true):null;
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