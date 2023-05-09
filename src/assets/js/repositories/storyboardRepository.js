import { NetworkManager } from "../framework/utils/networkManager.js";

export class storyboardRepository {
    //# is a private field in Javascript
    #route
    #networkManager

    constructor() {
        this.#route = "/storyboard"
        this.#networkManager = new NetworkManager();
    }

    /**
     * this function gets the information given from the endpoint from all story's
     * @returns {Promise<*>}
     */
    async getAll(data) {
        return await this.#networkManager
            .doRequest(`${this.#route}`, "POST", data);
    }
}