
import FollowList from "./followlist.js";
import User, { Post } from "./user.js";

export default class App {
  constructor() {
    /* Store the currently logged-in user. */
    this._user = null;

    this._onListUsers = this._onListUsers.bind(this);
    this._loadProfile = this._loadProfile.bind(this);
    this._onSave = this._onSave.bind(this);
    this._onFollow = this._onFollow.bind(this);
    this._unFollow = this._unFollow.bind(this);
    this._onPost = this._onPost.bind(this);


    this._followContainer = document.querySelector("#followContainer");
    this._loginForm = document.querySelector("#loginForm");
    this._postForm = document.querySelector("#postForm");


    this._btnSubmitName = document.querySelector("#nameSubmit").addEventListener("click", this._onSave);
    this._btnSubmitAvatar = document.querySelector("#avatarSubmit").addEventListener("click", this._onSave);
    this._loginForm.listUsers.addEventListener("click", this._onListUsers);
    this._loginForm.login.addEventListener("click", this._loadProfile);
    this._postForm.postButton.addEventListener("click", this._onPost);


    //TODO: Initialize any additional private variables/handlers, and set up the FollowList
    this._flolowList = new FollowList(this._followContainer, this._onFollow, this._unFollow);
  }

  /*** Event handlers ***/


  async _onListUsers() {
    let users = await User.listUsers();
    let usersStr = users.join("\n");
    alert(`List of users:\n\n${usersStr}`);
  }

  //TODO: Add your event handlers/callback functions here
  async _onSave(event) {
    event.preventDefault();
    let name = document.querySelector("#nameInput").value;
    let avatarURL = document.querySelector("#avatarInput").value;
    let body = {
      id: this._user.id,
      name: name ? name : this._user.name,
      avatarURL: avatarURL ? avatarURL : this._user.avatarURL,
      following: this._user.following
    };
    document.querySelector("#nameInput").value = "";
    document.querySelector("#avatarInput").value = "";
    let user = await this._user.save(body);
    this._user = user;
    this._loadProfile(event);
  }

  async _onFollow(id) {
    let data = await this._user.addFollow(id);
    if (data.status) alert(`Erorr not following ${data.mes}`);
    let temUser = this._user;
    this._user = data.status === 404 ? temUser : data;
    this._flolowList.setList(this._user.following);
    this._loginForm.login.click();
  }

  async _unFollow(id) {
    let data = await this._user.deleteFollow(id);
    if (data.status) alert(`Erorr not following ${data.mes}`);
    let temUser = this._user;
    this._user = data.status === 404 ? temUser : data;
    this._flolowList.setList(this._user.following);
    this._loginForm.login.click();
  }

  async _onPost(event) {
    event.preventDefault();
    let text = this._postForm.newPost.value;
    this._postForm.newPost.value = "";
    await this._user.makePost(text);
    this._loadProfile(event);
  }

  /*** Helper methods ***/

  /* Add the given Post object to the feed. */
  _displayPost(post) {
    /* Make sure we receive a Post object. */
    if (!(post instanceof Post)) throw new Error("displayPost wasn't passed a Post object");

    let elem = document.querySelector("#templatePost").cloneNode(true);
    elem.id = "";

    let avatar = elem.querySelector(".avatar");
    avatar.src = post.user.avatarURL;
    avatar.alt = `${post.user}'s avatar`;

    elem.querySelector(".name").textContent = post.user;
    elem.querySelector(".userid").textContent = post.user.id;
    elem.querySelector(".time").textContent = post.time.toLocaleString();
    elem.querySelector(".text").textContent = post.text;

    document.querySelector("#feed").append(elem);
  }

  /* Load (or reload) a user's profile. Assumes that this._user has been set to a User instance. */
  async _loadProfile(event) {
    event.preventDefault();
    let idValue = this._loginForm.userid.value;
    let id = idValue ? idValue : this._user.id;
    this._loginForm.userid.value = "";
    this._user = await User.loadOrCreate(id);

    document.querySelector("#welcome").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    document.querySelector("#idContainer").textContent = this._user.id;
    /* Reset the feed. */
    document.querySelector("#feed").textContent = "";


    /* Update the avatar, name, and user ID in the new post form */
    this._postForm.querySelector(".avatar").src = this._user.avatarURL;
    this._postForm.querySelector(".name").textContent = this._user;
    this._postForm.querySelector(".userid").textContent = this._user.id;

    //TODO: Update the rest of the sidebar and show the user's feed
    let feeds = await this._user.getFeed();
    feeds.forEach((feed) => {
      this._displayPost(feed);
    });


    //setFollowing
    this._flolowList.setList(this._user.following);
  }
}
