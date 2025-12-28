import InactiveMenuComponent from "./InactiveMenu";

export default function MenuPage({menu}){
    return <div>
            <h1 style={{textAlign:"center"}}>Κατάλογος:</h1>
            <hr/>
            <InactiveMenuComponent menu={menu}/>
        </div>
}