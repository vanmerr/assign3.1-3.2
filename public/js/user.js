import apiRequest from "./apirequest.js";

/* A small data model to represent a Post. */
export class Post {
  /* data is the post data from the API. */
  constructor(data) {
    /* Technically we don't have a full User object here (no followers list), but this is still useful. */
    this.user = new User(data.user);
    this.time = new Date(data.time);
    this.text = data.text;
  }
}

/* A data model representing a user of the app. */
export default class User {
  /* Returns an array of user IDs. */
  static async listUsers() {
    let data = await apiRequest("GET", "/users");
    return data.users;
  }

  /* Returns a User instance, creating the user if necessary. */
  static async loadOrCreate(id) {
    const data = await apiRequest("GET", `/users/${id}`);
    if (data) return new User(data);
    else {
      const data = {
        user: {
          id: id,
          name: "New User",
          avatarURL: "images/default.png",
          following: []
        }
      };
      let user = await apiRequest("POST", `/users/${id}`, data);
      return new User(user);
    }
  }

  /* data is the user object from the API. */
  constructor(data) {
    Object.assign(this, data);
  }

  /* The string representation of a User is their display name. */
  toString() {
    return this.name;
  }

  /* Returns an Object containing only the instances variables we want to send back to the API when we save() the user. */
  toJSON() {
  }

  /* Save the current state (name and avatar URL) of the user to the server. */
  async save(body) {
    const data = await apiRequest("PUT", `/users/${this.id}`, body);
    return Object.assign(data);
  }

  /* Gets the user's current feed. Returns an Array of Post objects. */
  async getFeed() {
    //TODO
    const data = await apiRequest("GET", `/users/${this.id}/feed`);
    return data.posts.map((post) => new Post(post));
  }

  /* Create a new post with hte given text. */
  async makePost(text) {
    let data = {
      post: {
        userId: this.id,
        time: new Date(),
        text: text
      }
    };
    await apiRequest("POST", `/posts/${this.id}`, data);
  }

  /* Start following the specified user id. Does not handle any HTTPErrors generated by the API. */
  async addFollow(id) {
    let body = {
      id: this.id,
      idFollow: id
    };
    const data = await apiRequest("PUT", `/users/${this.id}/addfollowing`, body);
    return Object.assign(data);
  }

  /* Stop following the specified user id. Does not handle any HTTPErrors generated by the API. */
  async deleteFollow(id) {
    let body = {
      id: this.id,
      idDel: id
    };
    const data = await apiRequest("PUT", `/users/${this.id}/deletefollowing`, body);
    return Object.assign(data);
  }
}