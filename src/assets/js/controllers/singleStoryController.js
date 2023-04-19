/**
 * Controller for handling and viewing a single story
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class singleStoryController extends Controller {
    #singleStoryView;
    #storyRepository;

    constructor() {
        super();
        this.#setupView();
    }

    #setupView(){
        this.#singleStoryView = this.loadHtmlIntoContent("html_views/singleStory.html");
    }
}