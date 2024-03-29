import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {App} from "../app.js";
import {StoryboardController} from "./storyboardController.js";

export class addStoryController extends Controller {

    #addStoryView
    #route
    #storyRepository;
    #controllerData;
    #minimumDate;

    constructor() {
        super();
        this.#setupView();
        this.#storyRepository = new storyRepository();
        this.#route = "/story"
        this.#controllerData = App.getCurrentController();
        this.#minimumDate = 1980;
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


        let dayfield = this.#addStoryView.querySelector("#day");
        dayfield.disabled = true;
        dayfield.placeholder = "selecteer eerst een maand";
        this.storyCharacterCount();
        this.populateYearField();

        let monthfield = this.#addStoryView.querySelector("#month");
        this.PopulateMonthField(monthDays, monthfield);
        this.populateDayField(monthfield, monthDays, dayfield);
    }

    /**
     * @author Tygo Geervliet
     * @param monthfield
     * @param monthDays
     * @param dayfield
     */
    populateDayField(monthfield, monthDays, dayfield) {
        monthfield.addEventListener("change", (event) => {
            dayfield.disabled = false;
            let selectedMonth = Object.keys(monthDays)[event.target.value - 1];
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

    /**
     * @author Tygo Geervliet
     * @param monthDays
     * @param monthfield
     * @constructor
     */
    PopulateMonthField(monthDays, monthfield) {

        for (let i = 1; i <= 12; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = Object.keys(monthDays)[i - 1];
            monthfield.appendChild(option);
        }
    }

    /**
     * @author Tygo Geervliet & Romello ten Broeke
     */
    populateYearField() {
        let yearField = this.#addStoryView.querySelector("#year");
        const currentYear = new Date().getFullYear();
        let year = "";

        if (this.#controllerData.data) {
            year = this.#controllerData.data.year;
        }

        for (let i = this.#minimumDate; i <= currentYear; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.text = i;
            yearField.add(option);
        }

        this.#setYearField(year, yearField);

    }

    /**
     A function that tracks the number of characters entered into a story field
     and updates the character count on the page.
     @function storyCharacterCount
     @returns {void}

     @author Tygo Geervliet
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


    /**
     Add a new story.
     @function addNewStory
     @memberof ClassName
     @param {Event} event - The event object triggered by submitting the form.
     @returns {Promise<void>} - A promise that resolves when the new story is added or rejects with an error.

     @author Tygo Geervliet
     */
    async addNewStory(event) {
        event.preventDefault();
        const subject = this.#addStoryView.querySelector("#subject").value;
        const year = this.#addStoryView.querySelector("#year").value;
        let month = this.#addStoryView.querySelector("#month").value;
        let day = this.#addStoryView.querySelector("#day").value;
        const story = this.#addStoryView.querySelector("#story").value;
        const fileInput = this.#addStoryView.querySelector("#fileInput");

        if (!this.#validateInputFields(subject, story)) {
            return;
        }
        const formData = new FormData();

        formData.append("subject", subject);
        formData.append("year", year);
        formData.append("story", story);
        formData.append("file", fileInput.files[0]);
        formData.append("month", month);
        formData.append("day", day);
        formData.append("userID", App.sessionManager.get("userID"));

        try {
            await this.#storyRepository.addNewStory(formData);
            // Get the modal
            const modal = this.#addStoryView.querySelector("#myModal");
            modal.style.display = "block";

            const confirm = this.#addStoryView.querySelector(".modal-buttons");
            confirm.addEventListener("click", event => {
                modal.style.display = "none";
                App.loadController(App.CONTROLLER_STORYBOARD);
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     Display image preview when a file is selected.
     @function displayImagePreview
     @memberof ClassName
     @param {Event} event - The event object triggered by selecting a file.
     @returns {void}

     @author Tygo Geervliet
     */
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
     *
     * @author Tygo Geervliet
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

    /**
     * This method checks if a given year value is valid and changes the yearElement value appropriately.
     * @param year is the year that the user clicked on. At another page.
     * @param yearElement is the element where year will be filled in.
     * @author Romello ten Broeke
     */

    #setYearField(year, yearElement) {
        let currentDate = new Date().getFullYear();

        year = parseInt(year);

        if (Number.isFinite(year) && year.toString().length === currentDate.toString().length && year <= currentDate
            && year >= this.#minimumDate) {
            yearElement.value = year;
        } else {
            yearElement.value = currentDate;
        }
    }

}