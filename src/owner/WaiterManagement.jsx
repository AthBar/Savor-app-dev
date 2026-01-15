import React, { useContext, useEffect, useState, useSyncExternalStore } from "react";
import ListenerApp from "./ListenerAppBase";
import OwnerApp3, { useWatchApp } from "./App3";

function HideablePin({ pin }) {
  const [visible, setVisible] = useState(true);

  return (
    <span
      onClick={() => setVisible(v => !v)}
      style={{
        backgroundColor: '#ccc',
        color: '#000',
        cursor: 'pointer',
        padding: '2px 4px',
        borderRadius: '3px',
        fontFamily: 'monospace',
        fontSize:"1.25em",
        textAlign:"center",
        userSelect: "none",
        whiteSpace:"nowrap"
      }}
      title={`Κάνετε κλικ για να ${visible?"κρύψετε":"δείτε"} το PIN`}
    >
      {visible?pin:"- - -"}
    </span>
  )
}

function RerollPin({id}){
    const {rerollPin} = useContext(waiterContext);
    return <button style={{
        background: "#ddd",
        borderRadius: "3px",
        textAlign: "center",
        userSelect:"none",
        border:"none",
        cursor:"pointer"
    }} 
    className="content-centered" 
    title="Κάνετε κλικ για να αλλάξετε το PIN"
    onClick={()=>rerollPin(id)}>
        ~
    </button>;
}

function PinDisplay({id,pin}){
    return  <div style={{
                display:"grid",
                gridTemplateColumns:"1fr 25px",
                height:"25px",
                gap:"5px"
            }}>
                <HideablePin pin={pin}/>
                <RerollPin id={id}/>
            </div>
}

function WaiterWidget({self,setName}){
    const {title,pin} = self;
    
    useSyncExternalStore(self.subscription,()=>self.updateCounter);

    if(title==false)
        return <div className="waiter-instance">
            <button className="green-wide-button" onClick={()=>setName(`Υπάλληλος ${Math.floor(self.id)+1}`)}>+</button>
        </div>
    return <div className="waiter-instance">
            <div>Όνομα:</div>
            <input type="text" defaultValue={title} onBlur={e=>setName(e.target.value)}/>
            <div>PIN:</div>
            <PinDisplay id={self.id} pin={pin}/>
            <button className="delete" onClick={()=>setName(false)}/>
    </div>
}

const waiterContext = React.createContext({waiters:{}});

export default function WaiterManager(){
    const app = useWatchApp();
    const [waiters,setWaiters] = useState(app.placeSession.waiters);
    const [rerollTime,setRerollTime] = useState(0);
    app.on("session-refresh",sess=>setWaiters(sess.waiters));

    function rerollPin(id){
        const now = Date.now();
        if(now-rerollTime<1000)return;
        if(!waiters[id])return;
        setRerollTime(now);
        return app.wsh.send({type:"reroll-waiter-pin",id});
    }

    function WhyPopup(){
        return  <div className="big-container">
                    <div><h2 style={{textAlign:"center"}}>Όριο πλήθους προσωπικού</h2></div>
                    <hr/>
                    <p>
                        Το πλήθος του προσωπικού σας περιορίζεται στα <strong>{waiterList.length} μέλη</strong>, αριθμός που προέρχεται από το πλάνο και την συμφωνία σας με το Savor.<br/><br/>
                        Εάν χρειάζεστε περισσότερα μέλη, πρέπει να επικοινωνήσετε με την υποστήριξη για να σας αυξήσει το μέγιστο πλήθος, μαζί με την τιμή του επόμενου μήνα χρέωσής σας
                    </p>
                    <div>
                        <hr/>
                        <button className="green-wide-button" onClick={()=>window.popup?.(false)}>OK</button>
                    </div>
                </div>
    }

    function setName(id){
        return title=>
            app.wsh.send({
                type:"set-waiter",
                id,
                title
            });
    }

    const waiterList = Object.values(waiters);
    return  <waiterContext.Provider value={{waiters,rerollPin}}>
            <div className="waiter-mgmt-page">
                <div>
                    <h2 style={{textAlign:"center"}} key="title">Προσωπικό</h2>
                    <hr/>
                </div>
                <div className="waiter-list" key="list">
                    {waiterList.map((w,i)=>
                        <WaiterWidget self={w} key={i} setName={setName(w.id)}/>
                    )}
                    <div className="waiter-instance" style={{padding:0}}>
                        <button style={{width:"100%",border:"1px solid",borderRadius:"12px",background:"white",cursor:"pointer"}} onClick={()=>window.popup(<WhyPopup/>)}>+</button>
                    </div>
                </div>
                <div className="waiters-bottom">
                    <hr/>
                    &nbsp;Όριο: {waiterList.length} (<span onClick={()=>window.popup(<WhyPopup/>)} style={{cursor:"pointer",color:"blue",textDecoration:"underline"}}>Γιατί;</span>)
                </div>
            </div>
            </waiterContext.Provider>
}