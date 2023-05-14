/**
 * Controller for handling a logged in user their profile page
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {UsersRepository} from "../repositories/usersRepository.js";

export class myProfileController extends Controller {

    #userId;
    #myProfileView;
    #storyData;
    #userData;
    #storyRepository;
    #usersRepository;
    #editStoryUrl;
    #storyTemplate;


    constructor(userId) {
        super();
        this.#storyRepository = new storyRepository();
        this.#usersRepository = new UsersRepository();
        this.#userId = userId;
        this.#setupView().then();
    }

    async #setupView() {
        this.#myProfileView = await this.loadHtmlIntoContent("html_views/myProfile.html");
        this.#storyTemplate = this.#myProfileView.querySelector("#story-template");
        await this.#setUserFields();


    }

    async #getUserData() {
        this.#userData = await this.#usersRepository.getUserById(this.#userId);
    }

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

    async #getTotalLikesForUser(){
        return await this.#storyRepository.getTotalUpvotesForUser(this.#userId);
    }

    #setTotalLikesInView(totalLikes){
        this.#myProfileView.querySelector("#total-likes").innerText = totalLikes;
    }




}