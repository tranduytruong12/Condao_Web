require('dotenv').config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './Routes/api.js';
import fileUpload from 'express-fileupload';

const app = express();
const port = process.env.PORT || 8888;
const hostname = process.env.HOST_NAME;


//config file upload
app.use(fileUpload());
app.use("/image", express.static(path.join(__dirname, "Public/image")));

//config req.body
app.use(cors());//Cho phép tất cả nguồn gọi API
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data

//khai báo route
app.use('/v2/api/', apiRoutes);// thêm tiền tố để biết đang gọi api

app.listen(port, hostname, () => {
    console.log(`Example app listening on port ${port}`)
})