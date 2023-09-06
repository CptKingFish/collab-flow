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

function FlowChart() {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  console.log(nodes);
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onUpdateNodeText = useCallback((nodeId, text) => {
    setNodes((nds) =>
      nds.map((nd) => {
        if (nd.id === nodeId) {
          return { ...nd, data: { ...nd.data, label: text } };
        }
        return nd;
      })
    );
  }, []);

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
    },
    [onUpdateNodeText, reactFlowInstance]
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

  //   useEffect(() => {
  //     // check if node-1 is in nodes
  //     // if not, add it
  //     if (nodes.find((nd) => nd.id === "node-1")) return;
  //     const node = {
  //       id: "node-1",
  //       type: "editableNode",
  //       position: { x: 0, y: 0 },
  //       className: "w-[200px] h-[100px]",
  //       data: {
  //         label: "hellofasdf asdf asdf asdf asdf sadf asdf asfsad fasdf",
  //         onUpdateNodeText: onUpdateNodeText,
  //       },
  //     };
  //     setNodes((nds) => [...nds, node]);
  //   }, [nodes, onUpdateNodeText]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <>
      <div className="w-screen h-screen" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
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
