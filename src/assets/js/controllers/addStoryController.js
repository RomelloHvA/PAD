import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class addStoryController extends Controller {

    #addStoryView
    #route

    #storyRepository

    constructor() {
        super();
        this.#setupView();
        this.#storyRepository = new storyRepository();
        this.#route = "/story"
    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */

    async #setupView() {
        //await for when HTML is
        this.#addStoryView = await super.loadHtmlIntoContent("html_views/addStory.html")

        //from here we can safely get elements from the view via the right getter
        this.#addStoryView.querySelector("#myButton").addEventListener("click", event => this.addNewStory(event));

        this.#addStoryView.querySelector("#fileInput").addEventListener("change", this.displayImagePreview.bind(this));


    }


    async addNewStory(event) {
        event.preventDefault();
        const subject = this.#addStoryView.querySelector("#subject").value;
        const year = this.#addStoryView.querySelector("#year").value;
        const story = this.#addStoryView.querySelector("#story").value;
        const fileInput = this.#addStoryView.querySelector("#fileInput");

        // Validate the input fields
        if (!subject || !story) {
            const errorTextSubject = this.#addStoryView.querySelector("#subject-error");
            const errorTextStory = this.#addStoryView.querySelector("#story-error");
            if (!subject) {
                errorTextSubject.innerHTML = "Please fill in subject field";
            }
            else {
                errorTextSubject.innerHTML = "";
            }
            if (!story) {
                errorTextStory.innerHTML = "Please fill in story field";
            }
            else {
                errorTextStory.innerHTML = "";
            }
            return;
        }




        console.log(fileInput.files)
        const formData = new FormData();

        formData.append("subject", subject);
        formData.append("year", year);
        formData.append("story", story);
        formData.append("file", fileInput.files[0]);
        try {
            await this.#storyRepository.addNewStory(formData);
        }
        catch (error) {
            console.log(error);
        }
    }

    displayImagePreview(event) {
        const fileInput = event.target;
        const previewImage = this.#addStoryView.querySelector("#preview-image");

        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (event) {
                previewImage.src = event.target.result;
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            previewImage.src = "";
        }
    }
}