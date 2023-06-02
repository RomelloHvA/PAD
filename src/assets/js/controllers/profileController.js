/**
 * Controller responsible for all events in profile view
 * @author Othaim Iboualaisen
 */

import { Controller } from "./controller.js";
import {App} from "../app.js";
import {UsersRepository} from "../repositories/usersRepository.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";
import {EditStoryController} from "./editStoryController.js";

export class profileController extends Controller {
    #profileView
    #storyboardView
    #profileID
    #currentUserID
    #isCurrentUser
    #UsersRepository
    #StoryRepository

    #storyURL

    #MIN_YEAR
    #MAX_YEAR
    #display_year

    constructor() {
        super();

        this.#setupView();

        this.#UsersRepository = new UsersRepository();
        this.#StoryRepository = new storyboardRepository();

        if (App.sessionManager.get("userID")) {
            this.#currentUserID = App.sessionManager.get("userID");
        }

        let year;
        const controller = App.getCurrentController();
        if (controller.data) {
            if (controller.data.year) {
                year = controller.data.year;
            }
            this.#profileID = parseInt(controller.data.userId);
        } else {
            this.#profileID = this.#currentUserID;
        }

        this.#isCurrentUser = this.checkIfCurrentUser();


        this.#display_year = year ? year : "*";

        this.#storyURL = "#storyPage?storyId=";

        this.#MIN_YEAR = 1870;
        this.#MAX_YEAR = new Date().getFullYear();
    }

    checkIfCurrentUser() {
        if (this.#profileID === this.#currentUserID) {
            return true;
        }
        return false
    }

    /**
     * Loads contents of desired HTML file into the index.html .content div
     * @returns {Promise<void>}
     */
    async #setupView() {
        //await for when HTML is loaded, never skip this method call in a controller
        this.#profileView = await super.loadHtmlIntoContent("html_views/profile.html");

        const userData = await this.#UsersRepository.getUserInfo(this.#profileID);

        this.setupFields(userData);

