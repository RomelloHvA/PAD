/**
 * Controller for handling a logged in user their profile page
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {UsersRepository} from "../repositories/usersRepository.js";
import {EditStoryController} from "./editStoryController.js";

export class myProfileController extends Controller {

    #userId;
    #CHARACTER_LIMIT = 500;
    #myProfileView;
    #storyData;
    #userData;
    #storyRepository;
    #usersRepository;
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
        await this.#setUserFields(true);
        await this.#getAllUserStories();
        this.#loadStoriesHeader();
        this.#addAllEventHandlers();


    }

    /**
     * Method for deciding which header to show on the profile page. Changes depending on if there is data in the storyData.
     * If there is no data a different header will be displayed.
     * @author Romello ten Broeke
     */
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
        this.#userData = await this.#usersRepository.getUserData(this.#userId);
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
    async #setUserFields(getData) {
        if (getData) {
            await this.#getUserData();
            let maxLikes = await this.#getTotalLikesForUser();

            this.#setTotalLikesInView(maxLikes[0].total_likes);
        }

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
            //For loop for adding the data into the header.
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
                usedTemplate.querySelector(".edit-button").addEventListener("click", ()=>{
                    new EditStoryController(storyData[i])
                })

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

    /**
     * Method for making all the input fields editable.
     * @author Romello ten Broeke
     */

    #unlockUserDataFields() {
        this.#myProfileView.querySelector("#user-email").removeAttribute("disabled");
        this.#myProfileView.querySelector("#first-name").removeAttribute("disabled");
        this.#myProfileView.querySelector("#last-name").removeAttribute("disabled");
        this.#myProfileView.querySelector("#phone-number").removeAttribute("disabled");

    }

    /**
     * Shows the confirmation alert.
     * @author Romello ten Broeke
     */

    #showConfirmationAlert() {
        this.#myProfileView.querySelector("#myModal").style.display = "block";
    }

    /**
     * Hides the confirmation alert.
     * @author Romello ten Broeke
     */
    #hideConfirmationAlert(){
        this.#myProfileView.querySelector("#myModal").style.display = "none";

    }
    /**
     * Method which uses helper functions to decide if all the input is valid.
     * @author Romello ten Broeke
     */
    #isValidUserData() {
        return this.#isValidEmail() && this.#isValidFirstName() && this.#isValidLastName() && this.#isValidPhoneNumber();

    }

    /**
     * Checks with a regex if the inputted value is valid.
     * @returns {boolean}
     * @author Romello ten Broeke
     */
    #isValidEmail() {
        let emailHelp = this.#myProfileView.querySelector("#emailHelp");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let emailFieldValue = this.#myProfileView.querySelector("#user-email").value;
        let emailError = "Ongeldige email";
        this.#handleInputField(emailRegex, emailHelp, emailFieldValue, emailError);

        return emailRegex.test(this.#myProfileView.querySelector("#user-email").value);
    }

    /**
     * Checks if input is valid. If it is not it will add a error message to display ot the user.
     * @param regex the regex to be used to check the input
     * @param inputFieldHelp This is where the errorText will be displayed.
     * @param inputFieldValue Value to be tested against the regex.
     * @param errorText The error text one wishes to display when the input is not valid.
     * @author Romello ten Broeke
     */
    #handleInputField(regex, inputFieldHelp, inputFieldValue, errorText) {
        if (!regex.test(inputFieldValue)) {
            inputFieldHelp.classList.remove("text-muted");
            inputFieldHelp.classList.add("text-danger");
            inputFieldHelp.innerText = errorText;
        } else {
            inputFieldHelp.classList.remove("text-danger");
            inputFieldHelp.classList.add("text-muted");
            inputFieldHelp.innerText = "";
        }
    }
    /**
     * Checks with a regex if the inputted value is valid.
     * @returns {boolean}
     * @author Romello ten Broeke
     */

    #isValidFirstName() {
        const nameRegex = /^[a-zA-Z]+$/;
        let nameFieldHelp = this.#myProfileView.querySelector("#first-name-help");
        let nameFieldValue = this.#myProfileView.querySelector("#first-name").value;
        let errorFirstName = "Voer een geldige naam in";

        this.#handleInputField(nameRegex, nameFieldHelp, nameFieldValue, errorFirstName);
        return nameRegex.test(nameFieldValue);
    }

    /**
     * Checks with a regex if the inputted value is valid.
     * @returns {boolean}
     * @author Romello ten Broeke
     */

    #isValidLastName() {
        const lastNameRegex = /^[a-zA-Z]+(?:\s{1,2}[a-zA-Z]+(-[a-zA-Z]+)*)*$/;
        let lastNameHelp = this.#myProfileView.querySelector("#last-name-help");
        let lastNameValue = this.#myProfileView.querySelector("#last-name").value;
        let errorLastName = "Ongeldige achternaam";

        this.#handleInputField(lastNameRegex, lastNameHelp, lastNameValue, errorLastName);
        return lastNameRegex.test(lastNameValue);

    }
    /**
     * Checks with a regex if the inputted value is valid.
     * @returns {boolean}
     * @author Romello ten Broeke
     */

    #isValidPhoneNumber() {
        const phoneNumberRegex = /^(\+|00|0[6])?(49|33|41|43|32|30|31|\d{2})[\d]{8,10}$/;
        let phoneNumberHelp = this.#myProfileView.querySelector("#phone-number-help");
        let phoneNumberValue = this.#myProfileView.querySelector("#phone-number").value;
        let errorPhoneNumber = "Ongeldig nummer";

        this.#handleInputField(phoneNumberRegex, phoneNumberHelp, phoneNumberValue, errorPhoneNumber);
        return phoneNumberRegex.test(phoneNumberValue);
    }

    /**
     * Adds all the event handlers
     * @author Romello ten Broeke
     */
    #addAllEventHandlers() {
        this.#userDataEventHandlers();
        this.#sortingEventHandler();
    }

    /**
     * Event handlers to be used when user data is involved.
     * @author Romello ten Broeke
     */

    #userDataEventHandlers() {
        this.#changeUserDataButton();
        this.#saveUserDataButtonEvent();
        this.#confirmUserDataHandler();
        this.#cancelUserDataHandler();

    }

    /**
     * Calls a method whenever a change is detected in the selectMenu.
     * @author Romello ten Broeke
     */
    #sortingEventHandler() {
        this.#selectMenu.addEventListener("change", async (event) => {
            const selectValue = event.target.value;
            this.#sortStoriesData(selectValue, this.#storyData);
        });
    }

    /**
     * Calls method when the save changes button is clicked.
     * @author Romello ten Broeke
     */
    #saveUserDataButtonEvent() {
        //Adds event handler to the "opslaan" knop.
        this.#myProfileView.querySelector("#save-changes-button").addEventListener("click", async () => {
            if (this.#isValidUserData()) {
                this.#showConfirmationAlert();
            }
        })
    }

    /**
     * Methods to be used when the change button is clicked.
     * @author Romello ten Broeke
     */
    #changeUserDataButton() {
        this.#myProfileView.querySelector("#change-userdata-button").addEventListener("click", async () => {
            this.#unlockUserDataFields();
            this.#showButton(this.#myProfileView.querySelector("#save-changes-button"));
            this.#showButton(this.#myProfileView.querySelector("#cancel-changes-button"));
            this.#hideButton(this.#myProfileView.querySelector("#change-userdata-button"));
        })
    }

    /**
     * Hides the desired button.
     * @param button button to be hidden
     * @author Romello ten Broeke
     */
    #hideButton(button){
        button.classList.add("visually-hidden");
    }

    /**
     * shows the button also adds a nice animation.
     * @param button to be showed.
     * @author Romello ten Broeke
     */
    #showButton(button){
        button.classList.remove("visually-hidden");
        button.classList.add("slide-animation");
    }

    /**
     * Handler user multiple methods whenever the confirm button is clicked.
     * @author Romello ten Broeke
     */

    #confirmUserDataHandler() {
        let confirmButton = this.#myProfileView.querySelector(".confirm");

        confirmButton.addEventListener("click", async () =>{
            await this.#updateUserData(this.#getUserFieldValues());
            this.#lockUserFields();
            this.#hideButton(this.#myProfileView.querySelector("#save-changes-button"));
            this.#hideButton(this.#myProfileView.querySelector("#cancel-changes-button"));
            this.#showButton(this.#myProfileView.querySelector("#change-userdata-button"));
            this.#hideConfirmationAlert();
        })
        //Lock all fields and call for update route.
    }

    /**
     * Returns a JSON with the userfields values. Can be used in a API endpoint request.
     * @returns {{firstName: string | number | any, lastName: string | number | any, phoneNr: string | number | any, userID, email: string | number | any}}
     * @author Romello ten Broeke
     */

    #getUserFieldValues(){
        return {
            firstName: this.#myProfileView.querySelector("#first-name").value,
            lastName: this.#myProfileView.querySelector("#last-name").value,
            email: this.#myProfileView.querySelector("#user-email").value,
            phoneNr: this.#myProfileView.querySelector("#phone-number").value,
            userID: this.#userId
        }
    }

    /**
     * This method calls the repository for user and the right method to use. Which is updating userdata.
     * @param userData the data to be updated. Should be in JSON format.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */
    async #updateUserData(userData) {
        await this.#usersRepository.updateUserData(userData);
    }

    /**
     * handler for whenever the cancel button is clicked.
     * Collects all the cancel buttons and then adds an eventhandler to each of them.
     * @author Romello ten Broeke
     */

    #cancelUserDataHandler() {
        let cancelButtons = this.#myProfileView.querySelectorAll(".cancel");

        cancelButtons.forEach((cancelButton) => {
            cancelButton.addEventListener("click", async () => {
                await this.#setUserFields(false);
                this.#lockUserFields();
                this.#hideButton(this.#myProfileView.querySelector("#save-changes-button"));
                this.#hideButton(this.#myProfileView.querySelector("#cancel-changes-button"));
                this.#showButton(this.#myProfileView.querySelector("#change-userdata-button"));
                this.#hideConfirmationAlert();
            });
        })
    }

    /**
     * makes the userfield uneditable.
     * @author Romello ten Broeke
     */
    #lockUserFields() {
        this.#myProfileView.querySelector("#user-email").setAttribute("disabled", "true")
        this.#myProfileView.querySelector("#first-name").setAttribute("disabled", "true");
        this.#myProfileView.querySelector("#last-name").setAttribute("disabled", "true");
        this.#myProfileView.querySelector("#phone-number").setAttribute("disabled", "true");

    }

}