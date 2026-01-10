import { ConnectionStateVisualizer } from "../common/WshVisuals";
import OwnerApp3 from "../owner/App3";

export default function WatchApp({placeId}){console.log("Watchapp");
    return <div>
        <OwnerApp3 placeId={placeId}/>
    </div>
}