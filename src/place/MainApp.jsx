import React from "react";
import { Route, Routes } from "react-router";
import MenuPage from "./MenuPage";

export default class PlaceApp extends React.Component{
    static menuPromise;
    static placePromise;
    constructor(props){
        super(props);
        this.state={
            placeId:props.placeId,
            menu:null
        };
        makePromises(props.placeId);

        PlaceApp.menuPromise.then(menu=>this.setState({menu}))
        window.place = {id:props.placeId}
    }
    render(){
        if(!this.state.placeId.match(/[A-Za-z0-9_-]{36}/))return "Mismatch";
        return <Routes>
            <Route path="menu" element={<MenuPage menu={this.state.menu}/>}/>
        </Routes>;
    }
}

function makePromises(placeId){
    PlaceApp.menuPromise = API(`/place/menu/${placeId}`).then(r=>r.data);
    PlaceApp.placePromise = API(`/place/basic/${placeId}`);
    window.PlaceApp = PlaceApp;
}