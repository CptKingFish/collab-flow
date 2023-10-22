import { useEffect, useState } from "react";
import { socket } from "./socket";
import FlowChartProvider from "../components/FlowChartProvider";


export default function Home() {
  const [wsConnected, setWsConnected] = useState(socket.connected);
  // const [updatedChart, setUpdatedChart] = useState({});

  useEffect(() => {
    function onConnect() {
      setWsConnected(true);
      console.log("connected to websocket");
    }

    function onDisconnect() {
      setWsConnected(false);
    }

    // function onChartUpdated({ nodes, edges }) {
    //   setUpdatedChart({ nodes, edges });
    // }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    // socket.on("chart-updated", onChartUpdated);
    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // socket.off("chart-updated", onChartUpdated);
    };

  }, []);


  return <>
    <div className="h-screen w-screen bg-white text-black">

      <FlowChartProvider wsConnected={wsConnected} />
      

    </div>
  </>
}
