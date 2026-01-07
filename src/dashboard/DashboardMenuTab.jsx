import { API } from "../common/API";
import DashboardTab from "./DashboardTab";

export default class DashboardMenuTab extends DashboardTab{
    static menuPromise;
    constructor(props){
        super(props);
        this.state={menu:false};
        if(!DashboardMenuTab.menuPromise){
            DashboardMenuTab.menuPromise = API(`/place/menu/${this.place.id}`);
        }
        DashboardMenuTab.menuPromise.then(r=>this.setState({menu:r.data}));
    }
    emulator(){
        if(!this.state.menu)return <div>Loading....</div>;
        //return <MenuComponent menu={this.state.menu}/>;
    }
    render(){
        return <div className="menu-tab">
            <div><h1 style={{textAlign:"center"}}>Προβολή πελάτη</h1></div>
            <hr/>
            <div className="emulator-wrapper">
                <div className="mobile-emulator">
                    {this.emulator()}
                </div>
                <div className="pc-emulator">
                    {this.emulator()}
                </div>
            </div>
        </div>;
    }
}