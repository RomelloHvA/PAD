/**
 * Controller for handling the timeline.
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class TimelineController extends Controller {
    #timelineView;
    #storyRepository;
    #currentScrollYear;
    #nextStoryPosition;
    #MIN_SCROLL_YEAR = 1970;


    constructor() {
        super();
        this.#nextStoryPosition = "left";
        this.#storyRepository = new storyRepository();
        this.#setupView().then();

    }

    /**
     * Method for setting up the view in the browser.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */
    async #setupView() {
        this.#reloadOnce();
        this.#timelineView = await super.loadHtmlIntoContent("html_views/timeline.html");
        await this.#LoadStory();

    }

    /**
     * Fixes a bug where for the timeline where it skips years after navigating away.
     * Reloads the page if it has already been visited once to refresh all the story positions correctly along the timeline.
     * @author Romello ten Broeke
     */

    #reloadOnce() {
        if (sessionStorage.getItem("isReloaded") === null) {
            sessionStorage.setItem("isReloaded", "true");
            location.reload();
        } else {
            sessionStorage.removeItem("isReloaded");
        }
    }

    /**
     * Loads new stories when the user reaches the end of the page by scrolling
     * @author Romello ten Broeke
     */

    async #LoadStory() {
        this.#currentScrollYear = new Date().getFullYear();
        do {
            await this.#addAndSetStory();
            console.log(this.#currentScrollYear);
        } while (this.#timelineView.scrollHeight < window.outerHeight)
        console.log(this.#currentScrollYear);

        window.addEventListener("scroll", async () => {
            await this.#handleScroll();
        })


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

    /**
     * this function handles checks if the user has scrolled to the end of the page. Adds new stories if the end has been
     * reached.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */

    async #handleScroll() {
        const scrollPosition = Math.ceil(window.scrollY + window.innerHeight);

        if (scrollPosition >= this.#timelineView.scrollHeight && this.#currentScrollYear >= this.#MIN_SCROLL_YEAR) {
            await this.#addAndSetStory();
        }

    }

    /**
     * Method clones templates defined on the htlm page. Adds them along the timeline based on the last story position.
     * @author Romello ten Broeke
     */
    #addStory() {
        const templateRight = this.#timelineView.querySelector("#template-right").content.cloneNode(true);
        const templateLeft = this.#timelineView.querySelector("#template-left").content.cloneNode(true);
        let usedTemplate = this.#setTemplatePosition(this.#nextStoryPosition, templateLeft, templateRight);

        this.#timelineView.querySelector(".main-timeline").appendChild(usedTemplate);
        this.#nextStoryPosition = this.#setNextStoryPosition(this.#nextStoryPosition);
    }

    /**
     * This code defines a private method #addAndSetStory() which is used to add a new story to the timeline and set its content.
     * The method calls another private method #addStory() to add a new story to the timeline,
     * and then calls #setStoryContent() to set the content for the newly added story.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */

    async #addAndSetStory() {
        this.#addStory();
        await this.#setStoryContent();
        this.#currentScrollYear--;
    }

    /**
     * This method gets the highest rated story for the current year which the user has scrolled on.
     * If there are no stories for that year it sets a default text and title to the story.
     * @returns {Promise<void>}
     * @author Romello ten Broeke
     */

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
            storyTitle = noStoryTitle;
        } else {
            storyBody = data[dataIndex].body;
            storyTitle = data[dataIndex].title;

        }
        const cardBodies = this.#timelineView.querySelectorAll(".card-body");
        const lastCardBody = cardBodies[cardBodies.length - 1];

        const cardTitles = this.#timelineView.querySelectorAll(".card-title");
        const lastCardTitle = cardTitles[cardTitles.length - 1];

        const storyYears = this.#timelineView.querySelectorAll(".year");
        const lastStoryYear = storyYears[storyYears.length - 1];

        lastCardTitle.innerText = storyTitle;
        lastCardBody.innerText = storyBody;
        lastStoryYear.innerText = this.#currentScrollYear;

    }

}