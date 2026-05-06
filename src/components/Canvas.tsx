import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Stage, Layer, Rect, Text, Line, Arrow, Group, Transformer
} from 'react-konva';
import Konva from 'konva';
import { useStore } from '../store/useStore';
import { Booth, WalkPath, LayoutObject } from '../types';

const STATUS_COLORS = {
  available: '#22c55e',
  reserved: '#eab308',
  sold: '#ef4444',
};

const OBJECT_EMOJIS: Record<string, string> = {
  entrance: '🚪',
  exit: '🚪',
  stage: '🎭',
  'food-court': '🍔',
  registration: '📋',
  washroom: '🚻',
  'emergency-exit': '🆘',
  seating: '💺',
  pillar: '🏛️',
  wall: '🧱',
};

const PATH_COLORS: Record<string, string> = {
  'main-aisle': '#3b82f6',
  'secondary-aisle': '#8b5cf6',
  'emergency': '#ef4444',
};

interface CanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  onMouseMove?: (x: number, y: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ stageRef, onMouseMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [pathPoints, setPathPoints] = useState<number[]>([]);
  const [isDrawingBooth, setIsDrawingBooth] = useState(false);
  const [boothStart, setBoothStart] = useState<{ x: number; y: number } | null>(null);
  const [boothDraft, setBoothDraft] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const {
    booths, paths, objects, selectedElement, tool, gridEnabled, gridSize, zoom, stagePos,
    darkMode, addBooth, updateBooth, addPath, addObject, setSelectedElement, setTool,
    setZoom, setStagePos, snapToGrid, nextBoothNumber, currentPathStyle, currentPathWidth,
    currentObjectType,
  } = useStore();

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Transformer
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (selectedElement?.kind === 'booth') {
      const stage = stageRef.current;
      const node = stage.findOne(`#booth-${selectedElement.id}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElement, stageRef]);

  const getRelativePos = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    return {
      x: (pointer.x - stagePos.x) / zoom,
      y: (pointer.y - stagePos.y) / zoom,
    };
  }, [stagePos, zoom, stageRef]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.min(Math.max(newScale, 0.1), 5);
    setZoom(clampedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    if (e.evt.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.evt.clientX - stagePos.x, y: e.evt.clientY - stagePos.y });
      return;
    }

    if (e.evt.button !== 0) return;

    const clickedOnEmpty = e.target === stage;
    const pos = getRelativePos(e);

    if (tool === 'booth' && clickedOnEmpty) {
      const snappedX = snapToGrid(pos.x);
      const snappedY = snapToGrid(pos.y);
      setIsDrawingBooth(true);
      setBoothStart({ x: snappedX, y: snappedY });
      setBoothDraft({ x: snappedX, y: snappedY, width: gridSize, height: gridSize });
    }

    if (tool === 'path' && clickedOnEmpty) {
      const snappedX = snapToGrid(pos.x);
      const snappedY = snapToGrid(pos.y);
      setPathPoints(prev => [...prev, snappedX, snappedY]);
    }

    if (tool === 'object' && clickedOnEmpty) {
      const snappedX = snapToGrid(pos.x);
      const snappedY = snapToGrid(pos.y);
      const newObj: LayoutObject = {
        id: crypto.randomUUID(),
        type: currentObjectType,
        x: snappedX - 40,
        y: snappedY - 40,
        width: 80,
        height: 80,
        rotation: 0,
        label: currentObjectType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color: '#6366f1',
        locked: false,
      };
      addObject(newObj);
      setSelectedElement({ kind: 'object', id: newObj.id });
      setTool('select');
    }

    if (tool === 'select' && clickedOnEmpty) {
      setSelectedElement(null);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      setStagePos({
        x: e.evt.clientX - panStart.x,
        y: e.evt.clientY - panStart.y,
      });
      return;
    }
    const pos = getRelativePos(e);
    setCursorPos(pos);
    onMouseMove?.(Math.round(pos.x), Math.round(pos.y));

    if (isDrawingBooth && boothStart) {
      const snappedX = snapToGrid(pos.x);
      const snappedY = snapToGrid(pos.y);
      const x = Math.min(boothStart.x, snappedX);
      const y = Math.min(boothStart.y, snappedY);
      const width = Math.max(Math.abs(snappedX - boothStart.x), gridSize);
      const height = Math.max(Math.abs(snappedY - boothStart.y), gridSize);
      setBoothDraft({ x, y, width, height });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (isDrawingBooth && boothDraft) {
      const newBooth: Booth = {
        id: crypto.randomUUID(),
        x: boothDraft.x,
        y: boothDraft.y,
        width: Math.max(boothDraft.width, 80),
        height: Math.max(boothDraft.height, 60),
        rotation: 0,
        number: `${nextBoothNumber}`,
        status: 'available',
        locked: false,
      };
      addBooth(newBooth);
      setSelectedElement({ kind: 'booth', id: newBooth.id });
      setTool('select');
    }
    setIsDrawingBooth(false);
    setBoothStart(null);
    setBoothDraft(null);
  };

  const handleDblClick = () => {
    if (tool === 'path' && pathPoints.length >= 4) {
      const newPath: WalkPath = {
        id: crypto.randomUUID(),
        points: pathPoints,
        style: currentPathStyle,
        strokeWidth: currentPathWidth,
        color: PATH_COLORS[currentPathStyle],
        arrowEnd: true,
        locked: false,
      };
      addPath(newPath);
      setPathPoints([]);
      setTool('select');
    }
  };

  const handleBoothDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const x = snapToGrid(e.target.x());
    const y = snapToGrid(e.target.y());
    e.target.x(x);
    e.target.y(y);
    updateBooth(id, { x, y });
  };

  const handleBoothTransformEnd = (e: Konva.KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    updateBooth(id, {
      x: snapToGrid(node.x()),
      y: snapToGrid(node.y()),
      width: Math.max(80, snapToGrid(node.width() * scaleX)),
      height: Math.max(60, snapToGrid(node.height() * scaleY)),
      rotation: node.rotation(),
    });
  };

  const gridLines = () => {
    if (!gridEnabled) return null;
    const lines = [];
    const color = darkMode ? '#374151' : '#e5e7eb';
    const w = size.width / zoom + Math.abs(stagePos.x) / zoom + gridSize;
    const h = size.height / zoom + Math.abs(stagePos.y) / zoom + gridSize;
    const offsetX = (-stagePos.x / zoom) % gridSize;
    const offsetY = (-stagePos.y / zoom) % gridSize;
    for (let x = -offsetX; x < w; x += gridSize) {
      lines.push(<Line key={`v${x}`} points={[x, -offsetY, x, h]} stroke={color} strokeWidth={0.5} listening={false} />);
    }
    for (let y = -offsetY; y < h; y += gridSize) {
      lines.push(<Line key={`h${y}`} points={[-offsetX, y, w, y]} stroke={color} strokeWidth={0.5} listening={false} />);
    }
    return lines;
  };

  return (
    <div ref={containerRef} className={`flex-1 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`} style={{ position: 'relative' }}>
      <Stage
        ref={stageRef as React.RefObject<Konva.Stage>}
        width={size.width}
        height={size.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDblClick}
        style={{ cursor: tool === 'booth' ? 'crosshair' : tool === 'path' ? 'crosshair' : tool === 'object' ? 'cell' : isPanning ? 'grabbing' : 'default' }}
      >
        {/* Grid Layer */}
        <Layer listening={false}>
          {gridLines()}
        </Layer>

        {/* Paths Layer */}
        <Layer>
          {paths.map(path => (
            <React.Fragment key={path.id}>
              {path.arrowEnd ? (
                <Arrow
                  id={`path-${path.id}`}
                  points={path.points}
                  stroke={path.color}
                  strokeWidth={path.strokeWidth}
                  fill={path.color}
                  tension={0.3}
                  lineCap="round"
                  lineJoin="round"
                  pointerLength={12}
                  pointerWidth={10}
                  onClick={() => { if (tool === 'select') setSelectedElement({ kind: 'path', id: path.id }); }}
                  opacity={selectedElement?.kind === 'path' && selectedElement.id === path.id ? 1 : 0.8}
                  shadowBlur={selectedElement?.kind === 'path' && selectedElement.id === path.id ? 8 : 0}
                  shadowColor="#3b82f6"
                />
              ) : (
                <Line
                  id={`path-${path.id}`}
                  points={path.points}
                  stroke={path.color}
                  strokeWidth={path.strokeWidth}
                  tension={0.3}
                  lineCap="round"
                  lineJoin="round"
                  onClick={() => { if (tool === 'select') setSelectedElement({ kind: 'path', id: path.id }); }}
                  opacity={selectedElement?.kind === 'path' && selectedElement.id === path.id ? 1 : 0.8}
                />
              )}
              {path.label && path.points.length >= 2 && (
                <Text
                  x={path.points[0]}
                  y={path.points[1] - 16}
                  text={path.label}
                  fill={path.color}
                  fontSize={12}
                  listening={false}
                />
              )}
            </React.Fragment>
          ))}

          {/* Path drawing preview */}
          {pathPoints.length >= 2 && (
            <Line
              points={[...pathPoints, cursorPos.x, cursorPos.y]}
              stroke={PATH_COLORS[currentPathStyle]}
              strokeWidth={currentPathWidth}
              dash={[8, 4]}
              listening={false}
              opacity={0.6}
            />
          )}
        </Layer>

        {/* Objects Layer */}
        <Layer>
          {objects.map(obj => (
            <Group
              key={obj.id}
              id={`object-${obj.id}`}
              x={obj.x}
              y={obj.y}
              rotation={obj.rotation}
              draggable={!obj.locked && tool === 'select'}
              onClick={() => { if (tool === 'select') setSelectedElement({ kind: 'object', id: obj.id }); }}
              onDragEnd={e => {
                const x = snapToGrid(e.target.x());
                const y = snapToGrid(e.target.y());
                e.target.x(x); e.target.y(y);
                useStore.getState().updateObject(obj.id, { x, y });
              }}
            >
              <Rect
                width={obj.width}
                height={obj.height}
                fill={obj.color}
                opacity={0.85}
                cornerRadius={8}
                stroke={selectedElement?.kind === 'object' && selectedElement.id === obj.id ? '#fff' : 'transparent'}
                strokeWidth={2}
                shadowBlur={selectedElement?.kind === 'object' && selectedElement.id === obj.id ? 10 : 4}
                shadowColor={selectedElement?.kind === 'object' && selectedElement.id === obj.id ? '#fff' : 'rgba(0,0,0,0.3)'}
              />
              <Text
                x={0} y={obj.height / 2 - 16}
                width={obj.width}
                text={OBJECT_EMOJIS[obj.type] || '📦'}
                fontSize={24}
                align="center"
                listening={false}
              />
              <Text
                x={0} y={obj.height / 2 + 10}
                width={obj.width}
                text={obj.label}
                fontSize={11}
                fill="#fff"
                align="center"
                fontStyle="bold"
                listening={false}
              />
            </Group>
          ))}
        </Layer>

        {/* Booths Layer */}
        <Layer>
          {booths.map(booth => {
            const isSelected = selectedElement?.kind === 'booth' && selectedElement.id === booth.id;
            const fillColor = booth.color || STATUS_COLORS[booth.status];
            return (
              <Group
                key={booth.id}
                id={`booth-${booth.id}`}
                x={booth.x}
                y={booth.y}
                rotation={booth.rotation}
                draggable={!booth.locked && tool === 'select'}
                onClick={() => { if (tool === 'select') setSelectedElement({ kind: 'booth', id: booth.id }); }}
                onDragEnd={e => handleBoothDragEnd(e, booth.id)}
                onTransformEnd={e => handleBoothTransformEnd(e, booth.id)}
              >
                <Rect
                  width={booth.width}
                  height={booth.height}
                  fill={fillColor}
                  opacity={0.9}
                  cornerRadius={4}
                  stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.2)'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  shadowBlur={isSelected ? 12 : 3}
                  shadowColor={isSelected ? '#fff' : 'rgba(0,0,0,0.3)'}
                />
                <Text
                  x={4} y={6}
                  width={booth.width - 8}
                  text={`#${booth.number}`}
                  fontSize={Math.min(14, booth.width / 5)}
                  fontStyle="bold"
                  fill="#fff"
                  align="center"
                  listening={false}
                />
                {booth.company?.name && (
                  <Text
                    x={4} y={booth.height / 2 - 4}
                    width={booth.width - 8}
                    text={booth.company.name}
                    fontSize={Math.min(11, booth.width / 8)}
                    fill="rgba(255,255,255,0.9)"
                    align="center"
                    ellipsis={true}
                    listening={false}
                  />
                )}
                <Text
                  x={4} y={booth.height - 18}
                  width={booth.width - 8}
                  text={booth.status.toUpperCase()}
                  fontSize={9}
                  fill="rgba(255,255,255,0.7)"
                  align="center"
                  listening={false}
                />
              </Group>
            );
          })}

          {/* Draft booth while drawing */}
          {boothDraft && (
            <Rect
              x={boothDraft.x}
              y={boothDraft.y}
              width={boothDraft.width}
              height={boothDraft.height}
              fill="rgba(34,197,94,0.3)"
              stroke="#22c55e"
              strokeWidth={2}
              dash={[6, 3]}
              listening={false}
            />
          )}

          <Transformer
            ref={transformerRef as React.RefObject<Konva.Transformer>}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 80 || newBox.height < 60) return oldBox;
              return newBox;
            }}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          />
        </Layer>
      </Stage>
    </div>
  );
};
