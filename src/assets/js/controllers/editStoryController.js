import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";
import {App} from "../app.js";
import {StoryboardController} from "./storyboardController.js";

export class EditStoryController extends Controller {
    #addStoryView
    #route
    #storyRepository
    #selectedStory
    #storyboardRepository

    constructor(selectedStory) {
        super();
        this.#selectedStory = selectedStory;
        this.#storyboardRepository = new storyboardRepository();
        this.#storyRepository = new storyRepository();
        this.#route = "/story"
        this.#setupView();

    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */

    async #setupView() {

        this.#addStoryView = await super.loadHtmlIntoContent("html_views/editStory.html");

        this.#addStoryView.querySelector("#myButton").addEventListener("click", event => this.#updateStory(event));
        this.#addStoryView.querySelector("#fileInput").addEventListener("change", this.displayImagePreview.bind(this));

        //fill the fields with info from the original story
        this.#setFields();

        const saveBtn = document.querySelector("#myButton");
        saveBtn.addEventListener("click", () => {this.#updateStory()});
    }

    /**
     * this method fills all the editable fields with the original data
     * @author Roos
     */
    #setFields() {
        console.log(this.#addStoryView)
        const id = this.#selectedStory.storyID;
        const idField = this.#addStoryView.querySelector("#idInput");
        idField.value = id;

        const title = this.#selectedStory.title;
        const subjectField = this.#addStoryView.querySelector("#subject");
        console.log(subjectField)
        subjectField.value = title;

        const storyBody = this.#selectedStory.body;
        const bodyField = this.#addStoryView.querySelector("#story");
        bodyField.value = storyBody;

        const year = this.#selectedStory.year;
        const month = this.#selectedStory.month;
        const day = this.#selectedStory.day;

        const date = new Date(year, month, day).toISOString().slice(0, 10);
        const dateField = this.#addStoryView.querySelector("#date");
        dateField.value = date;

        const image = this.#selectedStory.image;
        const imageField = this.#addStoryView.querySelector("#preview-image");
        imageField.src = image;
    }

    /**
     * this method updates an old story
     * @param event
     * @returns {Promise<void>}
     * @author Roos
     */
    async #updateStory() {
        console.log(this.#addStoryView.querySelector("#subject"));
        const newTitle = this.#addStoryView.querySelector("#subject").value;
        const newBody = this.#addStoryView.querySelector("#story").value;
        const baseId = this.#addStoryView.querySelector("#idInput").value;
        const newDate = this.#addStoryView.querySelector("#date");
        const [year, month, day] = newDate.value.split('-');
        const newImage = this.#addStoryView.querySelector("#fileInput");
        const oldImage = this.#selectedStory.image;

        if (!this.#validateInputFields(newTitle, newBody)) {
            return;
        }
        const formData = this.prepareFormData(newTitle, newBody, baseId, year, month, day, oldImage, newImage);

        await this.getModal(formData);
    }

    /**
     * this method puts all the new data in the formdata
     * @param newTitle
     * @param newBody
     * @param baseId
     * @param year
     * @param month
     * @param day
     * @param oldImage
     * @param newImage
     * @returns {FormData}
     */
    prepareFormData(newTitle, newBody, baseId, year, month, day, oldImage, newImage) {
        const formData = new FormData();

        formData.append("title", newTitle);
        formData.append("body", newBody);
        formData.append("id", baseId);
        formData.append("year", year);
        formData.append("month", month);
        formData.append("day", day);
        formData.append("otherImage", oldImage);
        formData.append("image", newImage.files[0]);
        return formData;
    }

    /**
     * this method gets and shows the modal
     * @param formData with new data of story
     * @returns {Promise<void>}
     */
    async getModal(formData) {
        try {
            // Get the modal
            const modal = this.#addStoryView.querySelector("#myModal");
            modal.style.display = "block";

            const confirm = this.#addStoryView.querySelector(".modal-buttons");

            confirm.addEventListener("click", event => {
                modal.style.display = "none";
                App.setCurrentController(new StoryboardController())
            });
            await this.#storyboardRepository.updateStory(formData);
        } catch (error) {
            console.log(error);
        }
    }

    displayImagePreview(event) {

        const fileInput = event.target;
        const previewImage = this.#addStoryView.querySelector("#preview-image");


        previewImage.style.width = "300px";
        previewImage.style.height = "200px";
        previewImage.style.objectFit = "contain";

        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (event) {
                previewImage.src = event.target.result;
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            previewImage.src = "";
        }
    }


    /**
     * Validates the input fields for adding a new story.
     // * @param {string} subject - The subject of the story.
     // * @param {string} story - The body of the story.
     * @returns {boolean} - True if the input fields are valid, false otherwise.
     */
    #validateInputFields(newTitle, newBody) {
        const errorTextSubject = this.#addStoryView.querySelector("#subject-error");
        const errorTextStory = this.#addStoryView.querySelector("#story-error");

        // Validate the input fields
        if (!newTitle || newTitle === "") {
            return errorTextSubject.innerHTML = "Please fill in the subject field", false;
        }
        errorTextSubject.innerHTML = "";

        if (!newBody || newBody === "") {
            return errorTextStory.innerHTML = "Please fill in the story field", false;
        }
        errorTextStory.innerHTML = "";

        return true;
    }

}