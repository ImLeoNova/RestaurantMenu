export class Chat {
  constructor(
    public author: 'user' | 'AI',
    public message: string | null,
    public isTyping: boolean = false,
  ) {}
}
