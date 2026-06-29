export class User {
  user_ID: string;
  username: string;
  password: string;
  email: string;
  role: string;
  conversation_history: string;
  constructor(
    user_ID: string,
    username: string,
    password: string,
    email: string,
    role: string,
    conversation_history: string,
  ) {
    this.user_ID = user_ID;
    this.username = username;
    this.password = password;
    this.email = email;
    this.role = role;
    this.conversation_history = conversation_history;
  }
}
