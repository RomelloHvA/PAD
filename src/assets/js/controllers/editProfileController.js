import {Controller} from "./controller.js";

import {App} from "../app.js";
import {UsersRepository} from "../repositories/usersRepository.js";

export class editProfileController extends Controller {
    #editProfileView
    #userData;
    #usersRepository;
    constructor() {
        super();
        this.#setupView();
        this.userId = App.sessionManager.get("userID");
        this.#usersRepository = new UsersRepository();
    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */
    async #setupView() {
        this.#editProfileView = await super.loadHtmlIntoContent("html_views/editProfile.html");
        await this.#setUserFields();
        this.#SaveChangesButton();
    }
    /**
     *
     * @returns {Promise<void>} When the promise is fulfilled it should give the userData for the given userID
     * @author Romello ten Broeke
     */
    async #SetUserData() {
        this.#userData = await this.#usersRepository.getUserData(this.userId);
    }
    /**
     * Fills in all the userdata in the corresponding fields.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */
    async #setUserFields() {
        await this.#SetUserData();
        console.log(this.#userData);
        let emailField = this.#editProfileView.querySelector("#user-email");
        let firstNameField = this.#editProfileView.querySelector("#first-name");
        let lastNameField = this.#editProfileView.querySelector("#last-name");
        let phoneNumberField = this.#editProfileView.querySelector("#phone-number");
        emailField.value = this.#userData[0].email;
        firstNameField.value = this.#userData[0].firstName;
        lastNameField.value = this.#userData[0].lastName;
        phoneNumberField.value = this.#userData[0].phoneNr;
    }

    /**
     * Calls method when the save changes button is clicked.
     * @author Romello ten Broeke
     */
    #SaveChangesButton() {
        //Adds event handler to the "opslaan" knop.
        this.#editProfileView.querySelector("#save-changes-button").addEventListener("click", async () => {
            if (this.#validateInputFields()) {
                let UpdatedUserData = this.#CreateNewUserObject();
                await this.#usersRepository.updateUserData(UpdatedUserData);
                //load profile page
              App.loadController(App.CONTROLLER_MYPROFILE);
            }
        })
    }

    /**
     * Returns a JSON with the userfields values. Can be used in a API endpoint request.
     * @returns {{firstName: string | number | any, lastName: string | number | any, phoneNr: string | number | any, userID, email: string | number | any}}
     * @author Romello ten Broeke
     */

    #CreateNewUserObject() {
        return {
            firstName: this.#editProfileView.querySelector("#first-name").value,
            lastName: this.#editProfileView.querySelector("#last-name").value,
            email: this.#editProfileView.querySelector("#user-email").value,
            phoneNr: this.#editProfileView.querySelector("#phone-number").value,
            userID: this.userId
        }
    }

    /**
     * Method which uses helper functions to decide if all the input is valid.
     * @author Romello ten Broeke
     */
    #validateInputFields() {
        return this.#isValidEmail() && this.#isValidFirstName() && this.#isValidLastName() && this.#isValidPhoneNumber();
    }

    /**
     * Checks with a regex if the inputted value is valid.
     * @returns {boolean}
     * @author Romello ten Broeke
     */
    #isValidEmail() {
        let emailHelp = this.#editProfileView.querySelector("#emailHelp");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let emailFieldValue = this.#editProfileView.querySelector("#user-email").value;
        let emailError = "Ongeldige email";
        this.#SetErrorText(emailRegex, emailHelp, emailFieldValue, emailError);

        return emailRegex.test(this.#editProfileView.querySelector("#user-email").value);
    }

    /**
     * Checks if input is valid. If it is not it will add a error message to display ot the user.
     * @param regex the regex to be used to check the input
     * @param inputFieldHelp This is where the errorText will be displayed.
     * @param inputFieldValue Value to be tested against the regex.
     * @param errorText The error text one wishes to display when the input is not valid.
     * @author Romello ten Broeke
     */
    #SetErrorText(regex, inputFieldHelp, inputFieldValue, errorText) {
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
        let nameFieldHelp = this.#editProfileView.querySelector("#first-name-help");
        let nameFieldValue = this.#editProfileView.querySelector("#first-name").value;
        let errorFirstName = "Voer een geldige naam in";
        this.#SetErrorText(nameRegex, nameFieldHelp, nameFieldValue, errorFirstName);
        return nameRegex.test(nameFieldValue);
    }

    /**
     * Checks with a regex if the inputted value is valid.
     * @returns {boolean}
     * @author Romello ten Broeke
     */

    #isValidLastName() {
        const lastNameRegex = /^[a-zA-Z]+(?:\s{1,2}[a-zA-Z]+(-[a-zA-Z]+)*)*$/;
        let lastNameHelp = this.#editProfileView.querySelector("#last-name-help");
        let lastNameValue = this.#editProfileView.querySelector("#last-name").value;
        let errorLastName = "Ongeldige achternaam";

        this.#SetErrorText(lastNameRegex, lastNameHelp, lastNameValue, errorLastName);
        return lastNameRegex.test(lastNameValue);

    }
    /**
     * Checks with a regex if the inputted value is valid.
     * @returns {boolean}
     * @author Romello ten Broeke
     */

    #isValidPhoneNumber() {
        const phoneNumberRegex = /^(\+|00|0[6])?(49|33|41|43|32|30|31|\d{2})[\d]{8,10}$/;
        let phoneNumberHelp = this.#editProfileView.querySelector("#phone-number-help");
        let phoneNumberValue = this.#editProfileView.querySelector("#phone-number").value;
        let errorPhoneNumber = "Ongeldig nummer";

        this.#SetErrorText(phoneNumberRegex, phoneNumberHelp, phoneNumberValue, errorPhoneNumber);
        return phoneNumberRegex.test(phoneNumberValue);
    }

}