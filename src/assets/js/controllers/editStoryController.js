import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";

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

        //fill the fields with info from the original story
        this.#setFields();

        const saveBtn = document.querySelector("#myButton");
        saveBtn.addEventListener("click", () => {this.#updateStory()});
    }


    #setFields() {
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
        console.log(date + "date 1");
    }

    async #updateStory() {
        // event.preventDefault();
        const newTitle = this.#addStoryView.querySelector("#subject");
        const newBody = this.#addStoryView.querySelector("#story");
        const newDate = this.#addStoryView.querySelector("#date");

        let data = {
            title: newTitle.value,
            body: newBody.value,
            date: newDate.value
        }
        console.log(data.date + "nieuwe date");
        await this.#storyboardRepository.updateStory(data);


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