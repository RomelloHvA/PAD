/**
 * Controller for handling the timeline.
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class TimelineController extends Controller {
    #createTimelineView;
    #storyRepository;
    #currentScrollYear;
    #nextStoryPosition = "left";

    #MIN_SCROLL_YEAR = 1970;
    constructor() {
        super();
        this.#currentScrollYear = new Date().getFullYear();
        this.#storyRepository = new storyRepository();
        this.#setupView();
    }

    async #setupView() {
        this.#createTimelineView = await super.loadHtmlIntoContent(
            "html_views/timeline.html");
        this.#LoadStory();

    }

    /**
     * Loads new stories when the user reaches the end of the page by scrolling
     * @author Romello ten Broeke
     */

    async #LoadStory() {
        let currentScrollYear = this.#currentScrollYear;
        const minScrollYear = this.#MIN_SCROLL_YEAR;

        //Checks if there is a scrollbar if not, adds stories until there is.
        do {
            await this.#addAndSetStory();
        } while (this.#createTimelineView.scrollHeight < window.outerHeight)


        window.addEventListener("scroll",this.handleScroll())



}
    /**
     * This functions adds the story to the html and determines which position the next story needs to get.
     * @author Romello ten Broeke
     */



    #setNextStoryPosition(nextStoryPosition) {
        if (nextStoryPosition === "left") {
            return "right";
        } else {
            return "left";
        }
    }
    /**
     *
     * @param nextStoryPosition is the value of the where the story is supposed to be relative to the timeline.
     * @param templateLeft is the left positioned  template. Stored in the header
     * @param templateRight is the right positioned template. Stored in the header
     * @returns a template in the correct position.
     */

    #setTemplatePosition(nextStoryPosition, templateLeft, templateRight) {

        if (nextStoryPosition === "left") {
            return templateLeft;
        } else {
            return templateRight
        }

    }
    async handleScroll() {
        const scrollPosition = Math.ceil(window.scrollY + window.innerHeight);

        if (scrollPosition >= view.scrollHeight && currentScrollYear >= minScrollYear) {
            await this.#addAndSetStory();
        }
    }

    #addStory() {
        const templateRight = this.#createTimelineView.querySelector("#template-right").content.cloneNode(true);

        const templateLeft = this.#createTimelineView.querySelector("#template-left").content.cloneNode(true);

        let usedTemplate = this.#setTemplatePosition(this.#nextStoryPosition, templateLeft, templateRight);

        usedTemplate.querySelector(".year").innerText = this.#currentScrollYear;

        this.#createTimelineView.querySelector(".main-timeline").appendChild(usedTemplate);
        this.#nextStoryPosition = this.#setNextStoryPosition(this.#nextStoryPosition);
    }
    async #addAndSetStory() {
        this.#addStory();
        await this.#setStoryContent();
        this.#currentScrollYear--;
    }
    async #setStoryContent() {
        const noStoryMessageBody = "Helaas is er over deze periode nog geen verhaal bekend " +
            "of er zijn niet genoeg verhalen. Met uw hulp kunnen wij nog meer verhalen toevoegen.";
        const noStoryTitle = "Helaas geen verhaal";
        let dataIndex = 0
        let data = await this.#storyRepository.getHighestStoryPerYear(this.#currentScrollYear);
        let storyBody;
        let storyTitle;

        if (data[dataIndex] === undefined) {
            storyBody = noStoryMessageBody;
            storyTitle =  noStoryTitle;
        } else {
            storyBody = data[dataIndex].body;
            storyTitle = data[dataIndex].title;
            dataIndex++;

        }
        const cardBodies = this.#createTimelineView.querySelectorAll(".card-body");
        const lastCardBody = cardBodies[cardBodies.length - 1];
        const cardTitles = this.#createTimelineView.querySelectorAll(".card-title")
        const lastCardTitle = cardTitles[cardTitles.length - 1];

        lastCardTitle.innerText = storyTitle;
        lastCardBody.innerText = storyBody;


    }
}