
/**
 * repository for interacting with stories. Also interacts with networkmanager
 */
import { NetworkManager } from "../framework/utils/networkManager.js";

export class storyRepository {
    //# is a private field in Javascript
    #route
    #networkManager

    constructor() {
        this.#route = "/story"
        this.#networkManager = new NetworkManager();
    }

    async getAll() {

    }

    async addNewStory(requestBody) {
        return await this.#networkManager.doFileRequest(`${this.#route}/add`, "POST", requestBody, {
            'Content-Type': `multipart/form-data;`
        });
    }

    async getAllForUser(query) {
        return await this.#networkManager.doRequest(`${this.#route}/getAllForUser?userId=${query}`, "GET");
    }

    async getHighestRatedStory() {
        return await this.#networkManager.doRequest(`${this.#route}/highestRated`, "GET");
    }
    async getHighestStoryPerYear(query) {
        return await this.#networkManager.doRequest(`${this.#route}/highestRatedPerYear?year=${query}`, "GET");
    }

    async getSingleStory(query){
        return await this.#networkManager.doRequest(`${this.#route}/singleStory?storyId=${query}`,"GET");
    }

    async getUpvoteForStoryId(query){
        return await this.#networkManager.doRequest(`${this.#route}/getUpvoteForStoryId?storyId=${query}`,"GET");
    }

    async delete() {

    }

    async getTotalUpvotesForUser(query){
        return await this.#networkManager.doRequest(`${this.#route}/getUpvoteForUserId?userId=${query}`, "GET")
    }

}
