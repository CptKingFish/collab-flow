import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import TextUpdaterNode from "./components/TextUpdaterNode";

const nodeTypes = { textUpdater: TextUpdaterNode };

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
function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  console.log(nodes);

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

  useEffect(() => {
    // check if node-1 is in nodes
    // if not, add it
    if (nodes.find((nd) => nd.id === "node-1")) return;
    const node = {
      id: "node-1",
      type: "textUpdater",
      position: { x: 0, y: 0 },
      data: {
        label: "hellofasdf asdf asdf asdf asdf sadf asdf asfsad fasdf",
        onUpdateNodeText: onUpdateNodeText,
      },
    };
    setNodes((nds) => [...nds, node]);
  }, [nodes, onUpdateNodeText]);

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
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <MiniMap />
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
