/**
 * Controller for handling a logged in user their profile page
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {UsersRepository} from "../repositories/usersRepository.js";

export class myProfileController extends Controller {

    #userId;
    #CHARACTER_LIMIT = 500;
    #myProfileView;
    #storyData;
    #userData;
    #storyRepository;
    #usersRepository;
    #editStoryUrl;
    #singleStoryUrl = "#singleStory?storyId="
    #storyTemplate;
    #selectedSortingOrder;
    #sortingASC = "Meest recente post";
    #selectMenu;


    constructor(userId) {
        super();
        this.#storyRepository = new storyRepository();
        this.#usersRepository = new UsersRepository();
        this.#userId = userId;
        this.#setupView().then();
    }

    /**
     * Setups the view for the logged in person their profile page adds the stories sorted by creation date ASC first time.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */
    async #setupView() {
        this.#myProfileView = await this.loadHtmlIntoContent("html_views/myProfile.html");
        this.#storyTemplate = await this.#myProfileView.querySelector("#story-template");
        this.#selectMenu = this.#myProfileView.querySelector("#post-select");
        await this.#setUserFields();
        await this.#getAllUserStories();
        this.#loadStoriesHeader();
        this.#addAllEventHandlers();



    }

    #loadStoriesHeader() {
        if (this.#storyData.length === 0) {
            this.#showNoStoriesHeader();
        } else {
            this.#selectedSortingOrder = this.#sortingASC;
            //Sorts the stories ascending when loading the page.
            this.#sortStoriesData(this.#selectedSortingOrder, this.#storyData);

        }
    }

    /**
     *
     * @returns {Promise<void>} When the promise is fulfilled it should give the userData for the given userID
     * @author Romello ten Broeke
     */

    async #getUserData() {
        this.#userData = await this.#usersRepository.getUserById(this.#userId);
    }

    /**
     *
     * @returns {Promise<void>} Returns all the stories for one specific userID.
     * @author Romello ten Broeke
     */
    async #getAllUserStories() {
        this.#storyData = await this.#storyRepository.getAllForUser(this.#userId);
    }

    /**
     * Fills in all the userdata in the corresponding fields.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */
    async #setUserFields() {

        await this.#getUserData();
        let maxLikes = await this.#getTotalLikesForUser();

        this.#setTotalLikesInView(maxLikes[0].total_likes);

        let emailField = this.#myProfileView.querySelector("#user-email");
        let firstNameField = this.#myProfileView.querySelector("#first-name");
        let lastNameField = this.#myProfileView.querySelector("#last-name");
        let phoneNumberField = this.#myProfileView.querySelector("#phone-number");

        emailField.value = this.#userData[0].email;
        firstNameField.value = this.#userData[0].firstName;
        lastNameField.value = this.#userData[0].lastName;
        phoneNumberField.value = this.#userData[0].phoneNr;
    }

    /**
     * Gets the total amount of likes for a given userID
     * @returns {Promise<*>}
     * @author Romello ten Broeke
     */
    async #getTotalLikesForUser() {
        return await this.#storyRepository.getTotalUpvotesForUser(this.#userId);
    }

    /**
     * Sets the total likes in the view.
     * @param totalLikes
     * @author Romello ten Broeke
     */
    #setTotalLikesInView(totalLikes) {
        this.#myProfileView.querySelector("#total-likes").innerText = totalLikes;
    }

    /**
     * Sets all the stories into the view. First it removes any older stories and then readds the stories if they were sorted.
     * @param storyData is all the story data one would need to fill in the story.
     * @author Romello ten Broeke
     */
    #setStoriesIntoView(storyData) {

        if (storyData) {
            this.#showStoriesHeader();
            let storiesContainer = this.#myProfileView.querySelector("#stories-holder");
            let storyTemplate = this.#storyTemplate.content;
            let readButtonTemplate = this.#myProfileView.querySelector(".buttonTemplate").content;

            this.#removeOldStories(storiesContainer);

            for (let i = 0; i < storyData.length; i++) {
                let usedTemplate = storyTemplate.cloneNode(true);
                let usedButton = readButtonTemplate.cloneNode(true);

                let storyId = storyData[i].storyID;
                let storyTitle = storyData[i].title;
                let storyBody = storyData[i].body;
                let storyDay = storyData[i].day;
                let storyMonth = storyData[i].month;
                let storyYear = storyData[i].year;
                let storyDate = storyDay + "-" + storyMonth + "-" + storyYear;

                if (storyBody.length > this.#CHARACTER_LIMIT) {
                    storyBody = storyBody.slice(0, this.#CHARACTER_LIMIT) + "...";
                }

                usedButton.querySelector(".read-button").href = this.#singleStoryUrl + storyId
                usedTemplate.querySelector(".card-title").innerText = storyTitle;

                usedTemplate.querySelector(".card-body").innerText = storyBody;
                usedTemplate.querySelector(".card-body").append(usedButton);
                usedTemplate.querySelector(".year").innerText = storyDate;

                storiesContainer.append(usedTemplate);

            }

        } else {
            this.#showNoStoriesHeader();
        }

    }

    /**
     * Method for showing a different html element depending on when it is called upon.
     * @author Romello ten Broeke
     */
    #showStoriesHeader() {
        let noStoriesDiv = this.#myProfileView.querySelector("#no-stories");
        if (noStoriesDiv) {
            noStoriesDiv.parentNode.removeChild(noStoriesDiv);
        }

        this.#myProfileView.querySelector("#stories-header").classList.remove("visually-hidden");
        this.#myProfileView.querySelector("#sorting-menu").classList.remove("visually-hidden")
    }

    /**
     * Method for showing a different html element depending on when it is called upon.
     * @author Romello ten Broeke
     */
    #showNoStoriesHeader() {

        let storiesDiv = this.#myProfileView.querySelector("#stories-header");
        let storiesFilter = this.#myProfileView.querySelector("#sorting-menu");

        if (storiesDiv && storiesFilter) {
            storiesDiv.parentNode.removeChild(storiesDiv);
            storiesFilter.parentNode.removeChild(storiesFilter);

        }

        this.#myProfileView.querySelector("#no-stories").classList.remove("visually-hidden");
    }

    /**
     * This method sorts the stories and adds them back into the view after they have been sorted.
     * @param sortingOrder is the selected sorting order
     * @param stories array of all the stories to be sorted.
     * @returns {number}
     * @author Romello ten Broeke
     */
    #sortStoriesData(sortingOrder, stories) {


        if (stories.length < 2) {
            console.log("not sorted too little stories");
            this.#setStoriesIntoView(stories);
            return 0;
        }

        if (sortingOrder === this.#sortingASC) {
            stories.sort(function (a, b) {
                console.log("Sorted stories ASC");
                let firstStoryDate = new Date(a.created_at);
                let secondStoryDate = new Date(b.created_at);
                return secondStoryDate - firstStoryDate;
            })
            console.log("Sorted ASC");
            console.log(stories);
        } else {
            stories.sort(function (a, b) {
                console.log("Sorted stories DES");
                let firstStoryDate = new Date(a.created_at);
                let secondStoryDate = new Date(b.created_at);
                return firstStoryDate - secondStoryDate;
            })
            console.log("Sorted DES");
            console.log(stories);
        }

        this.#setStoriesIntoView(stories);

    }

    /**
     * Removes all the older stories.
     * @param parentNode should be the container in which the stories are being stored.
     * @author Romello ten Broeke
     */
    #removeOldStories(parentNode) {
        while (parentNode.firstChild) {
            parentNode.removeChild(parentNode.firstChild);
        }
    }

    #unlockUserDataFields() {
        this.#myProfileView.querySelector("#user-email").removeAttribute("disabled");
        this.#myProfileView.querySelector("#first-name").removeAttribute("disabled");
        this.#myProfileView.querySelector("#last-name").removeAttribute("disabled");
        this.#myProfileView.querySelector("#phone-number").removeAttribute("disabled");
        this.#myProfileView.querySelector("#save-changes-button").classList.remove("visually-hidden");
        this.#myProfileView.querySelector("#save-changes-button").classList.add("slide-animation");
    }

    #showConfirmationAlert() {
        this.#myProfileView.querySelector("#myModal").style.display = "block";
    }

    #isValidUserData() {
        return this.#isValidEmail() && this.#isValidFirstName() && this.#isValidLastName() && this.#isValidPhoneNumber();

    }

    #isValidEmail() {
        let emailHelp = this.#myProfileView.querySelector("#emailHelp");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(this.#myProfileView.querySelector("#user-email").value)){
            emailHelp.classList.remove("text-muted");
            emailHelp.classList.add("text-danger");
            emailHelp.innerText = "Voer een geldige email in.";
            return false;
        } else {
            emailHelp.classList.remove("text-danger");
            emailHelp.classList.add("text-muted");
            emailHelp.innerText = "Uw email en inlog naam";
            return true;
        }
    }

    #isValidFirstName() {
        const nameRegex = /^[a-zA-Z]+$/;
        return nameRegex.test(this.#myProfileView.querySelector("#first-name").value);
    }

    #isValidLastName() {
        const lastNameRegex = /^[a-zA-Z]+(-[a-zA-Z]+)*$/;
        return lastNameRegex.test(this.#myProfileView.querySelector("#last-name").value);
    }

    #isValidPhoneNumber() {
        const phoneNumberRegex = /^(\+|00)?(49|33|41|43|32|30|31)[\d]{8,10}$/;
        return phoneNumberRegex.test(this.#myProfileView.querySelector("#phone-number").value);
    }

    #addAllEventHandlers(){

        //Adds event handler to the "wijzig" button.
        this.#myProfileView.querySelector("#change-userdata-button").addEventListener("click", async () => {
            this.#unlockUserDataFields();
        })
        //Adds event handler to the "opslaan" knop.
        this.#myProfileView.querySelector("#save-changes-button").addEventListener("click", async () => {
            if (this.#isValidUserData()) {
                this.#showConfirmationAlert();
            }
        })

        //Sorts the stories depending on the option and adds eventlistener to the sorting menu.
        this.#selectMenu.addEventListener("change", async (event) => {
            const selectValue = event.target.value;
            this.#sortStoriesData(selectValue, this.#storyData);
            console.log(selectValue);
        });
    }
}