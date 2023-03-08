/**
 *  Controller for the homescreen/ landingpage
 */
import {Controller} from "./controller.js";

export class HomescreenController extends Controller {
    #createHomescreenView;

    constructor() {
        super();

        this.#setupView()
    }

    async #setupView() {
        this.#createHomescreenView = await super.loadHtmlIntoContent("html_views/homeScreenTest.html");

        console.log();
    }
}