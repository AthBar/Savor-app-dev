import { useNavigate } from "react-router";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import UserApp from "./MainApp";

function AddressCandidate({data,select}){
  const {setAddress} = UserApp.instance.globals;
    const f = function(){
        setAddress(data);
        select(data);
    };
    return <div className="address-candidate" onClick={f}>
        {(data.street&&data.street_number)?<div>{data.street},{data.street_number}</div>:null}
        <div>{data.region.area}, {data.region.city}</div>
    </div>
}

function AddressCandidateList({list, select}){
    return <div className="address-candidate-list">
        {list.map((a,i)=><AddressCandidate key={i} data={a} select={select}/>)}
    </div>;
}

function SearchSVG({color}){
    return <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><path fill={color} d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg>;
}

function AddressInput({onchange}){
    const goToPage = useNavigate();
    return (
        <div className="address-search-wrapper">
            <div><SearchSVG color="#aaa"/></div>
            <input placeholder="Διεύθυνση" onChange={onchange}/>
            <button className="order-from-table-button" onClick={()=>goToPage("/store/destination-selector/select-table")}>Αποστολή σε τραπέζι του μαγαζιού -&gt;</button>
        </div>
    )
}

function HomeAddressSelector({selectFn}){
    const [search, searchChanged] = useState("");
    const [timeout, changeTimeout] = useState(0);
    const [candidates, setCandidates] = useState([]);
    const {cart, address} = UserApp.instance.globals;
    const goToPage = useNavigate();
    useEffect(()=>{
        clearTimeout(timeout);
        if(search.length>=3){
            changeTimeout(
                setTimeout(()=>
                    API("/places","GET",{address:search||"a"}).then(r=>setCandidates(r.data)),
                500)
            );
        }
        else setCandidates([]);
    },[search]);

    function onSelect(addressd){
        selectFn();
    }
    return (
        <div className="address-selector">
            <AddressInput onchange={e=>searchChanged(e.target.value)} />
            <AddressCandidateList list={candidates} select={onSelect} />
            {navigator.geolocation?<button className="auto-detect-button" onClick={()=>goToPage("../destination-selector/auto-detect")}>Αυτόματη ανίχνευση</button>:null}
        </div>
    );
}

export default function AddressPage(){
    const goToPage = useNavigate();
    const destination = UserApp.instance.destination;
    return(
        <div className="content order-page">
            <Topbar previous="../menu"/>
            {destination?<InStoreTableSelector/>:<HomeAddressSelector selectFn={()=>goToPage("../finished")}/>}
        </div>
    )
}