        await this.setupStoryView(userData);

    }


    /**
     * Sets up the fields in the profile view with the provided user data.
     *
     * @author Othaim Iboualaisen
     *
     * @description
     * This function sets up the fields in the profile view with the provided user data.
     * It expects an array `userData` containing a single user object.
     *
     * The function retrieves the necessary DOM elements from the profile view, such as the image, name, bio, email, and phone fields.
     * Then, it populates these fields with the corresponding data from the user object.
     *
     * The user data object should have the following properties:
     * - `firstName`: The first name of the user.
     * - `lastName`: The last name of the user.
     * - `email`: The email address of the user.
     * - `phoneNr`: The phone number of the user.
     * - `total_stories`: The total number of stories by the user.
     * - `total_likes_received`: The total number of likes received by the user.
     * - `total_likes_given`: The total number of likes given by the user.
     * - `biografie` (optional): The biography of the user.
     *
     * If the biography is not provided, it checks if the current user is viewing their own profile.
     * If so, it displays a default message prompting the user to add a biography.
     * Otherwise, it leaves the bio field empty.
     *
     * After setting up the fields, it calls the `toggleInfo()` function to perform any additional necessary actions.
     *
     * This function does not return any value.
     */
    setupFields(userData) {
        let image = this.#profileView.querySelector("#profileImg");
        let name = this.#profileView.querySelector("#fullName");
        let bio = this.#profileView.querySelector("#bio");
        let email = this.#profileView.querySelector("#email");
        let phone = this.#profileView.querySelector("#phone");

        let totalStories = this.#profileView.querySelector("#total_stories");
        let totalLikesReceived = this.#profileView.querySelector("#total_received_likes");
        let totalLikesGiven = this.#profileView.querySelector("#total_given_likes");

        const profileInfo = userData[0];

        image.src = "../uploads/profileimg.png";
        name.innerHTML = profileInfo.firstName + " " + profileInfo.lastName;
        email.innerHTML = profileInfo.email;
        phone.innerHTML = profileInfo.phoneNr;

        totalStories.innerHTML = profileInfo.total_stories;
        totalLikesReceived.innerHTML = profileInfo.total_likes_received;
        totalLikesGiven.innerHTML = profileInfo.total_likes_given;


        if (profileInfo.biografie !== null) {
            bio.innerHTML = profileInfo.biografie;
        } else if (this.#isCurrentUser) {
            bio.innerHTML = "Voeg een biographie toe en vertel mensen over jezelf";
        } else {
            bio.innerHTML = "";
        }

        this.toggleInfo();
    }

    /**
     * Toggles the display of user information and edit button in the profile view.
     *
     * @author Othaim Iboualaisen
     */
    toggleInfo() {
        const editBtn = this.#profileView.querySelector("#editProfile");
        const userInfo = this.#profileView.querySelector("#userInfo");
        if (this.#isCurrentUser) {
            editBtn.addEventListener("click", () => {
                App.loadController(App.CONTROLLER_EDITPROFILE);
            })
            userInfo.style.display = "block"
        } else {
            editBtn.style.display = "none";
        }
    }

    /**
     * Sets up the story view by loading the storyboard HTML and initializing select elements.
     */
    async setupStoryView() {
        let storyBody = this.#profileView.querySelector("#storyBody");
        this.#storyboardView = await super.loadHtmlIntoCustomElement("html_views/storyboard.html", storyBody);

        // Get a reference to the select element
        const selectOrder = this.#storyboardView.querySelector("#selectOrder");
        const selectYear = this.#storyboardView.querySelector("#selectYear");

        this.populateSelect(selectYear);

        this.selectSort(selectOrder);
        this.selectYear(selectYear);
    }


    /**
     * this method gets all the story data, clones a template with this info and places in div.
     * @author Othaim Iboualaisen
     */
    async loadStories(selectedOption) {
        try {
            let sortData = this.getSortAndFilterData(selectedOption);

            // get array of all stories
            const data = await this.#UsersRepository.getUserStories(sortData);

            let template = this.#storyboardView.querySelector('#storyTemp').content;

            this.removeNodes();


            if (data.length > 0) {
                this.toggleMessage(false);

                for (let i = 0; i < data.length; i++) {
                    let storyTemp = template.cloneNode(true);
                    let storyId = data[i].storyID;
                    let userId = data[i].userID;
                    let author = data[i].author;
                    let title = data[i].title;
                    let body = data[i].body;
                    let likes = data[i].likes;
                    let image = data[i].image;

                    storyTemp.querySelector(".story").id = storyId;
                    storyTemp.querySelector("#title").innerHTML = title;
                    storyTemp.querySelector("#author").innerHTML = author;
                    storyTemp.querySelector("#body").innerHTML = body;
                    storyTemp.querySelector("#link").href = this.#storyURL + storyId;
                    storyTemp.querySelector("#counter").innerHTML = likes || 0;

                    this.toggleButtons(userId, storyTemp);

                    if (image) {
                        storyTemp.querySelector("#img").src = image;
                    } else {
                        storyTemp.querySelector("#img").src = "https://picsum.photos/300/200";
                    }

                    this.#storyboardView.querySelector("#stories").append(storyTemp);

                }

                this.getEditStory(data);

            } else {
                this.toggleMessage(true);
            }
        } catch (error) {
            console.log(error);
        }

        //checks if user is logged in
        if (App.sessionManager.get("userID")) {
            await this.likeStory();
            await this.removeStory();
        } else {
            await this.disableLikes()
            await this.disableRemoveBtn();
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
     * Returns an object containing the sort field and order properties based on the selected option and year AND userID.
     *
     * @param {string} [selectedOption] - The selected sorting option. If not provided, the default value from the "selectOrder" element will be used.
     * @returns {Object} - An object with the "year", "field", and "order" properties based on the selected option, year and userID.
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

        sortData.userID = this.#profileID;

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

    toggleButtons(userId, storyTemp) {
        if (this.#isCurrentUser) {
            storyTemp.querySelector(".editButtons").style.display = 'block';
        }
    }
    getEditStory(story) {
        let editBtn = this.#storyboardView.querySelectorAll("#editBtn");

        for (let btn of editBtn) {
            const storyID = parseInt(btn.closest(".story").id);
            btn.addEventListener("click", () => {
                for (let i = 0; i < story.length; i++) {
                    if (story[i].storyID === storyID) {
                        new EditStoryController(story[i]);
                    }
                }
            })
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
        let likeBtn = this.#storyboardView.querySelectorAll("#like");
        let likeError = this.#storyboardView.querySelectorAll("#likeError");

        // Disables error text when not logged in
        likeError.forEach(message => {
            message.style.display = "none";
        });

        for (let btn of likeBtn) {
            const storyId = parseInt(btn.closest(".story").id);
            let alreadyLiked = await this.#StoryRepository.checkAlreadyLiked(this.#currentUserID, storyId);

            //get return value from alreadyliked from promise
            let alreadyLikedValue = this.retrieveAlreadyLikedValue(alreadyLiked, this.#currentUserID, storyId);

            let likeCounter = btn.parentElement.querySelector("#counter");

            btn.addEventListener("click", async (event) => {
                if (alreadyLikedValue === 0) {
                    likeCounter.textContent = parseInt(likeCounter.textContent) + 1;
                    await this.addNewLike(this.#currentUserID, storyId);
                    alreadyLikedValue = 1;
                    btn.classList.add("liked");
                } else {
                    if (parseInt(likeCounter.textContent) > 0) {
                        likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
                    }
                    this.removeLike(this.#currentUserID, storyId);
                    alreadyLikedValue = 0;
                    btn.classList.remove("liked");
                }
            });

            if (alreadyLikedValue === 1) {
                btn.classList.add("liked");
            }
        }
    }

    async removeStory() {
        const removeBtns = this.#storyboardView.querySelectorAll("#deleteBtn");
        const storiesFromThisUser = await this.#StoryRepository.getStoryByUserID(this.#currentUserID);
        this.#updateRemoveButtonsVisibility(removeBtns, storiesFromThisUser);

        const modal = this.#storyboardView.querySelector("#myModal");

        for (let btn of removeBtns) {
            const storyId = parseInt(btn.closest(".story").id);

            btn.addEventListener("click", async (event) => {
                modal.style.display = "block";

                const yesBtn = modal.querySelector("#modal-yes");
                const noBtn = modal.querySelector("#modal-no");

                const deleteStory = async () => {
                    await this.#StoryRepository.removeStory(storyId);
                    modal.style.display = "none";
                    App.setCurrentController(new profileController())
                };

                yesBtn.addEventListener("click", deleteStory);
                noBtn.addEventListener("click", () => {
                    modal.style.display = "none";
                });
            });
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

    disableRemoveBtn() {
        let removeBtns = this.#storyboardView.querySelectorAll("#deleteBtn");

        for (let btn of removeBtns) {
            btn.disabled = true;
            btn.style.display = "none";
        }
    }

    retrieveAlreadyLikedValue(alreadyLiked, userID, storyId) {
        let alreadyLikedObject = alreadyLiked[0];
        let key = 'AlreadyLiked(' + userID + ',' + storyId + ')';
        return alreadyLikedObject[key];
    }

    async addNewLike(userID, storyID) {
        await this.#StoryRepository.addLike(userID, storyID);
    }

    async removeLike(userID, storyID) {
        await this.#StoryRepository.removeLike(userID, storyID);
    }

    /**
     Updates the visibility of the remove buttons.
     @param {NodeList} removeBtns - The collection of remove buttons to update.
     @param {Array} storiesFromThisUser - The stories associated with the current user.
     @returns {void}
     @author Tygo Geervliet && Othaim Iboualaisen
     */
    #updateRemoveButtonsVisibility(removeBtns) {
        for (let btn of removeBtns) {
                // The storyId matches one of the numbers in storiesFromThisUserValue
                btn.style.display = "block"
        }
    }

}