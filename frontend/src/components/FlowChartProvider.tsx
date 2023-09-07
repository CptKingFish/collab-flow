import { ReactFlowProvider } from "reactflow";
import FlowChart from "./FlowChart";

function FlowChartProvider({
  wsConnected,
  updatedChart,
}: {
  wsConnected: boolean;
  updatedChart: { nodes: any[]; edges: any[] };
}) {
  return (
    <ReactFlowProvider>
      <FlowChart wsConnected={wsConnected} updatedChart={updatedChart} />
    </ReactFlowProvider>
  );
}

export default FlowChartProvider;
