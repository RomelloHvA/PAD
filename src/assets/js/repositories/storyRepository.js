<<<<<<< HEAD
=======
/**
 * repository for interacting with stories. Also interacts with networkmanager
 */
>>>>>>> Romello
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


        const response = await this.#networkManager.doFileRequest(`${this.#route}/add`, "POST", requestBody, {
            'Content-Type': `multipart/form-data;`
        });

        return response;
    }

        return await this.#networkManager.doRequest(`${this.#route}/add`, "POST", requestBody);
    }
    async getHighestRatedStory() {
        return await this.#networkManager.doRequest(`${this.#route}/highestRated`, "GET");
    }
    async getHighestStoryPerYear(query) {
        return await this.#networkManager.doRequest(`${this.#route}/highestRatedPerYear?year=${query}`, "GET");
    }

    async delete() {

    }

    //example endpoint would be: /users/register
    async register(username, password) {

    }

    async update(id, values = {}) {

    }
}