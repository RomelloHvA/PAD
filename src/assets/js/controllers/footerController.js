/**
 *  Controller for the homescreen/ landingpage
 */
import {Controller} from "./controller.js";

export class FooterController extends Controller {
    #createHomescreenView;

    constructor() {
        super();

        this.#setupView()
    }

    async #setupView() {
        this.#createHomescreenView = await super.loadHtmlIntoCustomElement(
            "html_views/footer.html", document.querySelector("footer"));
        console.log();
    }
}