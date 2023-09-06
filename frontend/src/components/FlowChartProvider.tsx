import { ReactFlowProvider } from "reactflow";
import FlowChart from "./FlowChart";

function FlowChartProvider() {
  return (
    <ReactFlowProvider>
      <FlowChart />
    </ReactFlowProvider>
  );
}

export default FlowChartProvider;
