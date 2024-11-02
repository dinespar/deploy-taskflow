"use client";

import React, { useCallback } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    NodeChange,
    EdgeChange,
    Connection,
    Node,
    Edge,
    ReactFlowInstance,
    NodeTypes,
} from '@xyflow/react';
import { useFlow } from '@/providers/flow-provider';
import CustomNode from './custom-node';

export interface CustomNodeData extends Record<string, unknown> {
    icon?: string;
    name?: string;
    description?: string;
}

const nodeTypes: NodeTypes = { customNode: CustomNode };

const Flow: React.FC = () => {
    const { nodes, setNodes, edges, setEdges, setSelectedNode } = useFlow();

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            const updatedNodes = applyNodeChanges(changes, nodes);
            setNodes(updatedNodes);
        },
        [setNodes, nodes]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            const updatedEdges = applyEdgeChanges(changes, edges);
            setEdges(updatedEdges);
        },
        [setEdges, edges]
    );

    const onConnect = useCallback(
        (params: Connection) => {
            const updatedEdges = addEdge(params, edges);
            setEdges(updatedEdges);
        },
        [setEdges, edges]
    );

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            const data: CustomNodeData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const rect = (event.target as HTMLElement).getBoundingClientRect();
            const newNode: Node<CustomNodeData> = {
                id: `${Math.random()}`,
                type: 'customNode',
                position: {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                },
                data: {
                    ...data,
                    name: data.name || 'Default Name',
                },
            };
            console.log('New Node created:', newNode);

            setNodes([...nodes, newNode]);
        },
        [setNodes, nodes]
    );

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }, []);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, [setSelectedNode]);

    return (
        <div className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView={false}
                style={{ height: '100%', width: '100%', color: 'black' }}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
            >
                <Background />
                <Controls position="top-left" style={{ color: 'black' }} />
                <MiniMap position="bottom-left" bgColor="black" />
            </ReactFlow>
        </div>
    );
};

export default Flow;