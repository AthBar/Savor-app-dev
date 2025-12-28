import React, { useState } from "react";
import LayoutSVG from "./LayoutSVG";
import OwnerApp from "./OwnerApp";
import OwnerApp2 from "./App2";

// export function ListenerLayoutView(){
//     return <div className="listener-layout-view">
//             <div className="layout-edit-btn-wrapper">
//                 <a href="/owner/layout" target="_blank" rel="noopener noreferrer" className="no-default">Edit</a>
//             </div>
//             <LayoutSVG placeId={} onTableSelect={console.log}/>
//         </div>
// }

// function TableConnection({table,connected}){
//     return <tr className="connection">
//                 <td>{table}</td>
//                 <td><div className={"connection-status "+(connected?"connected":"disconnected")}></div></td>
//             </tr>
// }
// function TableConnectionList(){
//     const [_,redraw] = useState(0);
//     const mgr = OwnerApp.instance;
//     const sessions = mgr.placeSession.tables;
//     const list = [];

//     for(let i of Object.keys(sessions)){
//         let sess = sessions[i][sessions[i].length-1];
//         list.push(<TableConnection table={i} key={i} connected={sess.connects} />)
//     }

//     const text = mgr.wsh.canSend?"Δεν έχει συνδεθεί ακόμη κανένας πελάτης":"Φόρτωση...";
//     const content = list.length?list:<tr><td style={{fontSize:"0.7em",fontStyle:"italic"}}>{text}</td></tr>;

//     return <table className="connections">
//         <thead>
//             <tr colSpan="2">
//                 <th>
//                 Πελάτες ανα τραπέζι:
//                 </th>
//             </tr>
//         </thead>
//         <tbody>
//             {content}
//         </tbody>
//     </table>
// }

function PendingHistoryRow({type,table,content,accept,decline,highlighted}){
    return <tr className={highlighted?"highlighted":""}>
        <td>{type}</td>
        <td>{table}</td>
        <td>{content}</td>
        <td>
            <div>
                <button onClick={accept}>Αποδοχή</button>
                <button onClick={decline}>Απόρριψη</button>
            </div>
        </td>
    </tr>
}

function MainHistoryRow({type,table,content,deliver,highlighted}){
    return <tr className={highlighted?"highlighted":""}>
        <td>{type}</td>
        <td>{table}</td>
        <td>{content}</td>
        <td>
            <div>
                <button onClick={deliver}>Παράδοση</button>
            </div>
        </td>
    </tr>
}

function SubList({rowList,emptyMessage}){
    let has=false;
    for(let i of rowList)
        if(i){
            has=true;
            break;
        }

    const noPending = <tr>
        <td colSpan={4} className="no-orders" style={{
            textAlign:"center",
            fontSize:"0.9em",
            fontStyle:"italic"
        }}>
            {emptyMessage}
        </td>
    </tr>
    return <table>
            <thead>
                <tr>
                    <th>Τύπος</th>
                    <th>Τραπέζι</th>
                    <th>Περιεχόμενα</th>
                    <th>Επιλογές</th>
                </tr>
            </thead>
            <tbody>
              {has?rowList:noPending}  
            </tbody>
        </table>
}

export class MainHistoryList extends React.Component{
    #mgr=OwnerApp2.instance;
    constructor(props){
        super(props);
        this.state={menu:undefined};

        console.log(OwnerApp2.menuPromise)
        OwnerApp2.menuPromise.then(r=>{
            let menu = r;console.log(r)
            for(let i of r)menu[i.code]=i;
            this.setState({menu});
        })
    }
    componentDidMount(){console.log("mounting nigga",this.#mgr.placeSession.getGlobalOrderList())
        return this.#mgr.placeSession.on("change",()=>this.forceUpdate());
    }
    cartToText(cart){
        if(this.state.menu.length){
            console.log(this.state.menu)
            return cart.map((r,i)=><div key={i}>{this.state.menu[r.code].title}</div>);
        }
    }
    render(){
        if(!this.#mgr.layoutSVG)return <div/>;
        const list = this.#mgr.placeSession.getGlobalOrderList();


        //Define accept/decline functions
        const acc = o=>()=>{this.#mgr.wsh.send({type:"accept-order",table:o.table})};
        const dec = o=>()=>{this.#mgr.wsh.send({type:"reject-order",table:o.table})};
        const del = o=>()=>{this.#mgr.wsh.send({type:"deliver-order",table:o.table})};
        
        return <div className="events">
            <div>
                <div className="table-title">Παραγγελίες σε εκκρεμότητα:</div>
                <SubList rowList={list.map((o,i)=>((o.accepted||o.rejected)?null:
                    <PendingHistoryRow 
                        type={({order:"Παραγγελία",request:"Αίτημα"})[o.type]}
                        key={i}
                        table={o.table}
                        content={this.cartToText(o.cart)}
                        accept={acc(o)}
                        decline={dec(o)}
                    />)
                )} emptyMessage="Καμία παραγγελία σε εκκρεμότητα"
                />
            </div>
            <div>
                <div className="table-title">Παραγγελίες σε εξέλιξη:</div>
                <SubList rowList={list.map((o,i)=>((!o.delivered&&o.accepted)?
                    <MainHistoryRow 
                        type={({order:"Παραγγελία",request:"Αίτημα"})[o.type]}
                        key={i}
                        table={o.table}
                        content={this.cartToText(o.cart)}
                        deliver={del(o)}
                    />
                    :null)
                )} emptyMessage="Καμία παραγγελία ακόμη"
                />
            </div>
        </div>
    }
}

function RightPart(){
    return <div className="right-part">

    </div>
}

export class WorkersList extends React.Component{
    render(){
        return <div className="workers">
                <div className="connection">Θανάσης</div>
                <div className="connection">Μαρία</div>
                <div className="connection">Χριστίνα</div>
                <div className="connection">Κώστας</div>
                <div className="connection">Γιάννης</div>
            </div>;
    }
}


function ConnectionStateDisplay(){
    const mgr = OwnerApp.instance;
    const [_,redraw] = useState(0);

    mgr.wsh.on("connection-change",()=>redraw(_+1));

    let connIcon;
    if(mgr.wsh.connected)connIcon=<div className="connected">Σύνδεση ενεργή</div>;
    else connIcon=<div className="disconnected">Αποσυνδεθήκατε</div>

    return <div className="connection-state-display">
        {connIcon}
    </div>
}
export function ListenerTopbar(){
    return <div className="listener-topbar">
        <ConnectionStateDisplay/>
        <div className="place-name">Picco Bello</div>
        <div className="app-logo">Savor</div>
    </div>
}

