import { error } from 'console';
import path from 'path';
import fs from 'fs'

export const uploadSingleFile = async (fileObject) => {
    try {
        // Validate file
        if (!fileObject) {
            throw new Error('No file provided');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(fileObject.mimetype)) {
            throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
        }

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (fileObject.size > maxSize) {
            throw new Error('File size exceeds 50MB limit');
        }

        // Create upload directory if it doesn't exist
        let uploadPath = path.resolve(__dirname, "../Public/image/products");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Generate unique filename
        let extName = path.extname(fileObject.name);
        let baseName = path.basename(fileObject.name, extName);
        let finalName = `${baseName}-${Date.now()}${extName}`;
        let finalPath = `${uploadPath}/${finalName}`;

        // Move file to upload directory
        await fileObject.mv(finalPath);

        return {
            status: 'success',
            name: finalName,
            path: finalPath,
            err: null
        };
    } catch (error) {
        console.error("File upload error:", error);
        return {
            status: 'failed',
            path: null,
            err: error.message
        };
    }
};

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