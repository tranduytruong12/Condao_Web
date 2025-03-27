import { error } from 'console';
import path from 'path';
import fs from 'fs'

export const uploadSingleFile = async (fileObject) => {
    // save => public/images/upload
    //remember to create the upload folder first
    let uploadPath = path.resolve(__dirname, "../Public/image/products");
    console.log("Upload path:", uploadPath);


    let extName = path.extname(fileObject.name);
    let baseName = path.basename(fileObject.name, extName);

    //create final path: eg: /upload/your-image.png
    let finalName = `${baseName}-${Date.now()}${extName}`
    let finalPath = `${uploadPath}/${finalName}`;


    try {
        await fileObject.mv(finalPath);

        return {
            status: 'success',
            name: finalName,
            path: finalPath,
            err: null
        }
    } catch (error) {
        console.log(">>> check err: ", error);
        return {
            status: 'failed',
            path: null,
            err: JSON.stringify(err)
        }
    }
}

export const uploadMultipleFiles = async (filesArr) => {
    try {
        let uploadPath = path.resolve(__dirname, "../Public/image");
        let resultArr = [];
        let countSuccess = 0;
        for (let i = 0; i < filesArr.length; i++) {
            //get image extension
            let extName = path.extname(filesArr[i].name);

            //get image name
            let baseName = path.basename(filesArr[i].name, extName);

            //create final path: eg: /upload/your-image.png
            let finalName = `${baseName}-${Date.now()}${extName}`
            let finalPath = `${uploadPath}/${finalName}`;

            try {
                await filesArr[i].mv(finalPath);
                resultArr.push({
                    status: 'success',
                    name: finalName,
                    fileName: filesArr[i].name,
                    error: null
                });
                countSuccess++;
            } catch (error) {
                resultArr.push({
                    status: 'failed',
                    name: null,
                    fileName: filesArr[i].name,
                    error: JSON.stringify(error)
                });
            }
        }
        return {
            countSuccess: countSuccess,
            detail: resultArr
        }
    } catch (error) {
        console.log(">>> check err: ", error);
    }
}