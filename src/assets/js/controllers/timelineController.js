import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class TimelineController extends Controller {
    #createTimelineView;
    #storyRepository;
    #currentScrollYear;
    #MIN_SCROLL_YEAR = 1970;
    #MAX_SCROLL_YEAR = new Date().getFullYear();
    #nextStoryPosition;

    constructor() {
        super();
        this.#storyRepository = new storyRepository();
        this.#setupView();
    }

    async #setupView() {
        this.#createTimelineView = await super.loadHtmlIntoContent(
            "html_views/timeline.html");
        // await this.#storyRepository.getHighestStoryPerYear(this.#currentScrollYear)
        console.log();
    }
}