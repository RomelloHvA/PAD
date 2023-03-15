/**
 * This class contains ExpressJS routes specific for uploading a file. This is an example to use.
 * this file is automatically loaded in app.js
 * multer is used for parsing formdata
 * @author Pim Meijer
 */
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');


class UploadFileRoute {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #multer = require("multer");
    #app

    /**
     * @param app - ExpressJS instance(web application) we get passed automatically via app.js
     * Important: always make sure there is an app parameter in your constructor!
     */
    constructor(app) {
        this.#app = app;
        this.uploadFile()
    }

    /**
     * Example route for uploading files
     * @private
     */
    /**
     * Uploads a file to the server.
     *
     * @function uploadFile
     * @memberof storyRoutes
     */
    uploadFile() {
        this.#app.post("/upload", this.#multer().single("file"), (req, res) => {
            if (!req.file) {
                return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({ reason: "No file was uploaded." });
            }

            // Get the buffer of the file
            const sampleFile = req.file.buffer;

            // Generate a unique file name to avoid overwriting existing files
            const fileName = uuidv4() + ".jpg";

            // Write the file to disk
            fs.writeFile(`${wwwrootPath}/uploads/${fileName}`, sampleFile, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({ reason: err });
                }

                // Construct the URL of the uploaded file
                const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

                // Return the URL of the uploaded file
                return res.status(this.#errorCodes.HTTP_OK_CODE).json({ fileUrl });
            });
        });
    }





}

module.exports = UploadFileRoute