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


    constructor(userId) {
        super();
        this.#storyRepository = new storyRepository();
        this.#usersRepository = new UsersRepository();
        this.#userId = userId;
        this.#setupView().then();
    }

    async #setupView() {
        this.#myProfileView = await this.loadHtmlIntoContent("html_views/myProfile.html");
    }

    #getUserData(userId){

    }

}