/**
 * Responsible for handling the actions happening on welcome view
 * For now it uses the roomExampleRepository to get some example data from server
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

import {App} from "../app.js";
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class WelcomeController extends Controller{
    #welcomeView
    #storyRepository;

    constructor() {
        super();
        this.#storyRepository = new storyRepository();
        this.#setupView();
    }

    /**
     * Loads contents of desired HTML file into the index.html .content div
     * @returns {Promise<>}
     * @private
     */
    async #setupView() {
        //await for when HTML is loaded
        this.#welcomeView = await super.loadHtmlIntoContent("html_views/welcome.html")

        this.#handleHighestStory();
        this.#handleClickTimelineButton()
    }

    /**
     * Handles the click event of the timeline button by loading the corresponding controller using the App.loadController() method.
     * @function handleClickTimelineButton
     * @author Romello ten Broeke
     */
    #handleClickTimelineButton() {

        let timelineButton = this.#welcomeView.querySelector("#timeline-button");
        let controller = timelineButton.dataset.controller;

        timelineButton.onclick = function(){
            App.loadController(controller);
        }
    }

    /**
     * Function for handling getting the highest story. Uses a helper function to set the story into the view.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */
    async #handleHighestStory() {

        let data = await this.#storyRepository.getHighestRatedStory();
        this.#setStoryContentIntoView(data);

    }

    /**
     * Function for setting the highest rated story into the welcome page.
     * @param storyData should be the highest story obtained.
     * @author Romello ten Broeke
     */
        #setStoryContentIntoView(storyData){

        let storyTitle = this.#welcomeView.querySelector("#storyTitle");
        let storyBody = this.#welcomeView.querySelector(".story-text");

        storyTitle.innerText = storyData[0].title;
        storyBody.innerText = storyData[0].body;
        }
}