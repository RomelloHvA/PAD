import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class TimelineController extends Controller {
    #createTimelineView;
    #storyRepository;
    #currentScrollYear;
    #MIN_SCROLL_YEAR = 1970;
    #MAX_SCROLL_YEAR = new Date().getFullYear();
    #DEFAULT_STORY_NUMBER_ON_PAGE = 2;
    #scrollPosition;

    constructor() {
        super();
        this.#currentScrollYear = this.#MAX_SCROLL_YEAR - this.#DEFAULT_STORY_NUMBER_ON_PAGE;
        this.#storyRepository = new storyRepository();
        this.#setupView();
    }

    async #setupView() {
        this.#createTimelineView = await super.loadHtmlIntoContent(
            "html_views/timeline.html");
        // await this.#storyRepository.getHighestStoryPerYear(this.#currentScrollYear)
        this.#LoadStory()
        this.#LoadStory();

    }

    #LoadStory(){
        window.addEventListener("scroll", function () {
            console.log(window.scrollY);
            if (window.scrollY >= window.innerHeight){
                console.log("Einde bereikt");
            }
           return window.scrollY;
        });
    }

}