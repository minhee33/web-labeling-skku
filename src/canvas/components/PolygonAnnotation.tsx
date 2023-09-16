import React, { useState } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { minMax, dragBoundFunc } from '../utils';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { Stage } from 'konva/lib/Stage';

/**
 *
 * @param {minMaxX} props
 * minMaxX[0]=>minX
 * minMaxX[1]=>maxX
 *
 */

type PolygonAnnotationProps = {
    points: number[][];//ratio 반영
    originalPoints: number[][];//ratio 반영
    changePoints: (index: number, newPointsArray: number[][]) => void;
    deletePolygon: (index: number) => void;
    flattenedPoints: number[];//ratio 반영
    isFinished: boolean;
    handlePointDragMove: (evt: KonvaEventObject<DragEvent>) => void;
    handleGroupDragEnd: (evt: KonvaEventObject<DragEvent>) => void;
    handleMouseOverStartPoint: (evt: KonvaEventObject<MouseEvent>) => void;
    handleMouseOutStartPoint: (evt: KonvaEventObject<MouseEvent>) => void;
    polygonIndex: number;
    work: string;

    isDragging: boolean;
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;

    ratio: number;
    isEnabled: boolean;
    fillEnabled: boolean;
    colorCode: string;
}

const PolygonAnnotation = (props: PolygonAnnotationProps) => {
    const {
        points,//ratio 반영
        originalPoints,//ratio = 1
        changePoints,
        deletePolygon,
        flattenedPoints,//ratio 반영
        isFinished,
        handlePointDragMove,
        handleGroupDragEnd,
        handleMouseOverStartPoint,
        handleMouseOutStartPoint,
        polygonIndex,
        work,

        isDragging,
        setIsDragging,
        ratio,
        isEnabled,
        fillEnabled,
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
            // e.target.getStage().container().style.cursor = 'zoom-out';
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

        let { x, y } = pos
        const sw = stage!.width();
        const sh = stage!.height();

        if (minMaxY[0] + y < 0) y = -1 * minMaxY[0]
        if (minMaxX[0] + x < 0) x = -1 * minMaxX[0]
        if (minMaxY[1] + y > sh) y = sh - minMaxY[1]
        if (minMaxX[1] + x > sw) x = sw - minMaxX[1]
        return { x, y }
    }

    const getMousePos = (stage: Stage) => {
        //마우스 position(ratio=1 기준으로) 가져오기
        return [stage.getPointerPosition()!.x / ratio, stage.getPointerPosition()!.y / ratio];
    };

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
            <Line
                points={flattenedPoints}
                //선 색깔
                stroke={colorCode}
                strokeWidth={3}
                // hitStrokeWidth={1}
                // strokeHitEnabled={false}
                closed={isFinished}

                //투명으로 fill을 해서 fill이 안된 것처럼(-> edit, delete 가능 위함)
                fill={fillEnabled ? colorCode + "66" : "#00ff0000"}//투명도 추가
                fillEnabled={true}
                // fillEnabled={fillEnabled}

                onMouseMove={(e) => {
                    if (work === "delete") {
                        //좌표 추가시에 cursor 변경
                        stage!.container().style.cursor = 'zoom-out';
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
                onMouseLeave={() => {
                    if (work === "delete") {
                        //좌표 수정 후 원래대로 cursor 변경 
                        stage!.container().style.cursor = 'default';
                    }
                }}
            />


            {
                //edit일 떄만 필요
                (isFinished && (work === "edit"))
                &&
                //drag 아닐 때만 띄우기
                !isDragging
                &&
                flattenedPoints.map((point, index) => {
                    if (index % 2 === 1)//홀수면 안봐
                        return null;
                    //일반 선
                    //짝수면 본다
                    let pointsList = flattenedPoints.slice(index, index + 4);
                    if (index === flattenedPoints.length - 2) {
                        //맨 마지막꺼
                        pointsList = flattenedPoints.slice(index, index + 2).concat(flattenedPoints.slice(0, 2));
                    }
                    return (
                        <Line
                            key={index}
                            points={pointsList}
                            //선 색깔
                            stroke={colorCode}
                            // stroke="red"
                            strokeWidth={3}
                            hitStrokeWidth={10}
                            onMouseMove={(e) => {
                                if (work === "edit") {
                                    //좌표 추가시에 cursor 변경
                                    stage!.container().style.cursor = 'copy';
                                }
                            }}
                            onMouseDown={(e) => {
                                if (work === "edit") {
                                    const firstCor = pointsList.slice(0, 2);
                                    const firstIndex = points.findIndex((e) => {
                                        return e[0] == firstCor[0] && e[1] == firstCor[1];
                                    });

                                    //선 사이에 새로운 점 추가
                                    const stage = e.target.getStage()!;
                                    const mousePos = getMousePos(stage);
                                    //TODO: 수정
                                    changePoints(polygonIndex, [...originalPoints.slice(0, firstIndex + 1),
                                        mousePos,
                                    ...originalPoints.slice(firstIndex + 1)]);

                                }
                            }}
                            onMouseLeave={() => {
                                if (work === "edit") {
                                    //좌표 수정 후 원래대로 cursor 변경 
                                    stage!.container().style.cursor = 'default';
                                }
                            }}
                        />
                    );
                })
            }


            {
                // false &&
                points.map((point, index) => {
                    //TODO: 좌표 정밀하게 수정 필요
                    //- vertexRadius / 2
                    const x = point[0];
                    const y = point[1];
                    const startPointAttr =
                        index === 0
                            ? {
                                hitStrokeWidth: 12,
                                onMouseOver: handleMouseOverStartPoint,
                                onMouseOut: handleMouseOutStartPoint,
                                //첫번째는 stroke 있게
                                stroke: isFinished ? undefined : "black",
                                strokeWidth: isFinished ? undefined : 2
                            }
                            : null;
                    return (
                        <Circle
                            key={index}
                            x={x}
                            y={y}
                            radius={vertexRadius}
                            //원 색깔
                            fill={colorCode}
                            // draggable
                            draggable={isFinished && (work === "edit") && isDragging}
                            onDragMove={handlePointDragMove}
                            dragBoundFunc={(pos) => dragBoundFunc(stage!.width(), stage!.height(), vertexRadius, pos)}
                            onMouseMove={(e) => {
                                if (work === "edit") {
                                    //좌표 수정시에 cursor 변경
                                    e.target.scale({ x: 1.5, y: 1.5 });
                                    stage!.container().style.cursor = 'cell';
                                    setIsDragging(true);
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (work === "edit") {
                                    //좌표 수정 후 원래대로 cursor 변경 
                                    e.target.scale({ x: 1, y: 1 });
                                    stage!.container().style.cursor = 'default';
                                    setIsDragging(false);
                                }
                            }}
                            {...startPointAttr}
                        />
                    )
                })}
        </Group>
    )
}

export { PolygonAnnotation };