import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Vector2d } from 'konva/lib/types';

export const getAvaragePoint = (points: number[]) => {
    let totalX = 0;
    let totalY = 0;
    for (let i = 0; i < points.length; i += 2) {
        totalX += points[i];
        totalY += points[i + 1];
    }
    return {
        x: totalX / (points.length / 2),
        y: totalY / (points.length / 2),
    };
};
export const getDistance = (node1: number[], node2: number[]) => {
    let diffX = Math.abs(node1[0] - node2[0]);
    let diffY = Math.abs(node1[1] - node2[1]);
    const distaneInPixel: number = Math.sqrt(diffX * diffX + diffY * diffY);
    return Number.parseFloat(distaneInPixel.toString()).toFixed(2);
};
export const dragBoundFunc = (stageWidth: number,
    stageHeight: number, vertexRadius: number, pos: Vector2d) => {
    let x = pos.x;
    let y = pos.y;
    if (pos.x + vertexRadius > stageWidth) x = stageWidth;
    if (pos.x - vertexRadius < 0) x = 0;
    if (pos.y + vertexRadius > stageHeight) y = stageHeight;
    if (pos.y - vertexRadius < 0) y = 0;
    return { x, y };
};
export const minMax = (points: any) => {
    return points.reduce((acc: number[], val: number) => {
        acc[0] = acc[0] === undefined || val < acc[0] ? val : acc[0];
        acc[1] = acc[1] === undefined || val > acc[1] ? val : acc[1];
        return acc;
    }, []);
};

export async function file2base64(file: File) {
    let result_base64 = await new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.onload = (e) => resolve(fileReader.result);
        fileReader.readAsDataURL(file);
    });

    return result_base64;
}

export async function file2json(file: File) {
    let result_json: string = await new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
            if (fileReader.result)
                return resolve(fileReader.result.toString());
        };
        fileReader.readAsText(file);
    });
    return JSON.parse(result_json);
}

export const export2json = (content: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob([JSON.stringify(content)], {
            type: "application/json",
        })
    );
    a.setAttribute("download", fileName + ".json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export const make2zipfolder = (fileList: any[], folderName: string, zip: JSZip) => {
    //fileList obj: content, fileName, type(json/image)
    const img: JSZip | null = zip.folder(folderName);
    if (!img) return;
    for (let i = 0; i < fileList.length; i++) {
        // Zip file with the file name.
        if (fileList[i].type === 'json') {
            img.file(fileList[i].fileName + ".json", JSON.stringify(fileList[i].content));
        } else {
            const fileType = fileList[i].content.name.split(".").at(-1);
            img.file(fileList[i].fileName + "." + fileType, fileList[i].content);
        }
    }
    // img.file("smile.gif", imgData, { base64: true });
}

export const make2zip = (zip: JSZip, zipFileName: string) => {
    zip.generateAsync({ type: "blob" }).then(function (content) {
        // see FileSaver.js
        saveAs(content, zipFileName + ".zip");
    });
}

export const export2jsonzip = (fileList: any[], zipFileName: string) => {
    //fileList obj: content, fileName, type(json/image)
    const a = document.createElement("a");

    const zip = require('jszip')();
    for (let i = 0; i < fileList.length; i++) {
        // Zip file with the file name.
        if (fileList[i].type === 'json') {
            zip.file(fileList[i].fileName + ".json", JSON.stringify(fileList[i].content));
        } else {
            const fileType = fileList[i].content.name.split(".").at(-1);
            zip.file(fileList[i].fileName + "." + fileType, fileList[i].content);
        }
    }

    zip.generateAsync({ type: "blob" }).then((content: string) => {
        saveAs(content, zipFileName + ".zip");
    });

    a.setAttribute("download", zipFileName + ".zip");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


/////////////////////////////
///////PARSE FUNCTIONS///////
/////////////////////////////
