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

    //Handles a POST request to add a story to the database.
    #addStory() {
        // Handle POST request to add a story
        this.#app.post("/story/add", this.#multer().single("file"), async (req, res) => {
            try {
                // Extract data from the request
                const { body: { subject, story, year }, file } = req;

                let fileUrl = '';

                // Check if a file was uploaded and write it to disk
                if(file != null) {

                     fileUrl = `uploads/${uuidv4()}.` + this.#getFileExtension(file);

                    // Write the uploaded file to disk
                    fs.writeFile(`${wwwrootPath}/${fileUrl}`, file.buffer, async (err) => {
                        if (err) {
                            console.log(err);
                            // If an error occurred while writing to disk, send a bad request response
                            return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: err});
                        }
                    });
                }
                const MyStory = { story, subject, year, fileUrl }

                // Add the story to the database
                await this.#addToDatabase(MyStory);

            } catch (e) {
                // If an error occurred while processing the request, send a bad request response
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({ reason: e });
            }
        });
    }

    /**

     Adds a new story to the database.
     @async
     @param MyStory - An object containing the details of the story to be added.
     @param MyStory.story - The text of the story.
     @param MyStory.subject - The subject of the story.
     @param MyStory.year - The year of the story.
     @param MyStory.fileUrl - The URL of the file uploaded with the story.
     @throws If an error occurred while adding the story to the database.
     */
    async #addToDatabase(MyStory) {
        try {
            // Add the story to the database
            await this.#databaseHelper.handleQuery({
                query: "CALL UpdateStory(?, ?, ?, ?, ?, ?)",
                values: [MyStory.story, MyStory.subject, MyStory.year, MyStory.fileUrl, 0,0],
            });
        } catch (e) {
            // If an error occurred while adding the story to the database, delete the uploaded image and send a bad request response
            fs.unlink(`${wwwrootPath}/uploads/${MyStory.fileUrl}`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
}

#getFileExtension(file) {

    let fileExtension = file.originalname;
    const lastDotIndex = fileExtension.lastIndexOf(".");
    if (lastDotIndex !== -1) {
        return fileExtension.substring(lastDotIndex + 1);
    }
}

}


module.exports = storyRoutes;
