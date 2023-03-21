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



        let yearfield = this.#addStoryView.querySelector("#year");
        let monthfield = this.#addStoryView.querySelector("#month");
        let dayfield = this.#addStoryView.querySelector("#day");

        for (let i = 1980; i <= 2023; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.text = i;
            yearfield.add(option);
        }


        let monthDays = {
            "Januari": 31,
            "Februari": 28, // or 29 in a leap year
            "Maart": 31,
            "April": 30,
            "Mei": 31,
            "Juni": 30,
            "Juli": 31,
            "Augustus": 31,
            "September": 30,
            "Oktober": 31,
            "November": 30,
            "December": 31
        };

// Add options for months
        for (let i = 1; i <= 12; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = Object.keys(monthDays)[i-1];
            monthfield.appendChild(option);
        }


// Add event listener for month change
        monthfield.addEventListener("change", (event) => {
            let selectedMonth = Object.keys(monthDays)[event.target.value-1];
            let numDays = monthDays[selectedMonth];
            dayfield.innerHTML = "";
            for (let i = 1; i <= numDays; i++) {
                let option = document.createElement("option");
                option.value = i;
                option.textContent = i;
                dayfield.appendChild(option);
            }
        });
    }


    async addNewStory(event) {

        event.preventDefault();
        const subject = this.#addStoryView.querySelector("#subject").value;
        const year = this.#addStoryView.querySelector("#year").value;
        const month = this.#addStoryView.querySelector("#month").value;
        const day = this.#addStoryView.querySelector("#day").value;
        const story = this.#addStoryView.querySelector("#story").value;
        const fileInput = this.#addStoryView.querySelector("#fileInput");


        if(!this.#validateInputFields(subject, story)) {
            return;
        }

        const formData = new FormData();

        formData.append("subject", subject);
        formData.append("year", year);
        formData.append("story", story);
        formData.append("file", fileInput.files[0]);
        formData.append("month", month);
        formData.append("day", day);

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
            errorTextSubject.innerHTML = "Please fill in the subject field";
            return false;
        } else {
            errorTextSubject.innerHTML = "";
        }

        if (!story) {
            errorTextStory.innerHTML = "Please fill in the story field";
            return false;
        } else if (story.length > 2000) {
            errorTextStory.innerHTML = "The story cannot be longer than 2000 characters";
            return false;
        } else {
            errorTextStory.innerHTML = "";
        }

        return true;
    }


}