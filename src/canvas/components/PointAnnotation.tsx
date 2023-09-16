import React, { useState } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { minMax, dragBoundFunc } from '../utils/index';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';

/**
 *
 * @param {minMaxX} props
 * minMaxX[0]=>minX
 * minMaxX[1]=>maxX
 *
 */

type PointAnnotationProps = {
    points: number[][];//ratio 반영
    isFinished: boolean;
    handlePointDragMove: (evt: KonvaEventObject<DragEvent>) => void;
    handleGroupDragEnd: (evt: KonvaEventObject<DragEvent>) => void;
    work: string;
    deletePolygon: (index: number) => void;
    polygonIndex: number;
    isDragging: boolean;
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
    ratio: number;
    isEnabled: boolean;
    colorCode: string;
}

const PointAnnotation = (props: PointAnnotationProps) => {
    const {
        points,//ratio 반영
        isFinished,
        handlePointDragMove,
        handleGroupDragEnd,
        work,
        deletePolygon,
        polygonIndex,
        isDragging,
        setIsDragging,
        ratio,
        isEnabled,
        colorCode
    } = props;
    const vertexRadius = 5;

    const [stage, setStage] = useState<Stage>();

    const handleGroupMouseOver = (evt: KonvaEventObject<MouseEvent>) => {
        //커서 바꾸기
        console.log("===handleGroupMouseOver===");

        if (!isFinished || (work !== "edit" && work !== "delete")) return;
        if (!evt.target) return;
        if (work === "edit") {
            evt.target.getStage()!.container().style.cursor = 'grab';
        } else if (work === "delete") {
            evt.target.getStage()!.container().style.cursor = 'zoom-out';
        }
        setStage(evt.target.getStage()!);
    }

    const handleGroupMouseOut = (evt: KonvaEventObject<MouseEvent>) => {
        //커서 바꾸기
        evt.target!.getStage()!.container().style.cursor = 'default';
    }

    const [minMaxX, setMinMaxX] = useState([0, 0]) //min and max in x axis
    const [minMaxY, setMinMaxY] = useState([0, 0]) //min and max in y axis

    const handleGroupDragStart = (evt: KonvaEventObject<MouseEvent>) => {
        console.log("***handleGroupDragStart***");

        let arrX = points.map((p) => p[0])
        let arrY = points.map((p) => p[1])
        setMinMaxX(minMax(arrX))
        setMinMaxY(minMax(arrY))
    }
    const groupDragBound = (pos: Vector2d) => {
        console.log("***groupDragBound***");

        let { x, y } = pos;

        const sw = stage!.width();
        const sh = stage!.height();

        if (minMaxY[0] + y < 0) y = -1 * minMaxY[0]
        if (minMaxX[0] + x < 0) x = -1 * minMaxX[0]
        if (minMaxY[1] + y > sh) y = sh - minMaxY[1]
        if (minMaxX[1] + x > sw) x = sw - minMaxX[1]
        return { x, y }
    }

    // const getMousePos = (stage) => {
    //     //마우스 position(ratio=1 기준으로) 가져오기
    //     return [stage.getPointerPosition().x / ratio, stage.getPointerPosition().y / ratio];
    // };

    if (isEnabled === false)
        return (
            <></>
        );

    return (
        <Group
            name="polygon"
            draggable={isFinished && (work === "edit")}
            onDragStart={handleGroupDragStart}
            onDragEnd={handleGroupDragEnd}
            dragBoundFunc={groupDragBound}
            onMouseOver={handleGroupMouseOver}
            onMouseOut={handleGroupMouseOut}
        >
            {
                // false &&
                points.map((point, index) => {
                    //TODO: 좌표 정밀하게 수정 필요
                    //- vertexRadius / 2
                    const x = point[0];
                    const y = point[1];
                    // const startPointAttr =
                    //     index === 0
                    //         ? {
                    //             hitStrokeWidth: 12,
                    //             onMouseOver: handleMouseOverStartPoint,
                    //             onMouseOut: handleMouseOutStartPoint,
                    //             //첫번째는 stroke 있게
                    //             stroke: isFinished ? null : "black",
                    //             strokeWidth: isFinished ? null : 2
                    //         }
                    //         : null;
                    return (
                        <Circle
                            key={index}
                            x={x}
                            y={y}
                            radius={vertexRadius}
                            //원 색깔
                            fill={colorCode}
                            strokeWidth={5}
                            // draggable
                            draggable={isFinished && (work === "edit") && isDragging}
                            onDragMove={handlePointDragMove}
                            dragBoundFunc={(pos) => dragBoundFunc(stage!.width(), stage!.height(), vertexRadius, pos)}
                            onMouseMove={(evt: KonvaEventObject<MouseEvent>) => {
                                if (work === "edit") {
                                    //좌표 수정시에 cursor 변경
                                    evt.target.scale({ x: 1.7, y: 1.7 });
                                    evt.target.setAttr("stroke", "#ffffff00");
                                    // evt.target.stroke("#ffffff00");

                                    stage!.container().style.cursor = 'cell';
                                    setIsDragging(true);
                                }
                            }}
                            onMouseDown={(e) => {
                                //polygon delete 작업
                                if (work === "delete") {
                                    deletePolygon(polygonIndex);
                                    //삭제 후 cursor 되돌려놓기
                                    stage!.container().style.cursor = 'default';
                                }
                            }}
                            onMouseLeave={(evt: KonvaEventObject<DragEvent>) => {
                                if (work === "edit") {
                                    //좌표 수정 후 원래대로 cursor 변경 
                                    evt.target.scale({ x: 1, y: 1 });
                                    evt.target.setAttr("stroke", undefined);
                                    // evt.target.stroke(undefined);

                                    stage!.container().style.cursor = 'default';
                                    setIsDragging(false);
                                }
                            }}
                        // {...startPointAttr}
                        />
                    )
                })}
        </Group>
    )
}

export { PointAnnotation };