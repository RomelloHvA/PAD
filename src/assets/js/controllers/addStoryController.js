import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class addStoryController extends Controller {

    #addStoryView
    #route

    #storyRepository


    constructor() {
        super();
        this.#setupView();
        this.#storyRepository = new storyRepository();
        this.#route = "/story"

    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */

    async #setupView() {
        //await for when HTML is
        this.#addStoryView = await super.loadHtmlIntoContent("html_views/addStory.html")

        //from here we can safely get elements from the view via the right getter
        this.#addStoryView.querySelector("#myButton").addEventListener("click", event => this.addNewStory(event));

    }


    async addNewStory(event) {

        event.preventDefault();
        const subject = this.#addStoryView.querySelector("#subject").value;
        const year = this.#addStoryView.querySelector("#year").value;
        const story = this.#addStoryView.querySelector("#story").value;
        const fileInput = this.#addStoryView.querySelector("#fileInput");

        console.log(fileInput.files)
        const formData = new FormData();

        formData.append("subject", subject);
        formData.append("year", year);
        formData.append("story", story);
        formData.append("file", fileInput.files[0]);
        try {
            await this.#storyRepository.addNewStory(formData);
        }
        catch (error) {
            console.log(error);
        }

    }


}