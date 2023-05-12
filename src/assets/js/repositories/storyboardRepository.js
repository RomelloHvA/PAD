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

    async addLike(userID, storyID) {
        const body = { userID: userID, storyID: storyID };
        return await this.#networkManager.doRequest(`${this.#route}/addLike`, "POST", body);
    }

    async removeLike(userID, storyID) {
        const body = { userID: userID, storyID: storyID };
        return await this.#networkManager.doRequest(`${this.#route}/removeLike`, "POST", body);
    }

    async checkAlreadyLiked(userID, storyID) {
        const body = { userID: userID, storyID: storyID };
        return await this.#networkManager.doRequest(`${this.#route}/getLike`, "POST", body);
    }

    async getStoryByUserID(userID) {
        const body = { userID: userID};
        return await this.#networkManager.doRequest(`${this.#route}/getStoryByUserID`, "POST", body);
    }

    async removeStory(storyID) {
        const body = { storyID: storyID};
        return await this.#networkManager.doRequest(`${this.#route}/removeStory`, "POST", body);

    }
}