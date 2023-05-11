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
        this.#setupView();
        this.#updateStory(selectedStory)
        this.#storyRepository = new storyRepository();
        this.#route = "/story"
        this.#storyboardRepository = new storyboardRepository();
    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */

    async #setupView() {

        this.#addStoryView = await super.loadHtmlIntoContent("html_views/editStory.html");
        this.#addStoryView.querySelector("#myButton").addEventListener("click", event => this.#updateStory(event));

        //fill the fields with info from the original story
        this.#setFields();

        const saveBtn = document.querySelector("#myButton");
        saveBtn.addEventListener("click", () => {this.#updateStory()});
    }


    #setFields() {
        const id = this.#selectedStory.storyID;
        const idField = this.#addStoryView.querySelector("#idInput");
        idField.value = id;

        const title = this.#selectedStory.title;
        const subjectField = this.#addStoryView.querySelector("#subject");
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

    async #updateStory(event) {
        // event.preventDefault();
        const newTitle = this.#addStoryView.querySelector("#subject");
        const newBody = this.#addStoryView.querySelector("#story");
        const baseId = this.#addStoryView.querySelector("#idInput");
        const newDate = this.#addStoryView.querySelector("#date");
        const [year, month, day] = newDate.value.split('-');
        const newImage = this.#addStoryView.querySelector("#fileInput");

        // if (!this.#validateInputFields(newTitle, newBody)) {
        //     return;
        // }

        const formData = new FormData();

        formData.append("title", newTitle.value);
        formData.append("body", newBody.value);
        formData.append("id", baseId.value);
        formData.append("year", year);
        formData.append("month", month);
        formData.append("day", day);
        formData.append("image", newImage.files[0]);

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

    /**
     A function that tracks the number of characters entered into a story field
     and updates the character count on the page.
     @function storyCharacterCount
     @returns {void}
     */
    storyCharacterCount() {
        const characterCount = document.getElementById("characterCount");
        const story = this.#addStoryView.querySelector("#story");
        story.addEventListener("input", function () {
            characterCount.textContent = `${story.value.length}/2000 characters entered`;

            if (story.value.length > 1999) {
                characterCount.style.color = 'red';
            } else {
                characterCount.style.color = 'black';
            }

        });
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
     * @param {string} subject - The subject of the story.
     * @param {string} story - The body of the story.
     * @returns {boolean} - True if the input fields are valid, false otherwise.
     */
    #validateInputFields(subject, story) {
        const errorTextSubject = this.#addStoryView.querySelector("#subject-error");
        const errorTextStory = this.#addStoryView.querySelector("#story-error");

        // Validate the input fields
        if (!subject) {
            return errorTextSubject.innerHTML = "Please fill in the subject field", false;
        }
        errorTextSubject.innerHTML = "";

        if (!story) {
            return errorTextStory.innerHTML = "Please fill in the story field", false;
        }
        errorTextStory.innerHTML = "";

        return true;
    }

}