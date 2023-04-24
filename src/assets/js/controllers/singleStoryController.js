/**
 * Controller for handling and viewing a single story
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class singleStoryController extends Controller {
    #singleStoryView;
    #storyRepository;
    #storyID;
    #storyData;

    constructor() {
        super();
        this.#storyRepository = new storyRepository();
        this.#setupView().then();
    }

    async #setupView() {
        this.#singleStoryView = await this.loadHtmlIntoContent("html_views/singleStory.html");
        await this.#getClickedStoryID();
        await this.#setStoryYear();
        await this.#setStoryTitle();
        await this.#setStoryText();

    }

    async #getClickedStoryID() {
        if (sessionStorage.getItem("storyID") === null) {
            // this.#storyID = sessionStorage.getItem("storyID");
            this.#storyID = 1;
            console.log(this.#storyID);
            await this.#getStoryByID();
        } else {
            // this.#getStoryByID()
            // this.#storyID = 1;
            // console.log(this.#storyID);
        }
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