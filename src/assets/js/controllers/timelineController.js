import {Controller} from "./controller.js";

export class TimelineController extends Controller {
    #createTimelineView;

    constructor() {
        super();

        this.#setupView()
    }

    async #setupView() {
        this.#createTimelineView = await super.loadHtmlIntoContent(
            "html_views/timeline.html");
        console.log();
    }
}