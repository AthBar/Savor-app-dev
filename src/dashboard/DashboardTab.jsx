import React from "react";
import Dashboard from "./Dashboard";

//Generic class for dashboard tabs to extend from
//Doesn't really do much but it might do in the future. Helps to have a common ancestor for such common instances
export default class DashboardTab extends React.Component{
    place;
    constructor(props){
        super(props);
        this.place=Dashboard.place;
    }
}