/**
 * controller responsible for all events on the storyboard view
 * @author  Rosalinde Vester & Othaim Iboualaisen
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
        const urlParams = new URLSearchParams(window.location.search);

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

        // const slider = this.#storyboardView.querySelector("#myRange");
        // const valueLabel = this.#storyboardView.querySelector("#valueLabel");
        //
        // this.setupSlider(slider);

        // this.updateSliderValue(slider, valueLabel);

        // Update the value label position and value on input change
        // slider.addEventListener("input", () => this.updateSliderValue(slider, valueLabel));

        this.populateSelect(selectYear);

        this.selectSort(selectOrder);
        this.selectYear(selectYear);
    }

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

    toggleMessage(toggle) {
        if (toggle) {
            this.#storyboardView.querySelector(".message").innerHTML = "Er zijn geen verhalen gevonden.";
            this.#storyboardView.querySelector(".message").style.display = "block";
        } else {
            this.#storyboardView.querySelector(".message").innerHTML = "";
            this.#storyboardView.querySelector(".message").style.display = "none";
        }
    }
    setupSlider(slider) {
        slider.min = this.#MIN_YEAR;
        slider.max = this.#MAX_YEAR;
        if (this.#display_year === "*") {
            slider.disabled = true;

        } else {
            slider.value = this.#display_year;
        }
    }

    updateSliderValue(slider, valueLabel) {
        const thumbPosition = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        valueLabel.style.left = thumbPosition + "%";
        valueLabel.innerHTML = slider.value;
    }

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

    selectSort(selectOrder) {
        // Add an event listener that listens to the change event of the select element
        selectOrder.addEventListener("change", async (event) => {
            const selectedOption = event.target.value;
            await this.loadStories(selectedOption);
        });
    }

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
     Disables all like buttons on the storyboard view and changes their style to grey.
     @author Tygo Geervliet
     */
    async disableLikes() {
        const likeBtns = this.#storyboardView.querySelectorAll("#like");
        likeBtns.forEach(btn => {
            btn.className = "ui grey button";
        });
    }

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

        //disables error text when not logged in
        likeError.forEach(message => {
            message.style.display = "none";
        })
        // Check if the user has already liked each story
        likeBtn.forEach(btn => {
            let storyId = parseInt(btn.parentElement.parentElement.parentElement.id);

            let alreadyLiked = this.#storyboardRepository.checkAlreadyLiked(userID, storyId);
            //set already liked 'true' or 'false'
            if(alreadyLiked === 1) {
                alreadyLiked = false;
            }
            else {
                alreadyLiked = true;
            }

            //like counter
            let likeCounter = btn.parentElement.querySelector("#counter");


            btn.addEventListener("click", event => {
                //if story is not already liked current user
                if (!alreadyLiked) {

                    // User hasn't liked this story yet, so add the like
                    likeCounter.textContent = parseInt(likeCounter.textContent) + 1;

                    this.addNewLike(userID, storyId);

                    // Update the 'alreadyLiked' flag
                    alreadyLiked = true;

                    // Set the 'liked' class on the like button
                    btn.classList.add("liked");
                } else {
                    // User has already liked this story, so remove the like
                    if (parseInt(likeCounter.textContent) > 0) {
                        likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
                    }

                    this.removeLike(userID, storyId);
                    // Update the 'alreadyLiked' flag
                    alreadyLiked = false;

                    // Remove the 'liked' class from the like button
                    btn.classList.remove("liked");
                }
            });

            // Set the initial state of the like button
            if (alreadyLiked) {
                btn.classList.add("liked");
            }
        });
    }

    async addNewLike(userID, storyID) {
        await this.#storyboardRepository.addLike(userID, storyID);
    }

    async removeLike(userID, storyID) {

        await this.#storyboardRepository.removeLike(userID, storyID);

    }



}