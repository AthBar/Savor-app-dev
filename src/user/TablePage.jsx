import { useNavigate } from "react-router";
import React, { createRef, use, useEffect, useRef, useState } from "react";
import UserApp, { currency, useApp } from "./MainApp";
import { PriceInput } from "../common/Form";

function TablePageHeader(){
    const {placeName} = useApp();
    return <div className="table-topbar">
                <div>
                    <div className="place-title">{placeName}</div>
                    <div style={{width:"100%",display:"flex",justifyContent:"center",background:"white"}}>
                        <img className="logo" src="/images/logo.png" style={{maxHeight:"30px",}}/>
                    </div>
                </div>
            </div>
}

function CreateOrder({data}){
    const {menu} = useApp();

    return <div className="history-group">
                <div className="history-text">Παραγγελία</div>{Object.values(data.cart).map(
            (o,i)=> <div className="history-unit" key={i}>
                    <div className="history-joiner"/>
                    <div className="history-text">{o.count>1?o.count+"x ":null}{menu[o.code].title}</div>
                </div>
            )}
            </div>
}

function OrderHistoryUnit({data}){
    const arr = [<CreateOrder data={data} key="0"/>];
    if(data.cancelled)arr.push(<div className="history-text" key="cancelled">Ακύρωση παραγγελίας (από προσωπικό)</div>)
    if(data.accepted)arr.push(<div className="history-text" key="accepted">Αποδοχή παραγγελίας</div>)
    if(data.rejected)arr.push(<div className="history-text" key="rejected">Απόρριψη παραγγελίας</div>)
    if(data.delivered)arr.push(<div className="history-text" key="deleted">Παράδοση παραγγελίας</div>)
    return arr;
}

export function OrderHistory(){
    const [_,_redraw] = useState(0);
    const {tableSession,total,menu} = useApp();

    const scrollRef = createRef();
    const redraw = ()=>_redraw(_+1);

    function sync(prev){
        if(prev)prev.off("change",redraw);
        tableSession.on("change",redraw);
    }

    useEffect(()=>{
        sync();
        UserApp.instance.on("session-refresh",prev=>sync(prev));
    },[]);

    useEffect(()=>{
        const el = scrollRef.current;
        if(el)el.scrollTo(0,el.scrollHeight);
    });

    if(!menu)return <div className="history"/>
    return <div className="history">
                <div className="history-title" style={{textAlign:"center"}}>Σύνολο: {currency(total)}</div>
                <div className="history-contents" ref={scrollRef}>
                    {tableSession.orders.map((u,i)=><OrderHistoryUnit data={u} key={i}/>)}
                </div>
            </div>
}

// export class OrderHistory extends React.Component{
//     #f=()=>this.forceUpdate();
//     #scrollRef = createRef();
//     constructor(props){
//         super(props);
//         this.state = {menu:UserApp.instance.menu};
//     }
//     componentDidMount(){
//         this.#sync();
//         UserApp.instance.on("session-refresh",prev=>this.#sync(prev));

//         const el = this.#scrollRef.current;
//         if(el)el.scrollTo(0,el.scrollHeight);
//     }
//     componentDidUpdate(){
//         const el = this.#scrollRef.current;
//         if(el)el.scrollTo(0,el.scrollHeight);
//     }
//     #sync(prev){
//         if(prev)prev.off("change",this.#f);
//         UserApp.instance.tableSession.on("change",this.#f);
//     }
//     CreateOrder(data,key){
//         return <div className="history-group" key={key}>
//                     <div className="history-text">Παραγγελία</div>{Object.values(data.cart).map(
//                 (o,i)=> <div className="history-unit" key={i}>
//                         <div className="history-joiner"/>
//                         <div className="history-text">{o.count>1?o.count+"x ":null}{this.state.menu[o.code].title}</div>
//                     </div>
//                 )}
//                 </div>
//     }
//     OrderHistoryUnit(data,key){
//         const arr = [this.CreateOrder(data,key)];
//         if(data.cancelled)arr.push(<div className="history-text" key={key+"-canc"}>Ακύρωση παραγγελίας (από προσωπικό)</div>)
//         if(data.accepted)arr.push(<div className="history-text" key={key+"-acc"}>Αποδοχή παραγγελίας</div>)
//         if(data.rejected)arr.push(<div className="history-text" key={key+"-rej"}>Απόρριψη παραγγελίας</div>)
//         if(data.delivered)arr.push(<div className="history-text" key={key+"-del"}>Παράδοση παραγγελίας</div>)
//         return arr;
//     }
//     render(){
//         if(!this.state.menu)return <div className="history"/>
//         return <div className="history">
//                     <div className="history-title" style={{textAlign:"center"}}>Σύνολο: {currency(UserApp.instance.total)}</div>
//                     <div className="history-contents" ref={this.#scrollRef}>
//                         {UserApp.instance.tableSession.orders.map((u,i)=>this.OrderHistoryUnit(u,i))}
//                     </div>
//                 </div>
//     }
// }

function Buttons(){
    const {total,tableSession,canOrder,leave} = useApp();
    const nav = useNavigate();
    const orderingOff = !canOrder;
    return  <div className="options">
                <div className={"option"+(orderingOff?"":" animating")} onClick={()=>nav("/store/menu")}>
                    {orderingOff?"Περιήγηση στον κατάλογο":"Παραγγελία"}
                </div>
                {total<=0&&tableSession.orders.length>0?
                <div className="option animating" onClick={()=>leave()}>
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
                    <p>Μπορείτε ακόμη να περιηγηθείτε στον κατάλογο, χωρίς να στείλετε παραγγελία</p>
                    </div>
                    <div>
                        <hr/>
                        <Buttons/>
                    </div>
                </div>
            </div>
}

function DefaultTablePage(){
    const {tableSession,popup,destination} = useApp();
    const [_,redraw] = useState(0);

    useEffect(()=>{
        const f = ()=>redraw(_+1);
        console.log(tableSession);
        tableSession.on("change",f);
        return ()=>tableSession.off("change",f);
    },[]);

    const openPaymentPopup = ()=>popup(<PaymentWindow/>);
    return <div className="content table-page">
                <TablePageHeader/>
                <div className="table-options">
                    <div>
                    <h1 style={{textAlign:"center"}}>Τραπέζι {destination.table}</h1>
                    </div>
                    <OrderHistory/>
                    <Buttons openPaymentPopup={openPaymentPopup}/>
                </div>
            </div>
}

export default function TablePage(){
    const {tableSession} = useApp();
    return tableSession.closed?<ClosedTablePage/>:<DefaultTablePage/>;
}