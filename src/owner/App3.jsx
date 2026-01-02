import ListenerApp, { TableSessionManager } from "./ListenerAppBase";
import WaiterManager from "./WaiterManagement";

function NoFullscreen(){
    return <div>
        <div>Προτείνεται να εισέλθετε σε πλήρη οθόνη για καλύτερη ορατότητα και λειτουργικότητα</div>
        <div><button className="green-wide-button" onClick={()=>document.querySelector("#root").requestFullscreen()}>Πλήρης οθόνη</button></div>
    </div>;
}

//[{code: "S002", count: 3, ingredients: ["λάχανο", "μαρούλι", "ντομάτα", "αγγούρι"]}]
let popupOpened=false;
export default class OwnerApp3 extends ListenerApp{
    #zoom=5;
    zoomSensitivity = 1;
    
    static instance;
    constructor(props){
        super(props);
        
        this.state = {
            ...this.state,
            pad:this.#zoom
        }
        this.wsh.on("auth-error",()=>location.replace("/auth/login"));
        OwnerApp3.instance = this;
    }
    zoom(dY){
        const newZoom = this.#zoom+dY;
        if(newZoom<0||newZoom>40)return;

        this.#zoom = newZoom;
        this.setState({pad:this.#zoom});
    }
    render(){
        return (
            <div className="listener-app-3">
                <div className="listener-layout-view listener-top-center" style={{padding:`0 ${this.state.pad}%`}} onWheel={e=>this.zoom(e.deltaY*this.zoomSensitivity/100)}>
                    <div className="layout-edit-btn-wrapper">
                        <a href={`/dashboard/${this.placeId}/edit-layout`} target="_blank" rel="noopener noreferrer" className="no-default">Επεξεργασία κάτοψης</a>
                    </div>
                    {this.layoutSVG||
                        <div style={{
                            textAlign:"center",
                            fontSize:"3em",
                            justifyContent:"center",
                            display:"flex",
                            flexDirection:"column",
                            height:"100%"}}>
                                Φόρτωση κάτοψης...
                        </div>
                    }
                </div>
                <div className="listener-full-left">
                    <WaiterManager key={this.sess_changes}/>
                </div>
                <div className="listener-bottom-center" style={{borderTop:"1px solid"}}>
                    <TableSessionManager table={this.state.selectedTable}/>
                </div>
                <div className="listener-full-right">
                    <NoFullscreen/>
                </div>
            </div>
        );
    }
}
window.LiveViewApp = OwnerApp3;