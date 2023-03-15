const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

class storyRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #cryptoHelper = require("../framework/utils/cryptoHelper");
    #app
    #multer = require("multer");



    constructor(app) {
        this.#app = app;
        this.#addStory();
    }


    #addStory() {

        this.#app.post("/story/add", this.#multer().single('file'), async (req, res) => {
            const subject = req.body.subject;
            const story = req.body.story;
            const year = req.body.year;

            console.log(req.file)
            if (!req.file) {
                return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "No file was uploaded."});
            }
            // Get the buffer of the file
            const sampleFile = req.file.buffer;

            // Generate a unique file name to avoid overwriting existing files
            const fileName = uuidv4() + ".jpg";
            let fileUrl = "";
            console.log("test")
            // Write the file to disk
            fs.writeFile(`${wwwrootPath}/uploads/${fileName}`, sampleFile, async (err) => {
                if (err) {
                    console.log(err);
                    return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: err});
                }

                // Construct the URL of the uploaded file
                 fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
                console.log(fileUrl);

                 console.log(fileUrl)
                 let statusCode, message;
                 try {
                     const data = await this.#databaseHelper.handleQuery({
                         query: "INSERT INTO story (body, title, date, image) VALUES (?, ?, ?, ?);",
                         values: [story, subject, year, fileUrl]
                     });

                     statusCode = this.#errorCodes.HTTP_OK_CODE;
                     message = "ok";
                 } catch (e) {
                     statusCode = this.#errorCodes.BAD_REQUEST_CODE;
                     message = {reason: e};
                 }
                 res.status(statusCode).json(message);
            });


        })
    }
}




module.exports = storyRoutes;
