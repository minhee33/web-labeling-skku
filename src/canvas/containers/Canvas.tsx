import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import $ from 'jquery';
import { Stage, Layer, Image } from "react-konva";
import '../../css/canvas.scss';
import { useToast } from "../../hooks/useToast";
import { file2base64, file2json, export2jsonzip, make2zipfolder, make2zip } from "../utils/index";
import { PolygonAnnotation, PointAnnotation, LabelPopUp, SelectPopUp, FileItem, WorkItem } from "../components/index";
import { IconButton, DropDown } from "../../component/index";
import { ModelFileList, ParseLabel } from "../../constant/index";

import { KonvaEventObject } from "konva/lib/Node";
import { Stage as StageType } from 'konva/lib/Stage';

//webkitdirectory 사용하기 위해
declare module 'react' {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        // extends React's HTMLAttributes
        directory?: string;
        webkitdirectory?: string;
    }
}

interface ResultInterface {
    points: number[][][];
    labelPoints: ParseLabel[];
    is_done: boolean;
}

interface ResultJsonInterface {
    color?: string;
    label: string;
    points: number[][]
}

interface SizeInterface {
    width: number;
    height: number;
}



const Canvas = () => {
    //현재 작업하고 있는 imageSource, file-list에서의 index
    const [imageSource, setImageSource] = useState<File>();//file
    const [imageIndex, setImageIndex] = useState<number>(0);

    const [image, setImage] = useState<HTMLImageElement>();
    const imageRef = useRef<any>(null);

    const [size, setSize] = useState<SizeInterface>({ width: 0, height: 0 });
    const [position, setPosition] = useState<number[]>([0, 0]);

    //현재 어떤 작업중인지
    const [work, setWork] = useState<string>("create");

    //polygon 수정시 사용
    const [isDragging, setIsDragging] = useState<boolean>(false);

    //현재 사용하고 있는 index (없으면 -1)
    const [curIndex, setCurIndex] = useState<number>(-1);

    /////////////////////////
    //////////PARSE//////////
    /////////////////////////
    const [points, setPoints] = useState<number[][][]>([]);//ratio=1일 때의 정보를 가지고 있음
    const [flattenedPoints, setFlattenedPoints] = useState<number[][]>([]);
    const [labelPoints, setLabelPoints] = useState<ParseLabel[]>([]);//index에 맞게 label 가지고 있음
    const [isMouseOverPoint, setMouseOverPoint] = useState<boolean[]>([]); //default: false
    const [isPolyComplete, setPolyComplete] = useState<boolean[]>([]); //default: false
    //결과 list
    const [resultParseList, setResultParseList] = useState<ResultInterface[]>([]);
    //parse list, filled된 parse list
    const [clickedParseIndex, setClickedParseIndex] = useState<number>(-1);//-1이면 클릭된 거 없음

    ///////////////////////////
    //////////GARMENT//////////
    ///////////////////////////
    const [garmentPoints, setGarmentPoints] = useState<number[][][]>([]);//ratio=1일 때의 정보를 가지고 있음
    const [garmentFlattenedPoints, setGarmentFlattenedPoints] = useState<number[][]>([]);
    const [garmentLabelPoints, setGarmentLabelPoints] = useState<ParseLabel[]>([]);//index에 맞게 label 가지고 있음
    const [isGarmentMouseOverPoint, setGarmentMouseOverPoint] = useState<boolean[]>([]); //default: false
    const [isGarmentPolyComplete, setGarmentPolyComplete] = useState<boolean[]>([]); //default: false
    //결과 list
    const [garmentResultParseList, setGarmentResultParseList] = useState<ResultInterface[]>([]);
    //parse list, filled된 parse list
    const [clickedGarmentParseIndex, setClickedGarmentParseIndex] = useState<number>(-1);//-1이면 클릭된 거 없음

    /////////////////////////////
    //////////KEYPOINTS//////////
    /////////////////////////////
    const [keyPoints, setKeyPoints] = useState<number[][][]>([]);//ratio=1일 때의 정보를 가지고 있음
    //flatten: []
    const [keyLabelPoints, setKeyLabelPoints] = useState<ParseLabel[]>([]);//index에 맞게 label 가지고 있음
    const [isKeyMouseOverPoint, setKeyMouseOverPoint] = useState<boolean[]>([]); //default: false
    //결과 list
    const [keyResultParseList, setKeyResultParseList] = useState<ResultInterface[]>([]);
    //parse list, filled된 parse list
    const [clickedKeyParseIndex, setClickedKeyParseIndex] = useState<number>(-1);//-1이면 클릭된 거 없음



    //NOT USE
    //뒤로가기 기능 위해 past points 배열 사용
    const [pastPoints, setPastPoints] = useState([]);
    const [pastIndex, setPastIndex] = useState(-1);

    //pinch zoom
    const [ratio, setRatio] = useState(1);

    //menu tab index 0(parse), 1(garment), 2(keypoints)
    const [tabIndex, setTabIndex] = useState(0);
    //window tab index 0(labeling)
    const [windowIndex, setWindowIndex] = useState(0);

    //(api로부터 받을) file list
    const [fileList, setFileList] = useState<File[]>([]);//File instance

    //create시에 선택된 label(LabelPopUp 관련)
    const [createdLabel, setCreatedLabel] = useState<ParseLabel>(new ParseLabel());
    //popup 띄우는지
    const [isPopupShown, setIsPopupShown] = useState<boolean>(false);

    //import시에 선택된 type(SelectPopUp 관련)
    const [selectedType, setSelectedType] = useState<number>(-1);//int 저장
    const [isSelectPopupShown, setIsSelectPopupShown] = useState<boolean>(false);

    //export시에 선택된 type(SelectPopUp - export 관련)
    const [selectedExport, setSelectedExport] = useState<number>(-1);//int 저장
    const [isSelectExportPopupShown, setIsSelectExportPopupShown] = useState<boolean>(false);

    //toast
    const successFileToast = useToast("success", '파일들을 성공적으로 가져왔습니다',
        "닫기", () => { });
    const successImportToast = useToast("success", '성공적으로 import했습니다',
        "닫기", () => { });
    const successExportToast = useToast("success", '성공적으로 export했습니다',
        "닫기", () => { });
    const successSaveToast = useToast("success", '성공적으로 저장했습니다',
        "닫기", () => { });

    //gan result
    const [ganResultImg, setGanResultImg] = useState<any>();
    const ganResultImgRef = useRef<HTMLImageElement>(null);


    ///////////////////////////
    //////////GENERAL//////////
    ///////////////////////////
    //tabIndex마다 if문 분기가 힘들어 general함수로 통일
    //points
    const generalPoints = (index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                return points;
            case 1:
                return garmentPoints;
            case 2:
                return keyPoints;
            default:
                return [];

        }
    }
    const setGeneralPoints = (obj: number[][][], index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                setPoints(obj);
                break;
            case 1:
                setGarmentPoints(obj);
                break;
            case 2:
                setKeyPoints(obj);
                break;
        }
    }
    //flattenedPoints
    const generalFlattenedPoints = (index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                return flattenedPoints;
            case 1:
                return garmentFlattenedPoints;
            default:
                return [];
        }
    }
    const setGeneralFlattenedPoints = (obj: number[][], index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                setFlattenedPoints(obj);
                break;
            case 1:
                setGarmentFlattenedPoints(obj);
                break;
        }
    }
    //labelPoints
    const generalLabelPoints = (index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                return labelPoints;
            case 1:
                return garmentLabelPoints;
            case 2:
                return keyLabelPoints;
            default:
                return [];
        }
    }
    const setGeneralLabelPoints = (obj: ParseLabel[], index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                setLabelPoints(obj);
                break;
            case 1:
                setGarmentLabelPoints(obj);
                break;
            case 2:
                setKeyLabelPoints(obj);
                break;
        }
    }
    //isMouseOverPoint
    const isGeneralMouseOverPoint = (index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                return isMouseOverPoint;
            case 1:
                return isGarmentMouseOverPoint;
            case 2:
                return isKeyMouseOverPoint;
            default:
                return [];
        }
    }
    const setGeneralMouseOverPoint = (obj: boolean[], index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                setMouseOverPoint(obj);
                break;
            case 1:
                setGarmentMouseOverPoint(obj);
                break;
            case 2:
                setKeyMouseOverPoint(obj);
                break;
        }
    }
    //isPolyComplete
    const isGeneralPolyComplete = (index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                return isPolyComplete;
            case 1:
                return isGarmentPolyComplete;
            default:
                return [];
        }
    }
    const setGeneralPolyComplete = (obj: boolean[], index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                setPolyComplete(obj);
                break;
            case 1:
                setGarmentPolyComplete(obj);
                break;
        }
    }
    //resultParseList
    const generalResultParseList = (index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                return resultParseList;
            case 1:
                return garmentResultParseList;
            case 2:
                return keyResultParseList;
            default:
                return [];
        }
    }
    const setGeneralResultParseList = (obj: ResultInterface[], index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                setResultParseList(obj);
                break;
            case 1:
                setGarmentResultParseList(obj);
                break;
            case 2:
                setKeyResultParseList(obj);
                break;
        }
    }
    //clickedParseIndex
    const clickedGeneralParseIndex = (index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                return clickedParseIndex;
            case 1:
                return clickedGarmentParseIndex;
            case 2:
                return clickedKeyParseIndex;
            default:
                return -1;
        }
    }
    const setClickedGeneralParseIndex = (obj: number, index?: number) => {
        var realIndex = index ?? tabIndex;
        switch (realIndex) {
            case 0:
                setClickedParseIndex(obj);
                break;
            case 1:
                setClickedGarmentParseIndex(obj);
                break;
            case 2:
                setClickedKeyParseIndex(obj);
                break;
        }
    }

    //////////////////////
    //////EXPORT 관련//////
    //////////////////////
    const exportOneFunction = async () => {
        const fileName = fileList[imageIndex].name.split('.')[0];
        const tmpFileList = [
            {
                //parse
                'content': await createParseJson(0),
                'fileName': fileName + '_p',
                'type': 'json'
            },
            {
                //garment
                'content': await createParseJson(1),
                'fileName': fileName + '_gp',
                'type': 'json'
            },
            {
                //keypoints
                'content': await createParseJson(2),
                'fileName': fileName,
                'type': 'json'
            },
            {
                //image
                'content': fileList[imageIndex],
                'fileName': fileName,
                'type': 'image'
            }
        ];
        export2jsonzip(tmpFileList, fileName);

        successExportToast.showToast();
    }

    const exportAllFunction = async () => {
        const zip = require('jszip')();
        const fileLen = fileList.length;
        for (let i = 0; i < fileLen; i++) {
            const fileName = fileList[i].name.split('.')[0];
            const tmpFileList = [
                {
                    //parse
                    'content': await createParseJson(0),
                    'fileName': fileName + '_p',
                    'type': 'json'
                },
                {
                    //garment
                    'content': await createParseJson(1),
                    'fileName': fileName + '_gp',
                    'type': 'json'
                },
                {
                    //keypoints
                    'content': await createParseJson(2),
                    'fileName': fileName,
                    'type': 'json'
                },
                {
                    //image
                    'content': fileList[i],
                    'fileName': fileName,
                    'type': 'image'
                }
            ];
            make2zipfolder(tmpFileList, fileName, zip);
        }

        //TODO: 파일명 변경
        make2zip(zip, "labeling");

        successExportToast.showToast();
    }



    const keydownFunction = useCallback((event: KeyboardEvent) => {
        if (event.key === "Escape" && work === "create") {
            //esc function
            deleteCurWork();
        }
        // else if (event.which === 90 && event.ctrlKey) {
        //TODO: 현재 막아놓음
        // console.log("ctrl+z");
        // back();
        // }
    }, [curIndex]);

    useEffect(() => {
        document.addEventListener("keydown", keydownFunction, false);

        return () => {
            document.removeEventListener("keydown", keydownFunction, false);
        };
    }, [curIndex]);

    //맨 처음에 할 일
    // useEffect(() => {
    // // initState
    // }, []);

    const deleteCurWork = () => {
        //지금 만들던 중인 것 삭제
        if (curIndex === -1) return;

        deleteLastWork();
    }

    const deleteLastWork = () => {
        setGeneralPoints(generalPoints().slice(0, -1));
        setGeneralLabelPoints(generalLabelPoints().slice(0, -1));
        //setGeneralFlattenedPoints는 useEffect에서 바꿔줌
        setGeneralMouseOverPoint(isGeneralMouseOverPoint().slice(0, -1));
        setGeneralPolyComplete(isGeneralPolyComplete().slice(0, -1));

        setCurIndex(-1);
    }


    const changePoints = (index: number, newPointsArray: number[][]) => {
        //points[index] = newPointsArray와 동일
        //선 사이에 점 추가할 때 사용

        const newPoints = generalPoints().map((item, i) => {
            if (i === index) {
                return newPointsArray;
            }
            return item;
        });

        setGeneralPoints(newPoints);

        // //뒤로 가기
        // const pastPointsLen = pastPoints.length;
        // setPastPoints([...pastPoints, newPoints]);
        // //기존 꺼에서 하나 추가
        // setPastIndex(pastPointsLen);
    }


    const deletePolygon = (index: number) => {
        //index번째 삭제
        try {
            console.log(`==deletePolygon ${index}===`);

            //points, flatten, label, isMouseOverPoint, isPolyComplete, curIndex 수정
            const newPoints = generalPoints().filter((_, i) => {
                return index !== i;
            });
            setGeneralPoints(newPoints);
            const newFlattenedPoints = generalFlattenedPoints().filter((_, i) => {
                return index !== i;
            });
            setGeneralFlattenedPoints(newFlattenedPoints);
            const newLabelPoints = generalLabelPoints().filter((_, i) => {
                return index !== i;
            })
            setGeneralLabelPoints(newLabelPoints);
            if (index === clickedGeneralParseIndex()) {
                setClickedGeneralParseIndex(-1);
            }
            const newIsMouseOverPoint = isGeneralMouseOverPoint().filter((_, i) => {
                return index !== i;
            });
            setGeneralMouseOverPoint(newIsMouseOverPoint);
            const newIsPolyComplete = isGeneralPolyComplete().filter((_, i) => {
                return index !== i;
            });
            setGeneralPolyComplete(newIsPolyComplete);


            setCurIndex(-1);
            //뒤로 가기
            // const pastPointsLen = pastPoints.length;
            // setPastPoints([...pastPoints, newPoints]);
            // setPastIndex(pastPointsLen);
        } catch (e) {
            console.log(e);
        }
    }

    const setParseData = (newPoints: number[][][], newLabelPoints: ParseLabel[], tmpTabIndex: number) => {
        //tmpTabIndex: tabIndex와 비슷(0,1,2)
        setGeneralPoints(newPoints, tmpTabIndex);
        //points -> flattenedPoints
        if (tmpTabIndex < 2) {//0,1
            let newFlattenPoints: number[][] = [];
            newPoints.forEach((value: number[][]) => {
                let dummyList: number[] = [];
                value.forEach((item: number[]) => {
                    dummyList.push(...item);
                })
                newFlattenPoints.push(dummyList);
            });
            setGeneralFlattenedPoints(newFlattenPoints, tmpTabIndex);
        }
        setGeneralLabelPoints(newLabelPoints, tmpTabIndex);
        const len = newPoints.length;
        setGeneralMouseOverPoint(new Array(len).fill(false), tmpTabIndex);
        setGeneralPolyComplete(new Array(len).fill(true), tmpTabIndex);
        setClickedGeneralParseIndex(-1, tmpTabIndex);


        setCurIndex(-1);
        setIsDragging(false);
        setRatio(1);

        setCreatedLabel(new ParseLabel());//default

        //뒤로가기
        // setPastPoints([]);
        // setPastIndex(-1);
    }

    const getDataFromJson = async (file: File, fileIndex: number, tmpTabIndex: number) => {
        if (fileIndex == -1) return;

        const jsonData = await file2json(file);

        let newPoints: number[][][] = [];
        let newLabelPoints: ParseLabel[] = [];

        jsonData["shapes"].map((item: ResultJsonInterface) => {
            let color = item["color"];
            if (!color) {
                //make random color
                color = "#" + Math.floor(Math.random() * 16777215).toString(16);
            }
            newLabelPoints.push(new ParseLabel(item["label"], color));
            newPoints.push(item["points"]);
        });

        setParseData(
            newPoints,
            newLabelPoints,
            tmpTabIndex
        );

        //resultParseList에도 저장
        const generalResultParseList2 = generalResultParseList(tmpTabIndex);
        setGeneralResultParseList([...generalResultParseList2.slice(0, fileIndex),
        {
            "points": newPoints,
            "labelPoints": newLabelPoints,
            "is_done": true,
        },
        ...generalResultParseList2.slice(fileIndex + 1)
        ], tmpTabIndex);
    }

    const getOneDataFromJson = async (file: File, fileIndex: number) => {
        //getDataFromJson와 거의 비슷
        if (fileIndex == -1) return {
            "points": [],
            "labelPoints": [],
            "is_done": false
        };

        const jsonData = await file2json(file);

        let newPoints: number[][][] = [];
        let newLabelPoints: ParseLabel[] = [];

        jsonData["shapes"].map((item: { "color"?: string, "points": number[][], "label": string }) => {
            let color = item["color"];
            if (!color) {
                //make random color
                color = "#" + Math.floor(Math.random() * 16777215).toString(16);
            }
            newLabelPoints.push(new ParseLabel(item["label"], color));
            newPoints.push(item["points"]);
        });

        //resultParseList의 element형식으로 저장
        return {
            "points": newPoints,
            "labelPoints": newLabelPoints,
            "is_done": true,
        };
    }

    const getDataFromResultParseList = (newIndex: number) => {
        //prev, next일 때 resultParseList에서 가져오기
        setImageIndex(newIndex);
        setImageSource(fileList[newIndex]);//file instance

        //parse, garment, key에서 다 받아와야함
        //parse
        setParseData(
            resultParseList[newIndex]["points"],
            resultParseList[newIndex]["labelPoints"],
            0
        );
        //garment
        setParseData(
            garmentResultParseList[newIndex]["points"],
            garmentResultParseList[newIndex]["labelPoints"],
            1
        );
        //key
        setParseData(
            keyResultParseList[newIndex]["points"],
            keyResultParseList[newIndex]["labelPoints"],
            2
        );
    }


    const createParseJson = async (tmpTabIndex: number) => {
        try {
            const shapesList: ResultJsonInterface[] = [];

            const generalLabelPoints2 = generalLabelPoints(tmpTabIndex);
            const keyPointAttr = tmpTabIndex === 2 ? {
                "shape_type": "point"
            } : null;
            generalPoints(tmpTabIndex).map((item, index) => {
                shapesList.push({
                    "label": generalLabelPoints2[index].label_name,
                    "color": generalLabelPoints2[index].color,//색깔
                    "points": item,
                    ...keyPointAttr
                })
            });

            const imageData = await file2base64(imageSource!);

            return {
                "shapes": shapesList,
                "imagePath": fileList[imageIndex].name,
                "imageData": imageData,
                "imageHeight": size.height,
                "imageWidth": size.width,
            };
        } catch (e) {
            console.log(e);
        }
    }


    const saveToResultList = () => {
        setResultParseList([...resultParseList.slice(0, imageIndex),
        {
            "points": points,
            "labelPoints": labelPoints,
            "is_done": true,
        },
        ...resultParseList.slice(imageIndex + 1)
        ]);
        //garment
        setGarmentResultParseList([...garmentResultParseList.slice(0, imageIndex),
        {
            "points": garmentPoints,
            "labelPoints": garmentLabelPoints,
            "is_done": true,
        },
        ...garmentResultParseList.slice(imageIndex + 1)
        ]);
        //keypoints
        setKeyResultParseList([...keyResultParseList.slice(0, imageIndex),
        {
            "points": keyPoints,
            "labelPoints": keyLabelPoints,
            "is_done": true,
        },
        ...keyResultParseList.slice(imageIndex + 1)
        ]);
    }


    const videoElement = useMemo(() => {
        //imageSource가 바뀔 때마다 image 바꿔서 보여주는 작업
        const element = new window.Image();
        // element.width = 390;
        // element.height = 512;
        if (imageSource !== undefined) {
            file2base64(imageSource).then((result: any) => {
                element.src = result;
            });
        }
        return element;
    }, [imageSource]);

    useEffect(() => {
        const onload = function () {
            setSize({
                width: videoElement.width,
                height: videoElement.height,
            });
            setImage(videoElement);
            imageRef.current = videoElement;
        };
        videoElement.addEventListener("load", onload);
        return () => {
            videoElement.removeEventListener("load", onload);
        };
    }, [videoElement]);

    const getMousePos = (stage: StageType) => {
        //마우스 position 가져오기
        return [stage.getPointerPosition()!.x / ratio, stage.getPointerPosition()!.y / ratio];
    };




    //drawing begins when mousedown event fires.
    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        //마우스 클릭시에 발생
        console.log(`==handleMouseDown==`);

        if (work !== "create"
            ||
            (curIndex !== -1 &&
                tabIndex === 0 &&
                isPolyComplete[curIndex])
            ||
            (curIndex !== -1 &&
                tabIndex === 1 &&
                isGarmentPolyComplete[curIndex])) return;
        else if (curIndex === -1) {
            //create
            //새로운 점 추가!!!!
            if (tabIndex === 2) {
                //create keypoint(바로 추가!)
                //labelPoints
                setKeyLabelPoints([...keyLabelPoints, new ParseLabel()]);

                //points
                const stage = e.target.getStage();
                const mousePos = getMousePos(stage!);
                setKeyPoints([...keyPoints, [mousePos]]);

                //isMouseOverPoint
                setKeyMouseOverPoint([...isKeyMouseOverPoint, false]);
                setCurIndex(-1);

                setIsPopupShown(true);
                return;
            }

            //flattenPoints
            setGeneralFlattenedPoints([...generalFlattenedPoints(), []]);
            //labelPoints
            setGeneralLabelPoints([...generalLabelPoints(), new ParseLabel()]);
            //points
            const stage = e.target.getStage();
            const mousePos = getMousePos(stage!);
            setGeneralPoints([...generalPoints(), [mousePos]]);
            //isMouseOverPoint
            setGeneralMouseOverPoint([...isGeneralMouseOverPoint(), false]);
            //isPolyComplete
            setGeneralPolyComplete([...isGeneralPolyComplete(), false]);

            setCurIndex(generalPoints().length);

            return;
        }

        const stage = e.target.getStage();
        const mousePos = getMousePos(stage!);

        if (isGeneralMouseOverPoint()[curIndex] && generalPoints()[curIndex].length >= 3) {
            //polygon 끝 -> 일단 만들고 팝업 띄우기
            const newPolyComplete = isGeneralPolyComplete().map((item, i) => {
                if (i === curIndex) {
                    //수정
                    return true;
                }
                return item;
            });
            setGeneralPolyComplete(newPolyComplete);

            // 바뀐 좌표에 맞게 flattenpoints들도 수정
            const generalPoints2 = generalPoints();
            const newFlattenPoints = generalFlattenedPoints().map((item, i) => {
                if (i === curIndex) {
                    return generalPoints2[curIndex]
                        .reduce((a, b) => a.concat(b), []);
                }
                return item;
            });
            setGeneralFlattenedPoints(newFlattenPoints);

            setCurIndex(-1);


            //뒤로 가기
            // const pastPointsLen = pastPoints.length;
            // setPastPoints([...pastPoints, points]);
            // setPastIndex(pastPointsLen);

            //팝업 띄우기
            setIsPopupShown(true);
        } else {
            //계속 추가
            const newPoints = generalPoints().map((item, i) => {
                if (i === curIndex) {
                    return [...item, mousePos];
                }
                return item;
            })

            setGeneralPoints(newPoints);
        }
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
        console.log("==handleMouseMove==");
        const stage = e.target.getStage();
        const mousePos = getMousePos(stage!);
        setPosition(mousePos);
    };

    const handleMouseOverStartPoint = (e: KonvaEventObject<MouseEvent>, index: number) => {
        //create 중에 circle에 mouse 올렸을 때
        console.log("==handleMouseOverStartPoint==");

        if (tabIndex === 2) return;
        if (tabIndex === 0 && (isPolyComplete[index] || points[index].length < 3)) return;
        if (tabIndex === 1 && (isGarmentPolyComplete[index] || garmentPoints[index].length < 3)) return;
        //원 크게 보이도록
        e.target.scale({ x: 2, y: 2 });
        const newMouseOverPoint = isGeneralMouseOverPoint().map((item, i) => {
            if (i === index) {
                return true;
            }
            return item;
        });
        setGeneralMouseOverPoint(newMouseOverPoint);


        // setCurIndex(index);
        // setMouseOverPoint(true);
    };

    const handleMouseOutStartPoint = (e: KonvaEventObject<MouseEvent>, index: number) => {
        //create 중에 circle에서 mouse가 떠났을 때
        console.log("==handleMouseOutStartPoint==");
        e.target.scale({ x: 1, y: 1 });

        const newMouseOverPoint = isGeneralMouseOverPoint().map((item, i) => {
            if (i === index) {
                //수정
                return false;
            }
            return item;
        });
        setGeneralMouseOverPoint(newMouseOverPoint);
    };


    useEffect(() => {
        try {
            //points update될 때마다 flattenpoints도 update
            if (curIndex === -1 || tabIndex === 2) return;

            const newFlattenPoints = generalFlattenedPoints().map((item, index) => {
                if (curIndex === index) {
                    return generalPoints()[index]
                        .concat(isGeneralPolyComplete()[index] ? [] : position)
                        .reduce((a, b) => a.concat(b), []);
                }
                return item;
            });
            setGeneralFlattenedPoints(newFlattenPoints);
        } catch (e) {
            console.log('==useEffect error==');
            console.log(e);
        }
    }, [points, isPolyComplete,
        garmentPoints, isGarmentPolyComplete,
        position]);


    const handlePointDragMove = (e: KonvaEventObject<DragEvent>, index: number) => {
        //work === "edit"일 때만 작동함
        //circle 좌표 수정
        console.log("==handlePointDragMove==");
        setCurIndex(index);
        // setIsDragging(true);

        //좌표 수정중
        const stage = e.target.getStage();
        const index2 = e.target.index - 1;
        //ratio=1 기준으로 좌표 바꿔주기
        const pos = [e.target._lastPos.x / ratio, e.target._lastPos.y / ratio];
        //max/min 설정
        const width = stage!.width() * ratio;
        const height = stage!.height() * ratio;
        if (pos[0] < 0) pos[0] = 0;
        if (pos[1] < 0) pos[1] = 0;
        if (pos[0] > width) pos[0] = width;
        if (pos[1] > height) pos[1] = height;

        if (tabIndex < 2) {//0,1
            const newPoints = generalPoints().map((item, i) => {
                if (i === index) {
                    return [...item.slice(0, index2), pos, ...item.slice(index2 + 1)];
                }
                return item;
            })
            setGeneralPoints(newPoints);
        } else if (tabIndex === 2) {
            const newPoints = generalPoints().map((item, i) => {
                if (i === index) {
                    return [pos];
                }
                return item;
            })
            setGeneralPoints(newPoints);
        }

        //뒤로 가기
        // const pastPointsLen = pastPoints.length;
        // setPastPoints([...pastPoints, newPoints]);
        // setPastIndex(pastPointsLen);
    };

    //TODO: parse, garment 반영 안됨 + 알파
    // const back = async () => {
    //     console.log("===click back btn===");
    //     if (pastIndex <= 0 || isNaN(pastIndex)) return;

    //     const newPastIndex = pastIndex - 1;
    //     setPastIndex(newPastIndex);

    //     const newPoints = pastPoints[newPastIndex];
    //     setPoints(newPoints);

    //     //TODO: back시에 labelPoints 어떻게할지???ㅠㅠㅠㅠ
    //     //flattened 수정
    //     let newFlattenPoints = [];
    //     newPoints.forEach((value) => {
    //         //여기 수정해야함!!!!
    //         let dummyList = [];
    //         value.forEach((item) => {
    //             dummyList.push(...item);
    //         })
    //         newFlattenPoints.push(dummyList);
    //     });
    //     setFlattenedPoints(newFlattenPoints);

    //     //isMouseOverPoint, isPolyComplete 수정
    //     const newMouseOverPoint = newPoints.map(() => false);
    //     setMouseOverPoint(newMouseOverPoint);
    //     const newPolyComplete = newPoints.map(() => true);
    //     setPolyComplete(newPolyComplete);

    //     //curIndex 수정
    //     setCurIndex(-1);
    // }

    const handleGroupDragEnd = (e: KonvaEventObject<DragEvent>, index: number) => {
        console.log("==handleGroupDragEnd==");

        if (work === "edit" && e.target.name() === "polygon") {
            //drag 끝 -> 좌표 수정
            const newPoints = generalPoints().map((item, i) => {
                if (i === index) {
                    let result: number[][] = [];
                    let copyPoints = [...item];
                    copyPoints.map((point) =>
                        result.push([point[0] + e.target.x() / ratio, point[1] + e.target.y() / ratio])
                    );
                    return result;
                }
                return item;
            })

            e.target.position({ x: 0, y: 0 }); //needs for mouse position otherwise when click undo you will see that mouse click position is not normal:)
            setGeneralPoints(newPoints);

            //바뀐 좌표에 맞게 flattenpoints들도 수정
            if (tabIndex < 2) {//0,1
                const newFlattenPoints = generalFlattenedPoints().map((item, i) => {
                    if (i === index) {
                        return newPoints[index]
                            .concat(isGeneralPolyComplete()[index] ? [] : position)
                            .reduce((a, b) => a.concat(b), []);
                    }
                    return item;
                })
                setGeneralFlattenedPoints(newFlattenPoints);
            }

            //뒤로 가기
            // const pastPointsLen = pastPoints.length;
            // setPastPoints([...pastPoints, newPoints]);
            // setPastIndex(pastPointsLen);
        }
    };

    const wheelHandler = (e: WheelEvent) => {
        //마우스 휠 + ctrl or cmd key: 축소, 확대
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setRatio(ratio => (ratio >= 0.2 ? ratio + -0.001 * e.deltaY : 0.2));
        }
    };

    //현재는 마우스로 확대/축소 가능
    useEffect(() => {
        document.addEventListener("wheel", wheelHandler, false);

        return () => {
            document.removeEventListener("wheel", wheelHandler, false);
        };
    }, [curIndex]);


    return (
        <div>
            <div className="wrapper">
                {/* 좌표 부분 */}
                <div
                    className="wrapper-canvas"
                >
                    <Stage
                        //꼭 width와 height 지정해놔야함
                        width={size.width * ratio}
                        height={size.height * ratio}
                        onMouseMove={handleMouseMove}
                        onMouseDown={handleMouseDown}
                        style={{ overflow: "auto" }}
                    >
                        <Layer>
                            <Image
                                ref={imageRef}
                                image={image}
                                x={0}
                                y={0}
                                width={size.width}
                                height={size.height}
                                scaleX={ratio}
                                scaleY={ratio}
                            />
                            {
                                tabIndex === 0
                                &&
                                points.map((item: number[][], index: number) => (
                                    <PolygonAnnotation
                                        // points={item}
                                        // flattenedPoints={flattenedPoints[index]}
                                        // 보여주는 건 ratio에 맞게 보여줘야함!!
                                        points={item.map((x) => {
                                            return x.map((y) => y * ratio);
                                        })}
                                        originalPoints={item}
                                        flattenedPoints={
                                            flattenedPoints[index].map((x) => x * ratio)
                                        }
                                        changePoints={changePoints}
                                        deletePolygon={deletePolygon}
                                        handlePointDragMove={(e: KonvaEventObject<DragEvent>) => handlePointDragMove(e, index)}
                                        handleGroupDragEnd={(e: KonvaEventObject<DragEvent>) => handleGroupDragEnd(e, index)}
                                        handleMouseOverStartPoint={(e) => handleMouseOverStartPoint(e, index)}
                                        handleMouseOutStartPoint={(e: KonvaEventObject<MouseEvent>) => handleMouseOutStartPoint(e, index)}
                                        isFinished={isPolyComplete[index]}
                                        polygonIndex={index}
                                        key={`polygonannotation_parse${index}`}
                                        work={work}
                                        isDragging={isDragging}
                                        setIsDragging={setIsDragging}
                                        ratio={ratio}
                                        isEnabled={labelPoints[index].is_shown}
                                        fillEnabled={clickedParseIndex === index}
                                        colorCode={
                                            labelPoints[index].color !== "" ?
                                                //default: green
                                                labelPoints[index].color : "rgb(32, 255, 0)"
                                        }
                                    />
                                ))
                            }

                            {
                                tabIndex === 1
                                &&
                                garmentPoints.map((item, index) => (
                                    <PolygonAnnotation
                                        // points={item}
                                        // flattenedPoints={flattenedPoints[index]}
                                        // 보여주는 건 ratio에 맞게 보여줘야함!!
                                        points={item.map((x) => {
                                            return x.map((y) => y * ratio);
                                        })}
                                        originalPoints={item}
                                        flattenedPoints={
                                            garmentFlattenedPoints[index].map((x) => x * ratio)
                                        }
                                        changePoints={changePoints}
                                        deletePolygon={deletePolygon}
                                        handlePointDragMove={(e) => handlePointDragMove(e, index)}
                                        handleGroupDragEnd={(e) => handleGroupDragEnd(e, index)}
                                        handleMouseOverStartPoint={(e) => handleMouseOverStartPoint(e, index)}
                                        handleMouseOutStartPoint={(e) => handleMouseOutStartPoint(e, index)}
                                        isFinished={isGarmentPolyComplete[index]}
                                        polygonIndex={index}
                                        key={`polygonannotation_garment${index}`}
                                        work={work}
                                        isDragging={isDragging}
                                        setIsDragging={setIsDragging}
                                        ratio={ratio}
                                        isEnabled={garmentLabelPoints[index].is_shown}
                                        fillEnabled={clickedGarmentParseIndex === index}
                                        colorCode={
                                            garmentLabelPoints[index].color !== "" ?
                                                //default: green
                                                garmentLabelPoints[index].color : "rgb(32, 255, 0)"
                                        }
                                    />
                                ))
                            }

                            {
                                tabIndex === 2
                                &&
                                keyPoints.map((item, index) => (
                                    <PointAnnotation
                                        // points={item}
                                        // flattenedPoints={flattenedPoints[index]}
                                        // 보여주는 건 ratio에 맞게 보여줘야함!!
                                        points={item.map((x) => {
                                            return x.map((y) => y * ratio);
                                        })}


                                        // changePoints={changePoints}
                                        deletePolygon={deletePolygon}
                                        handlePointDragMove={(e) => handlePointDragMove(e, index)}
                                        handleGroupDragEnd={(e) => handleGroupDragEnd(e, index)}
                                        // handleMouseOverStartPoint={(e) => handleMouseOverStartPoint(e, index)}
                                        // handleMouseOutStartPoint={(e) => handleMouseOutStartPoint(e, index)}
                                        // isFinished={isGarmentPolyComplete[index]}
                                        isFinished={true}
                                        polygonIndex={index}

                                        key={`pointannotation_key${index}`}
                                        work={work}
                                        isDragging={isDragging}
                                        setIsDragging={setIsDragging}
                                        ratio={ratio}
                                        isEnabled={keyLabelPoints[index].is_shown}
                                        colorCode={
                                            keyLabelPoints[index].color !== "" ?
                                                //default: green
                                                keyLabelPoints[index].color : "rgb(32, 255, 0)"
                                        }
                                    />
                                ))
                            }
                        </Layer>
                    </Stage>
                </div>

                {/* 오른쪽 메뉴 부분 */}
                <div className="wrapper-menu">
                    {/* file list */}
                    <div className="wrapper-box1">
                        <div className="wrapper-title">
                            File List
                        </div>

                        <div className="wrapper-scroll">
                            {
                                fileList.map((item, index) => (
                                    <FileItem
                                        //완료된 작업인지?
                                        checkStatus={
                                            resultParseList[index]["is_done"]
                                            &&
                                            garmentResultParseList[index]["is_done"]
                                            &&
                                            keyResultParseList[index]["is_done"]
                                        }
                                        //현재 보고 있는 파일명과 일치하는지?
                                        clickStatus={imageSource === item}
                                        label={item.webkitRelativePath}
                                        onClick={() => {
                                            //저장
                                            saveToResultList();

                                            if (imageIndex === index) {
                                                //이미 같은 file이었다면 변화X
                                                return;
                                            }
                                            setImageSource(item);
                                            setImageIndex(index);
                                            getDataFromResultParseList(index);
                                        }}
                                        key={`fileitem${index}`}
                                    />
                                ))
                            }
                        </div>
                    </div>

                    {/* Labeling > work list */}
                    <div className="wrapper-box2"
                        style={{
                            display: windowIndex === 0 ? "" : "none"
                        }}>
                        <div className="wrapper-title">
                            Work List
                        </div>

                        <div className="wrapper-tab">
                            <div className={`wrapper-tabmenu ${tabIndex === 0 ? "wrapper-tabmenu-clicked" : ""}`}
                                onClick={() => {
                                    setTabIndex(0);
                                }}>
                                parse
                            </div>
                            <div className={`wrapper-tabmenu ${tabIndex === 1 ? "wrapper-tabmenu-clicked" : ""}`}
                                onClick={() => {
                                    setTabIndex(1);
                                }}>
                                garment
                            </div>
                            <div className={`wrapper-tabmenu ${tabIndex === 2 ? "wrapper-tabmenu-clicked" : ""}`}
                                onClick={() => {
                                    setTabIndex(2);
                                }}>
                                keypoints
                            </div>
                        </div>


                        <div>
                            {/* 0. parse */}
                            {
                                (tabIndex === 0)
                                &&
                                <div className="wrapper-tab-content">
                                    {
                                        labelPoints.map((item, index) => (
                                            <WorkItem
                                                //현재 fill된 polygon인지?
                                                clickStatus={clickedParseIndex === index}
                                                //완료된 작업인지?
                                                checkStatus={item["is_shown"]}
                                                label={item["label_name"]}
                                                onClick={() => {
                                                    setClickedParseIndex(index);
                                                }}
                                                onCheck={() => {
                                                    //눈 모양 눌렀을 때
                                                    //is_shown 수정
                                                    const newItem = item.setIsShown(!item.is_shown);
                                                    setLabelPoints([...labelPoints.slice(0, index),
                                                        // {
                                                        //     ...item,
                                                        //     "is_shown": !item["is_shown"]
                                                        // },
                                                        newItem,
                                                    ...labelPoints.slice(index + 1)
                                                    ]);

                                                    //화면에서 안 보이게끔
                                                }}
                                                colorCode={item["color"]}
                                                key={`workitem_parse${index}`}
                                            />
                                        ))
                                    }
                                </div>
                            }

                            {/* 1. garment */}
                            {
                                (tabIndex === 1)
                                &&
                                <div className="wrapper-tab-content">
                                    {
                                        garmentLabelPoints.map((item, index) => (
                                            <WorkItem
                                                //현재 fill된 polygon인지?
                                                clickStatus={clickedGarmentParseIndex === index}
                                                //완료된 작업인지?
                                                checkStatus={item["is_shown"]}
                                                label={item["label_name"]}
                                                onClick={() => {
                                                    setClickedGarmentParseIndex(index);
                                                }}
                                                onCheck={() => {
                                                    //눈 모양 눌렀을 때
                                                    //is_shown 수정
                                                    const newItem = item.setIsShown(!item.is_shown);
                                                    setGarmentLabelPoints([...garmentLabelPoints.slice(0, index),
                                                        // {
                                                        //     ...item,
                                                        //     "is_shown": !item["is_shown"]
                                                        // },
                                                        newItem,
                                                    ...garmentLabelPoints.slice(index + 1)
                                                    ]);

                                                    //화면에서 안 보이게끔
                                                }}
                                                colorCode={item["color"]}
                                                key={`workitem_garment${index}`}
                                            />
                                        ))
                                    }
                                </div>
                            }

                            {/* 2. keypoints */}
                            {
                                (tabIndex === 2)
                                &&
                                <div className="wrapper-tab-content">
                                    {
                                        keyLabelPoints.map((item, index) => (
                                            <WorkItem
                                                //현재 fill된 polygon인지?
                                                clickStatus={clickedKeyParseIndex === index}
                                                //완료된 작업인지?
                                                checkStatus={item["is_shown"]}
                                                label={item["label_name"]}
                                                onClick={() => {
                                                    setClickedKeyParseIndex(index);
                                                }}
                                                onCheck={() => {
                                                    //눈 모양 눌렀을 때
                                                    //is_shown 수정
                                                    const newItem = item.setIsShown(!item.is_shown);
                                                    setKeyLabelPoints([...keyLabelPoints.slice(0, index),
                                                        // {
                                                        //     ...item,
                                                        //     "is_shown": !item["is_shown"]
                                                        // },
                                                        newItem,
                                                    ...keyLabelPoints.slice(index + 1)
                                                    ]);

                                                    //화면에서 안 보이게끔
                                                }}
                                                colorCode={item["color"]}
                                                key={`workitem_key${index}`}
                                            />
                                        ))
                                    }
                                </div>
                            }

                        </div>

                    </div>

                    <div className="wrapper-bottom-tab">
                        <div
                            className=
                            {`click wrapper-bottom-tabmenu ${windowIndex === 0 ? "wrapper-bottom-tabmenu-clicked" : ""
                                }`}
                            onClick={() => {
                                setWindowIndex(0);
                            }}>
                            Labeling
                        </div>
                    </div>

                </div>
            </div>

            <div className="top-menu eng-heading3-700 gray-7">
                Web labeling
            </div>

            <div className="left-menu">
                <img src="favicon.png" width="32px" height="32px" style={{
                    marginBottom: "12px"
                }}></img>

                {/* PREV */}
                <IconButton
                    iconName="icon-prev"
                    onClick={() => {
                        //TODO: Save & Prev api 연결

                        //저장
                        saveToResultList();

                        //이동
                        if (imageIndex > 0) {
                            const newImageIndex = imageIndex - 1;
                            getDataFromResultParseList(newImageIndex);
                        }
                    }}
                    label="Prev"
                />

                {/* NEXT */}
                <IconButton
                    iconName="icon-next"
                    onClick={() => {
                        //TODO: Save & Next api 연결

                        //저장
                        saveToResultList();

                        //이동
                        if (imageIndex < fileList.length) {
                            const newImageIndex = imageIndex + 1;
                            getDataFromResultParseList(newImageIndex);
                        }
                    }}
                    label="Next"
                />

                {/* SAVE */}
                <IconButton
                    iconName="icon-save"
                    onClick={() => {
                        //TODO: Save api 연결

                        //저장
                        saveToResultList();

                        successSaveToast.showToast();
                    }}
                    label="save"
                />

                {/* CREATE */}
                <IconButton
                    iconName="icon-create"
                    onClick={() => {
                        if (curIndex !== -1 && work === "create") {
                            deleteCurWork();
                        } else {
                            setCurIndex(-1);
                        }
                        setWork("create");
                    }}
                    label="create"
                    status={work === "create"}
                />

                {/* EDIT */}
                <IconButton
                    iconName="icon-edit"
                    onClick={() => {
                        if (curIndex !== -1) {
                            deleteCurWork();
                        } else {
                            setCurIndex(-1);
                        }
                        setWork("edit");
                    }}
                    label="edit"
                    status={work === "edit"}
                />

                {/* DELETE */}
                <IconButton
                    iconName="icon-delete"
                    onClick={() => {
                        if (curIndex !== -1 && work === "create") {
                            deleteCurWork();
                        } else {
                            setCurIndex(-1);
                        }
                        setWork("delete");
                    }}
                    label="delete"
                    status={work === "delete"}
                />

                {/* LOCAL FILES UPLOAD */}
                <input type="file" id="multi_file_upload" name="multi_file_upload"
                    webkitdirectory="true"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                        //file upload
                        const files = e.currentTarget.files;
                        if (!files) return;
                        const filesLen = files.length;
                        if (filesLen === 0) return;//취소 누르면 아무 실행x

                        let imageFileList = [];//image
                        let imageFileNameList = [];//image file key(확장자 뺀 것)
                        let parseJsonFileList = [];//json - parse
                        let parseJsonFileNameList = [];//json - parse file key(확장자 뺀 것)
                        let garmentJsonFileList = [];//json - garment
                        let garmentJsonFileNameList = [];//json - garment file key(확장자 뺀 것)
                        let keyJsonFileList = [];//json - keypoints
                        let keyJsonFileNameList = [];//json - keypoints file key(확장자 뺀 것)
                        let imageFilesLen = 0;
                        for (let i = 0; i < filesLen; i++) {
                            const curFile = files[i];
                            if (curFile.type.search("image") != -1) {
                                //image일 때만 저장(jpeg, png)
                                imageFileList.push(curFile);
                                imageFileNameList.push(curFile.webkitRelativePath.split(".")[0]);
                                imageFilesLen++;
                            } else if (curFile.type.search("json") != -1) {
                                //json일 때
                                const curFileName = curFile.name;
                                if (curFileName.includes("_gp.json")) {
                                    //garment
                                    garmentJsonFileList.push(curFile);
                                    garmentJsonFileNameList.push(curFile.webkitRelativePath.split("_gp.")[0]);
                                } else if (curFileName.includes("_p.json")) {
                                    //parse
                                    parseJsonFileList.push(curFile);
                                    parseJsonFileNameList.push(curFile.webkitRelativePath.split("_p.")[0]);
                                } else if (curFileName.includes(".json")) {
                                    //keypoints
                                    keyJsonFileList.push(curFile);
                                    keyJsonFileNameList.push(curFile.webkitRelativePath.split(".")[0]);
                                }
                            }
                        }
                        //work list 초기화
                        setParseData([], [], 0);
                        setParseData([], [], 1);
                        setParseData([], [], 2);
                        //parse
                        var newResultParseList = new Array(imageFilesLen).fill(
                            {
                                "points": [],
                                "labelPoints": [],
                                "is_done": false
                            }
                        );
                        //parseJsonFileList에 존재한다면 저장해놓기
                        for (let j = 0; j < parseJsonFileNameList.length; j++) {
                            const matchIndex = imageFileNameList.indexOf(parseJsonFileNameList[j]);
                            if (matchIndex !== -1) {
                                const result: {
                                    "points": number[][][];
                                    "labelPoints": ParseLabel[];
                                    "is_done": boolean;
                                } = await getOneDataFromJson(parseJsonFileList[j], matchIndex);
                                setParseData(
                                    result["points"],
                                    result["labelPoints"],
                                    0//parse
                                );
                                newResultParseList[matchIndex] = result;
                            }
                        }
                        //garment
                        var newGarmentResultParseList = new Array(imageFilesLen).fill(
                            {
                                "points": [],
                                "labelPoints": [],
                                "is_done": false
                            }
                        );
                        //garmentJsonFileList에 존재한다면 저장해놓기
                        for (let j = 0; j < garmentJsonFileNameList.length; j++) {
                            const matchIndex = imageFileNameList.indexOf(garmentJsonFileNameList[j]);
                            if (matchIndex !== -1) {
                                const result = await getOneDataFromJson(garmentJsonFileList[j], matchIndex);
                                setParseData(
                                    result["points"],
                                    result["labelPoints"],
                                    1//garment
                                );
                                newGarmentResultParseList[matchIndex] = result;
                            }
                        }
                        //keypoints
                        var newKeyResultParseList = new Array(imageFilesLen).fill(
                            {
                                "points": [],
                                "labelPoints": [],
                                "is_done": false
                            }
                        );
                        //keyJsonFileList에 존재한다면 저장해놓기
                        for (let j = 0; j < keyJsonFileNameList.length; j++) {
                            const matchIndex = imageFileNameList.indexOf(keyJsonFileNameList[j]);
                            if (matchIndex !== -1) {
                                const result = await getOneDataFromJson(keyJsonFileList[j], matchIndex);
                                setParseData(
                                    result["points"],
                                    result["labelPoints"],
                                    2//keypoints
                                );
                                newKeyResultParseList[matchIndex] = result;
                            }
                        }


                        //맨 처음부터 시작
                        setFileList(imageFileList);
                        setImageSource(imageFileList[0]);
                        setImageIndex(0);
                        setRatio(1);

                        setResultParseList(newResultParseList);
                        setGarmentResultParseList(newGarmentResultParseList);
                        setKeyResultParseList(newKeyResultParseList);

                        successFileToast.showToast();

                        //초기화
                        e.target.value = '';
                    }}
                />
                <label htmlFor="multi_file_upload" className="click form-click">
                    <IconButton
                        iconName="icon-upload"
                        label={"Upload"}
                        status={false}
                    />
                </label>


                {/* JSON EXPORT */}
                <IconButton
                    iconName="icon-save"
                    onClick={async () => {
                        setIsSelectExportPopupShown(true);
                    }}
                    label={"Json\nexport"}
                    status={false}
                />


                {/* JSON IMPORT */}
                <input type="file" id="json_import" name="json_import" multiple
                    style={{ display: "none" }}
                    onChange={async (e) => {
                        if (!(e.target.files && e.target.files[0])) return;//취소
                        if (selectedType < 3) {
                            //첫번째 file 가져옴
                            await getDataFromJson(e.target.files[0], imageIndex, selectedType);
                            setTabIndex(selectedType);
                        } else {
                            //directory
                            const fileLen = e.target.files.length;
                            for (let i = 0; i < fileLen; i++) {
                                const tmpFile = e.target.files[i];
                                const tmpFileName = tmpFile.name;
                                if (tmpFileName.includes("_gp.json")) {
                                    //garment
                                    await getDataFromJson(tmpFile, imageIndex, 1);
                                } else if (tmpFileName.includes("_p.json")) {
                                    //parse
                                    await getDataFromJson(tmpFile, imageIndex, 0);
                                } else if (tmpFileName.includes(".json")) {
                                    //keypoints
                                    await getDataFromJson(tmpFile, imageIndex, 2);
                                }
                            }
                        }
                        successImportToast.showToast();

                        //초기화
                        e.target.value = '';
                    }}
                />
                <IconButton
                    iconName="icon-upload"
                    label={"Json\nimport"}
                    status={false}
                    onClick={(e) => {
                        //select popup 띄워서 type 받기
                        setIsSelectPopupShown(true);
                    }}
                />

            </div>

            {/* 100. Pop Up & Background */}
            {
                (isPopupShown || isSelectPopupShown || isSelectExportPopupShown)
                &&
                <div className="popup-background"
                    //팝업 닫히게끔
                    onClick={() => {
                        if (isPopupShown) {
                            //방금 만들던 거 삭제
                            deleteLastWork();
                            setIsPopupShown(false);
                        } else if (isSelectPopupShown) {
                            setIsSelectPopupShown(false);
                        } else if (isSelectExportPopupShown) {
                            setIsSelectExportPopupShown(false);
                        }
                    }}
                ></div>
            }

            {/* POPUP */}
            {
                isPopupShown
                &&
                <LabelPopUp
                    key="labelpopup"
                    tabIndex={tabIndex}
                    input={createdLabel}
                    setInput={setCreatedLabel}
                    onCancel={() => {
                        //방금 만들던 거 삭제
                        deleteLastWork();
                        setIsPopupShown(false);
                    }}
                    onOK={(labelItem: ParseLabel) => {
                        //on create
                        //points, flattenpoints는 이미 만들어져 있음
                        //labelPoints 마지막과 연결
                        if (tabIndex === 0) {
                            setLabelPoints([...labelPoints.slice(0, -1), labelItem]);
                            setClickedParseIndex(points.length - 1);
                        } else if (tabIndex === 1) {
                            setGarmentLabelPoints([...garmentLabelPoints.slice(0, -1), labelItem]);
                            setClickedGarmentParseIndex(garmentPoints.length - 1);
                        } else if (tabIndex === 2) {
                            setKeyLabelPoints([...keyLabelPoints.slice(0, -1), labelItem]);
                            setClickedKeyParseIndex(keyPoints.length - 1);
                        }

                        setIsPopupShown(false);
                    }}
                />
            }


            {/* SelectPopUp */}
            {
                isSelectPopupShown
                &&
                <SelectPopUp
                    key="selectpopupkey"
                    title="Select type to import"
                    itemList={["parse", "garment", "keypoints", "multiple"]}
                    memoList={["", "", "", ",_p,_gp"]}
                    input={selectedType}//int
                    setInput={setSelectedType}//int
                    onCancel={() => {
                        //방금 만들던 거 삭제
                        setIsSelectPopupShown(false);
                    }}
                    onOK={(_) => {
                        setIsSelectPopupShown(false);
                        $("#json_import").click();
                    }}
                />
            }

            {/* SelectExportPopUp */}
            {
                isSelectExportPopupShown
                &&
                <SelectPopUp
                    key="selectexportpopupkey"
                    title="Select type to export"
                    itemList={["all", "one"]}
                    memoList={["all files", "one file"]}
                    input={selectedExport}//int
                    setInput={setSelectedExport}//int
                    onCancel={() => {
                        //방금 만들던 거 삭제
                        setIsSelectExportPopupShown(false);
                    }}
                    onOK={(output) => {
                        setIsSelectExportPopupShown(false);
                        //export
                        if (output === 0) {
                            //all
                            exportAllFunction();
                        } else if (output === 1) {
                            //one
                            exportOneFunction();
                        }
                    }}
                />
            }

        </div >
    );
};

export default Canvas;