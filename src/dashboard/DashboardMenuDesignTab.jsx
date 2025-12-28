import React, { createRef } from "react";
import DashboardTab from "./DashboardTab";
import Dashboard from "./Dashboard";
import { API } from "../common/functions";

class DishSelectionTable extends React.Component{
    master;
    constructor(props){
        super(props);
        this.state={categories:{}};
        this.master=props.master;
    }
    select(selectedMenu){
        this.setState({selectedMenu})
    }
    changed(dish,value){
        console.log(dish,value)
    }
    render(){
        const menu = this.master.state.menus[this.master.state.selectedMenu];console.log(menu)
        if(!menu)return <div>Loading...</div>;
        return <div className="scrolltable menu-design-table">
            <div className="scrolltable-head">
                <div>-</div>
                <div>Όνομα</div>
                <div>Τιμή</div>
                <div>Πληροφορίες</div>
            </div>
            <div className="scrolltable-body">
                {Object.values(this.master.state.categories).map(categoryId=>[
                    <div className="scrolltable-row no-cells" key="head">{categoryId[0].category}</div>,
                    categoryId.map(dish=>
                        <div className="scrolltable-row dense" key={dish.code} onClick={e=>{
                            const el = e.target.parentElement.querySelector("input[type=checkbox]");console.log(e.target,el)
                            if(el&&el!=e.target)return el.checked=!el.checked;
                        }}>
                            <div><input type="checkbox" defaultChecked={menu.dishes.includes(dish.code)} onChange={e=>this.changed(dish,e.target.value)}/></div>
                            <div>{dish.title}</div>
                            <div>{Dashboard.currency(dish.price)}</div>
                            <div>{JSON.stringify(dish.info)}</div>
                        </div>
                    )
                ])}
            </div>
        </div>;
    }
}

export default class DashboardMenuDesignTab extends DashboardTab{
    #tables={};
    #tableClass = <DishSelectionTable master={this} ref={createRef()}/>;
    constructor(props){
        super(props);
        this.state = {
            categories:[],
            menus:{"Κύριο μενού":[], "Κυριακή βράδυ":[]},
            selectedMenu:0
        };
        //Import dishes
        if(!DashboardTab.dishesPromise){
            DashboardTab.dishesPromise = 
            API(`/dashboard/${this.place.id}/dish-list`)
        }
        DashboardTab.dishesPromise.then(r=>{
            const o = {};
            const c = {};
            for(let i of r.data){
                o[i.code]=i;
                if(c[i.category])c[i.category].push(i);
                else c[i.category]=[i];
            }
            this.setState({dishes:o,categories:c})
        });

        //Import menus
        if(!DashboardTab.menusPromise){
            DashboardTab.menusPromise = 
            API(`/dashboard/${this.place.id}/menu-list`);
        }
        DashboardTab.menusPromise.then(r=>this.setState({
            menus:r.menus,
            selectedMenu:r.primary||Object.keys(r.menus)[0].title
        }));
    }
    #mkTable(menuTitle){
        const menu = this.state.menus[menuTitle];
        console.log("mk ",menuTitle,menu.dishes)
        return this.#tables[menuTitle] = 

        <div className="scrolltable menu-design-table">
            <div className="scrolltable-head">
                <div>-</div>
                <div>Όνομα</div>
                <div>Τιμή</div>
                <div>Πληροφορίες</div>
            </div>
            <div className="scrolltable-body">
                {Object.values(this.state.categories).map(categoryId=>[
                    <div className="scrolltable-row no-cells" key="head">{categoryId[0].category}</div>,
                    categoryId.map(dish=>
                        <div className="scrolltable-row dense" key={dish.code} onClick={e=>{
                            const el = e.target.parentElement.querySelector("input[type=checkbox]");
                            if(el&&el!=e.target)return el.checked=!el.checked;
                        }}>
                            <div><input type="checkbox" defaultChecked={menu.dishes.includes(dish.code)}/></div>
                            <div>{dish.title}</div>
                            <div>{Dashboard.currency(dish.price)}</div>
                            <div>{JSON.stringify(dish.info)}</div>
                        </div>
                    )
                ])}
            </div>
        </div>;
    }
    table(menuTitle){console.log("table",menuTitle)
        const menu = this.state.menus[menuTitle];
        if(!menu)return <div>Loading...</div>;

        //Cache sigma moments
        return this.#tables[menuTitle]||this.#mkTable(menuTitle);
    }
    selectMenu(key){
        this.setState({selectedMenu:key});
    }
    menuTab(i){
        const menu = this.state.menus[i];
        return <div 
                onClick={e=>this.selectMenu(i)} 
                className={this.state.selectedMenu==i?"selected":null} 
                key={i}
            >{(menu.info&&menu.info.primary?"⭐ ":"")+i}</div>
    }
    addMenuClicked(e){
        const key = "Νέο μενού";
        this.state.menus[key] = {dishes:["S001"]};
        this.selectMenu(key);
        //this.forceUpdate();
    }
    selector(){
        return [...Object.keys(this.state.menus)
        .map(i=>this.menuTab(i)),
        <div onClick={e=>this.addMenuClicked(e)} key="add">+</div>
        ];
    }
    render(){
        return <div className="menu-design-tab">
            <div>
                <h1 style={{textAlign:"center"}}>Επιλογή μενού για επεξεργασία</h1>
                <hr/>
            </div>
            <div style={
            {
                display:"grid",
                gridTemplateRows:"30px calc(100% - 30px)"
            }}>
                <div className="menu-tag-selector">
                    {this.selector()}
                </div>
                {this.table(this.state.selectedMenu)}
            </div>
            <div className="submit-footer">
                <button>Submit</button>
            </div>
        </div>
    }
}