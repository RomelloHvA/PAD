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
        return await this.#networkManager.doRequest(`${this.#route}/add`, "POST", requestBody);
    }

    async delete() {

    }

    //example endpoint would be: /users/register
    async register(username, password) {

    }

    async update(id, values = {}) {

    }
}