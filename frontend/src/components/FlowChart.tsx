import { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import EditableNode from "./EditableNode";
import DnDMenu from "./DnDMenu";
import { socket } from "../socket";

const nodeTypes = { editableNode: EditableNode };

const initialNodes = [
  {
    id: "1",
    data: {
      label:
        "Hello dsaf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asfas",
    },
    position: { x: 0, y: 0 },
  },
];
const initialEdges = [];
let id = 0;
const getId = () => `dndnode_${id++}`;

function FlowChart({
  wsConnected,
  updatedChart,
}: {
  wsConnected: boolean;
  updatedChart: { nodes: any[]; edges: any[] };
}) {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  console.log(nodes);

  const updateChart = useCallback(() => {
    socket.timeout(5000).emit(
      "chart-updated",
      {
        nodes,
        edges,
      },
      () => {
        // setIsLoading(false);
      }
    );
  }, [edges, nodes]);

  useEffect(() => {
    if (!wsConnected) return;
    // socket.timeout(5000).emit(
    //   "chart-updated",
    //   {
    //     nodes,
    //     edges,
    //   },
    //   () => {
    //     // setIsLoading(false);
    //   }
    // );

    function onChartUpdated({ nodes, edges }) {
      setNodes(nodes);
      setEdges(edges);
    }

    socket.on("chart-updated", onChartUpdated);
  }, [wsConnected]);

  // useEffect(() => {
  //   if (!updatedChart.nodes || !updatedChart.edges) return;
  //   setNodes(updatedChart.nodes);
  //   setEdges(updatedChart.edges);
  // }, [updatedChart]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onUpdateNodeText = useCallback(
    (nodeId, text) => {
      setNodes((nds) =>
        nds.map((nd) => {
          if (nd.id === nodeId) {
            return { ...nd, data: { ...nd.data, label: text } };
          }
          return nd;
        })
      );

      updateChart();
    },
    [updateChart]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let newNode: {
        id: string;
        type: string;
        position: { x: number; y: number };
        className?: string;
        data: {
          label: string;
          onUpdateNodeText?: (nodeId: string, text: string) => void;
        };
      };
      if (type === "editableNode") {
        console.log("chuchcudcudhcs");

        newNode = {
          id: getId(),
          type,
          position,
          className: "w-[200px] h-[100px]",
          data: {
            label: `${type} node`,
            onUpdateNodeText: onUpdateNodeText,
          },
        };
      } else {
        newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node` },
        };
      }

      setNodes((nds) => nds.concat(newNode));

      updateChart();
    },
    [onUpdateNodeText, reactFlowInstance, updateChart]
  );

  const flowKey = "example-flow";
  const { setViewport } = useReactFlow();

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      updateChart();
    },
    [updateChart]
  );

  const onNodesDelete = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      updateChart();
    },
    [updateChart]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      updateChart();
    },
    [updateChart]
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      updateChart();
    },
    [updateChart]
  );

  return (
    <>
      <div className="w-screen h-screen" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <MiniMap />
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <Panel position="top-right">
        <button className="pr-3" onClick={onSave}>
          save
        </button>
        <button onClick={onRestore}>restore</button>
      </Panel>
      <Panel position="top-left">
        <DnDMenu />
      </Panel>
    </>
  );
}

export default FlowChart;
