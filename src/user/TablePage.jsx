import { useNavigate } from "react-router";
import { createRef, useEffect, useState, useSyncExternalStore } from "react";
import { currency, useApp } from "./MainApp";

function TablePageHeader(){
    const {app} = useApp();
    return <div className="table-topbar">
                <div>
                    <div className="place-title">{app.place.name}</div>
                    <div style={{width:"100%",display:"flex",justifyContent:"center",background:"white"}}>
                        <img className="logo" src="/images/logo.png" style={{maxHeight:"30px",}}/>
                    </div>
                </div>
            </div>
}

function CreateOrder({data}){
    const {app} = useApp();
    return <div className="history-group">
                <div className="history-text">Παραγγελία</div>{Object.values(data.cart).map(
            (o,i)=> <div className="history-unit" key={i}>
                    <div className="history-joiner"/>
                    <div className="history-text">{o.count>1?o.count+"x ":null}{app.menu[o.code].title}</div>
                </div>
            )}
            </div>
}

function OrderHistoryUnit({data}){
    return [
        <CreateOrder data={data} key="0"/>,
        data.cancelled?<div className="history-text" key="cancelled">Ακύρωση παραγγελίας (από προσωπικό)</div>:null,
        data.accepted?<div className="history-text" key="accepted">Αποδοχή παραγγελίας</div>:null,
        data.rejected?<div className="history-text" key="rejected">Απόρριψη παραγγελίας</div>:null,
        data.delivered?<div className="history-text" key="deleted">Παράδοση παραγγελίας</div>:null,
    ]
}

export function OrderHistory(){
    const {app} = useApp();

    const scrollRef = createRef();

    //For every update
    useSyncExternalStore(app.subscription,()=>app.updateCounter);

    useEffect(()=>{
        const el = scrollRef.current;
        if(el)el.scrollTo(0,el.scrollHeight);
    });

    if(!app.menu)return <div className="history"/>
    return <div className="history">
                <div className="history-title" style={{textAlign:"center"}}>Σύνολο: {currency(app.total)}</div>
                <div className="history-contents" ref={scrollRef}>
                    {app.tableSession.orders.map((u,i)=><OrderHistoryUnit data={u} key={i}/>)}
                </div>
            </div>
}

function Buttons(){
    const {app} = useApp();

    useSyncExternalStore(app.subscription,()=>app.tableSession);
    useSyncExternalStore(app.subscription,()=>app.canOrder);
    useSyncExternalStore(app.subscription,()=>app.canLeave);

    const nav = useNavigate();
    const orderingOff = !app.canOrder;
    return  <div className="options">
                <div className={"option"+(orderingOff?"":" animating")} onClick={()=>nav("/store/menu")}>
                    {orderingOff?"Περιήγηση στον κατάλογο":"Παραγγελία"}
                </div>
                {app.canLeave?
                <div className="option animating" onClick={()=>app.leave()}>
                    Αποχώρηση
                </div>
                :null}
            </div>
}

function ClosedTablePage(){
    return  <div className="content table-page">
                <TablePageHeader/>
                <div className="table-options">
                    <div>
                    <h1 style={{textAlign:"center"}}>Η επιχείρηση κλείνει</h1>
                    <p>
                        Μπορείτε ακόμη να περιηγηθείτε στον κατάλογο, χωρίς να στείλετε παραγγελία. <br/>
                        Αφού η επιχείρηση κλείσει δεν θα μπορείτε να δείτε τον κατάλογο
                    </p>
                    </div>
                    <div>
                        <hr/>
                        <Buttons/>
                    </div>
                </div>
            </div>
}

function DefaultTablePage(){
    const {app,popup} = useApp();
    const [_,redraw] = useState(0);

    useEffect(()=>{
        const f = ()=>redraw(_+1);
        console.log(app.tableSession);
    },[]);

    const openPaymentPopup = ()=>popup(<PaymentWindow/>);
    return <div className="content table-page">
                <TablePageHeader/>
                <div className="table-options">
                    <div>
                    <h1 style={{textAlign:"center"}}>Τραπέζι {app.tableSession.table}</h1>
                    </div>
                    <OrderHistory/>
                    <Buttons openPaymentPopup={openPaymentPopup}/>
                </div>
            </div>
}

export default function TablePage(){
    const {app} = useApp();

    useSyncExternalStore(app.subscription,()=>app.place.status.closed);
    return app.place.status.closed?<ClosedTablePage/>:<DefaultTablePage/>;
}