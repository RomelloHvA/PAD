import { NetworkManager } from "../framework/utils/networkManager.js";

export class storyboardRepository {
    //# is a private field in Javascript
    #route
    #networkManager
    #editRoute

    constructor() {
        this.#route = "/storyboard"
        this.#editRoute = "/storyboard/edit"
        this.#networkManager = new NetworkManager();
    }

    /**
     * this function gets the information given from the endpoint from all story's
     * @returns {Promise<*>}
     */
    async getAll() {
        return await this.#networkManager.doRequest(`${this.#route}`, "GET");
    }
    async updateStory(data){
        return await this.#networkManager.doFileRequest(`${this.#editRoute}`, "POST", data, {
            'Content-Type': `multipart/form-data;`
        });
    }

    async delete() {

    }

    //example endpoint would be: /users/register
    async register(username, password) {

    }

    async update(id, values = {}) {

    }
}