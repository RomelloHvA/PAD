/**
 * controller responsible for all events on the storyboard view
 * @author  Rosalinde Vester
 */

import {Controller} from "./controller.js";

export class StoryboardController extends Controller{
    #setupView
    #storyboardView


    constructor() {
        super();
        this.#setupView();
    }

    async #setupView(){
        //wait for the html to load
        this.#storyboardView = await super.loadHtmlIntoContent("html_views/storyboard.html")
        console.log("view in controller gemaakt")
    }
}