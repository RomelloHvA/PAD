/**
 * Controller for handling and viewing a single story
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {App} from "../app.js";

export class singleStoryController extends Controller {
    #singleStoryView;
    #storyRepository;
    #storyID;
    #storyData;

    /**
     *
     * @param storyId is the storyID that is stored in the URL through keypair. Keypair is after the "?" in the URL.
     * Then an identifier and after the identifier comes an =. Which will be the value.
     * @author Romello ten Broeke
     */
    constructor(storyId) {
        super();
        this.#storyRepository = new storyRepository();
        this.#storyID = storyId;
        this.#setupView().then();
    }

    async #setupView() {
        this.#singleStoryView = await this.loadHtmlIntoContent("html_views/singleStory.html");
        await this.#getStoryByID();
        await this.#setStoryYear();
        await this.#setStoryTitle();
        await this.#setStoryText();

    }


    async #getStoryByID() {
        this.#storyData = await this.#storyRepository.getSingleStory(this.#storyID);
        console.log(this.#storyData)
    }

    #setStoryYear(){
        let year = this.#singleStoryView.querySelector(".year");
        year.innerText = this.#storyData[0].year;
    }
    #setStoryTitle(){
        let storyTitle = this.#singleStoryView.querySelector(".card-title");
        storyTitle.innerText = this.#storyData[0].title;
    }
    #setStoryText(){
        let storyText = this.#singleStoryView.querySelector(".card-body");
        storyText.innerText = this.#storyData[0].body;
    }
    #setStoryPhoto(){}
    #setStoryLikes(){}
    #likeStory(){}


}