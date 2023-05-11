/**
 * controller responsible for all events on the storyboard view
 * @author  Othaim Iboualaisen & Tygo Geervliet
 */

import {Controller} from "./controller.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";
import {App} from "../app.js";

export class StoryboardController extends Controller {
    #storyboardView
    #storyboardRepository
    #storyURL

    #MIN_YEAR
    #MAX_YEAR
    #display_year

    constructor() {
        super();
        this.#setupView();

        this.#storyboardRepository = new storyboardRepository();
        this.#storyURL = "#singleStory?storyId=";

        this.#MIN_YEAR = 1870;
        this.#MAX_YEAR = new Date().getFullYear();

        // Get the ID from the URL
        const controller = App.getCurrentController();
        let year;
        if (controller.data) {
            year = parseInt(controller.data.year);
        }
        this.#display_year = year ? year : "*";
    }

    async #setupView() {
        //wait for the html to load
        this.#storyboardView = await super.loadHtmlIntoContent("html_views/storyboard.html")
        await this.loadStories();

        // Get a reference to the select element
        const selectOrder = this.#storyboardView.querySelector("#selectOrder");
        const selectYear = this.#storyboardView.querySelector("#selectYear");

        this.populateSelect(selectYear);

        this.selectSort(selectOrder);
        this.selectYear(selectYear);
    }

    /**
     * Loads the stories with optional sorting and filtering.
     * @memberof StoryboardController
     * @async
     * @param {string} [selectedOption] - The selected sorting option.
     * @returns {Promise<void>}
     * @author Othaim Iboualaisen
     */
    async loadStories(selectedOption) {
        try {
            let sortData = this.getSortAndFilterData(selectedOption);

            // get array of all stories
            const data = await this.#storyboardRepository.getAll(sortData);

            let template = this.#storyboardView.querySelector('#storyTemp').content;

            this.removeNodes();

            if (data.length > 0) {
                this.toggleMessage(false);

                for (let i = 0; i < data.length; i++) {

                    let storyTemp = template.cloneNode(true);
                    let id = data[i].storyID;
                    let author = data[i].author;
                    let title = data[i].title;
                    let body = data[i].body;
                    let likes = data[i].likes;
                    let image = data[i].image;

                    storyTemp.querySelector(".story").id = id;
                    storyTemp.querySelector("#title").innerHTML = title;
                    storyTemp.querySelector("#author").innerHTML = author;
                    storyTemp.querySelector("#body").innerHTML = body;
                    storyTemp.querySelector("#link").href = this.#storyURL + id;
                    storyTemp.querySelector("#counter").innerHTML = likes || 0;

                    // create a new FileReader object
                    let reader = new FileReader();

                    // define a function to be called when the FileReader has finished reading the image file
                    reader.onload = function () {
                        // set the source of the 'img' element to the data URL obtained from reading the image file
                        storyTemp.querySelector("#img").src = reader.result;
                    }

                    if (image && image.type) {
                        reader.readAsDataURL(image);
                    } else {
                        storyTemp.querySelector("#img").src = "https://picsum.photos/300/200";
                    }


                    this.#storyboardView.querySelector("#stories").append(storyTemp);
                }
            } else {
                this.toggleMessage(true);
            }
        } catch (error) {
            console.log(error);
        }

        //checks if user is logged in
        if (App.sessionManager.get("userID")) {
            await this.likeStory()
        } else {
            await this.disableLikes()
        }
    }

    /**
     * Toggles the message display.
     * @memberof StoryboardController
     * @param {boolean} toggle - Whether to show or hide the message.
     * @returns {void}
     * @author Othaim Iboualaisen
     */
    toggleMessage(toggle) {
        if (toggle) {
            this.#storyboardView.querySelector(".message").innerHTML = "Er zijn geen verhalen gevonden.";
            this.#storyboardView.querySelector(".message").style.display = "block";
        } else {
            this.#storyboardView.querySelector(".message").innerHTML = "";
            this.#storyboardView.querySelector(".message").style.display = "none";
        }
    }

    /**
     * Populates the year filter select element with options.
     * @memberof StoryboardController
     * @param {HTMLSelectElement} selectYear - The year filter select element.
     * @returns {void}
     * @author Othaim Iboualaisen
     */
    populateSelect(selectYear) {
        const currentYear = new Date().getFullYear();
        const startYear = 1980;

        const yearArray = [];

        for (let year = startYear; year <= currentYear; year++) {
            yearArray.push(year);
        }
        // loop through the years array and create an option element for each year
        yearArray.forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.text = year;
            selectYear.appendChild(option);
        });
    }

    /**
     * Sets up the story sorting select element.
     * @memberof StoryboardController
     * @param {HTMLSelectElement} selectOrder - The story sorting select element.
     * @returns {void}
     * @author Othaim Iboualaisen
     */
    selectSort(selectOrder) {
        // Add an event listener that listens to the change event of the select element
        selectOrder.addEventListener("change", async (event) => {
            const selectedOption = event.target.value;
            await this.loadStories(selectedOption);
        });
    }

    /**
     * Sets up the year filter select element with optional filtering.
     * @memberof StoryboardController
     * @async
     * @param {HTMLSelectElement} selectYear - The year filter select element.
     * @returns {Promise<void>}
     * @author Othaim Iboualaisen
     */
    async selectYear(selectYear) {
        // if this.#display_year exists/is valid then select the option in the selectYear select element
        if (this.#display_year) {
            selectYear.value = this.#display_year;
            await this.loadStories();
        }

        // Add an event listener that listens to the change event of the select element
        selectYear.addEventListener("change", async (event) => {
            await this.loadStories();
        });
    }

    /**
     * Returns an object containing the sort field and order properties based on the selected option and year.
     *
     * @param {string} [selectedOption] - The selected sorting option. If not provided, the default value from the "selectOrder" element will be used.
     * @returns {Object} - An object with the "year", "field", and "order" properties based on the selected option and year.
     * @author Othaim Iboualaisen
     */
    getSortAndFilterData(selectedOption) {
        let sortData = {};
        let selectedYear = this.#storyboardView.querySelector("#selectYear").value;

        if (!selectedOption) {
            selectedOption = this.#storyboardView.querySelector("#selectOrder").value;
        }

        // Set the field and order properties of the sortData object based on the selected value
        if (selectedYear !== "*") {
            sortData.year = selectedYear;
        } else {
            if (selectedOption === "newest") {
                sortData.field = "created_at";
                sortData.order = "DESC";
            } else if (selectedOption === "oldest") {
                sortData.field = "created_at";
                sortData.order = "ASC";
            } else if (selectedOption === "most_likes") {
                sortData.field = "likes";
                sortData.order = "DESC";
            } else if (selectedOption === "least_likes") {
                sortData.field = "likes";
                sortData.order = "ASC";
            }
        }
        return sortData;
    }

    /**
     * Removes all previously appended story elements from the storyboard view.
     * @author Othaim Iboualaisen
     */
    removeNodes() {
        // get all previously appended story elements
        let storiesContainer = this.#storyboardView.querySelector("#stories");
        let prevStories = storiesContainer.querySelectorAll(".story");

        // remove previously appended story elements
        for (let i = 0; i < prevStories.length; i++) {
            prevStories[i].remove();
        }
    }

    /**
     Disables all like buttons on the storyboard view and changes their style to grey.
     @author Tygo Geervliet
     */
    async disableLikes() {
        const likeBtns = this.#storyboardView.querySelectorAll("#like");
        likeBtns.forEach(btn => {
            btn.className = "ui grey button";
            btn.addEventListener('mouseover', () => {
                btn.style.cursor = 'not-allowed';
            });
        });
    }

    /**
     This function allows the user to like or unlike a story based on their current like status for that story.
     If the story has already been liked by the user, the function unlikes it when the like button is clicked.
     If the story has not been liked by the user, the function likes the story when the like button is clicked.
     The function also updates the 'liked' status of the button and the like count accordingly.
     @author Tygo Geervliet
     */
    async likeStory() {
        let userID = App.sessionManager.get("userID");
        let likeBtn = this.#storyboardView.querySelectorAll("#like");
        let likeError = this.#storyboardView.querySelectorAll("#likeError");

        // Disables error text when not logged in
        likeError.forEach(message => {
            message.style.display = "none";
        });

        for (let btn of likeBtn) {
            let storyId = parseInt(btn.parentElement.parentElement.parentElement.id);
            let alreadyLiked = await this.#storyboardRepository.checkAlreadyLiked(userID, storyId);

            //get return value from alreadyliked from promise
            let alreadyLikedValue = this.retrieveAlreadyLikedValue(alreadyLiked, userID, storyId);

            let likeCounter = btn.parentElement.querySelector("#counter");

            btn.addEventListener("click", async (event) => {
                if (alreadyLikedValue === 0) {
                    likeCounter.textContent = parseInt(likeCounter.textContent) + 1;
                    await this.addNewLike(userID, storyId);
                    alreadyLikedValue = 1;
                    btn.classList.add("liked");
                } else {
                    if (parseInt(likeCounter.textContent) > 0) {
                        likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
                    }
                    this.removeLike(userID, storyId);
                    alreadyLikedValue = 0;
                    btn.classList.remove("liked");
                }
            });

            if (alreadyLikedValue === 1) {
                btn.classList.add("liked");
            }
        }
    }

    retrieveAlreadyLikedValue(alreadyLiked, userID, storyId) {
        let alreadyLikedObject = alreadyLiked[0];
        let key = 'AlreadyLiked(' + userID + ',' + storyId + ')';
        return alreadyLikedObject[key];
    }


    async addNewLike(userID, storyID) {
        await this.#storyboardRepository.addLike(userID, storyID);
    }

    async removeLike(userID, storyID) {

        await this.#storyboardRepository.removeLike(userID, storyID);

    }



}