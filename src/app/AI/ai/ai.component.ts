import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Chat } from '../AIModel/chat';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AiServiceService } from '../ai-service.service';
import {
  aiConversation_History,
  AIResponse,
  JwtDecoded,
} from '../../interfaces/interfaces';
import { Store } from '@ngrx/store';
import { AuthState } from '../../state/app.state';
import { isTokenExpired } from '../../state/auth';
import { UserService } from '../../services/user.service';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user';
import { ApiResponse } from '../../models/api-response';

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [NgClass, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css',
})
export class AiComponent {
  clicked: boolean = false;
  chats: Chat[] = [];
  inputMessage: string = '';
  isLoggedIn: boolean = false;
  token: string | null = null;
  userConversation: aiConversation_History[] = [];

  form: FormGroup = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });
  shortcuts: { name: string }[] = [
    { name: 'همبرگری خودتو معرفی کن🍔' },
    { name: 'غذا های فست فود آرین چی هستن❓' },
    { name: 'بهترین غذای فست فود چیه🔥' },
    { name: 'پر فروش ترین غذای رستوران 💎' },
  ];
  menuShow: boolean = false;
  menuShow2: boolean = false;
  stop: boolean = false;

  constructor(
    private aiService: AiServiceService,
    private dashboardService: DashboardService,
    private userAuth: UserService,
    private store: Store<{ auth: AuthState }>,
  ) {
    if (!this.stop) {
      store
        .select((state) => state.auth)
        .subscribe((auth: AuthState) => {
          this.token = auth.token;
          if (this.token && !isTokenExpired(this.token)) {
            this.isLoggedIn = true;

            const decodedJWT: JwtDecoded = jwtDecode<JwtDecoded>(this.token);
            const userID: string = decodedJWT.user_id;
            dashboardService
              .userDATA(this.token, userID)
              .subscribe((response: ApiResponse<User>) => {
                const user = response.data;

                // loading messages
                this.userConversation = JSON.parse(user.conversation_history);
                console.log(this.userConversation);
                for (const chat of this.userConversation) {
                  switch (chat.role) {
                    case 'user':
                      const userMessage: Chat = new Chat('user', chat.content);
                      this.chats.push(userMessage);
                      break;
                    case 'assistant':
                      const aiMessage: Chat = new Chat('AI', chat.content);
                      this.chats.push(aiMessage);
                      break;
                  }
                }
              });
          } else {
            this.isLoggedIn = false;
          }
        });
      this.stop = true;
    }
  }

  showMenu() {
    this.clicked = !this.clicked;
    this.menuShow2 = !this.menuShow2;

    setTimeout(() => {
      this.menuShow = !this.menuShow;
    }, 700);
  }

  unshowMenu() {
    this.menuShow2 = false;
    setTimeout(() => {
      this.menuShow = !this.menuShow;
      this.clicked = !this.clicked;
    }, 700);
  }

  sendMessage(message: string, isButton: boolean) {
    if (this.form.valid || isButton) {
      const decodedJWT: JwtDecoded = jwtDecode<JwtDecoded>(this.token + '');
      const userID: string = decodedJWT.user_id;

      if (this.isLoggedIn && this.token) {
        const newMessage: Chat = new Chat('user', message);
        this.chats.push(newMessage);
        const aiMessage: Chat = new Chat('AI', '');
        this.chats.push(aiMessage);

        console.log(message);
        this.aiService
          .getAIMessage(message, this.token)
          .subscribe((response: ApiResponse<AIResponse>) => {
            this.chats[this.chats.length - 1].message = response.data.message;
            const decodedJWT: JwtDecoded = jwtDecode<JwtDecoded>(
              this.token + '',
            );
            const userID: string = decodedJWT.user_id;

            this.dashboardService
              .userDATA(this.token, userID)
              .subscribe((response: ApiResponse<User>) => {
                const user = response.data;

                // loading messages
                this.userConversation = JSON.parse(user.conversation_history);
                console.log(JSON.parse(user.conversation_history));
              });
          });
        this.form.controls['message'].setValue('');
      }
    }
  }
}
