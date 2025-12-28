import { useEffect, useRef, useState } from "react";
import UserApp from "./MainApp";

function ChatMessageBar({send}){
    const [message, updateMessage] = useState("");
    const messageRef = useRef("");

    const sendCurrentMessage = ()=>{
        send(messageRef.current);
        updateMessage("");
    }

    useEffect(()=>addEventListener("keydown",e=>{
        if(e.key=="Enter")sendCurrentMessage();
    }),[]) ;
    useEffect(()=>{messageRef.current = message}, [message]);

    return(
        <div className="chat-bottom">
            <input id="chat" type="text" value={message} onChange={e=>updateMessage(e.target.value)}/>
            <div>
                <button className="send-btn" onClick={sendCurrentMessage}>Send</button>
            </div>
        </div>
    );
}

function ChatMessageBox({message, sent}){
    let boxClass = "message-box "+(sent?"sent":"received");
    return (
        <div className="message-section">
            <div className={boxClass}>
                {message}
            </div>
        </div>
    );
}

export default function ChatComponent(){
    const [messages, updateMessages] = useState([
        {text:"Γειά σας! Είμαι ένας ΑΙ σερβιτόρος και γνωρίζω τα πάντα για το μαγαζί Pico Bello. Παρακαλώ πείτε μου τι θα θέλατε!",sent:false},
    ]);
    const messagesRef = useRef([]);
    const chatContainer = useRef(null);
    useEffect(()=>{
        messagesRef.current = messages;
        chatContainer.current.scrollTo(0,chatContainer.current.scrollHeight);
    },[messages]);

    const sendMessage = msg=>{
        UserApp.socket.sendOrderData(msg);
        updateMessages([...messages, {text:msg,sent:true}]);
    }
    return (
        <div className="component">
            <div className="chat-container">
                <div className="chat-main" ref={chatContainer}>
                    {
                        messages.map((m,i)=>(
                            <ChatMessageBox message={m.text} sent={m.sent} key={i}/>
                        ))
                    }
                </div>
                <ChatMessageBar send={sendMessage} messages={messagesRef}/>
            </div>
        </div>
    )
}