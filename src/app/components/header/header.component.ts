import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { AiServiceService } from '../../AI/ai-service.service';
import { UserService } from '../../services/user.service';
import { Store } from '@ngrx/store';
import { AuthState } from '../../state/app.state';
import { isTokenExpired } from '../../state/auth';
import { logout } from '../../state/auth.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() fromPAGE = 'not';
  isLoggedIn: boolean = false;
  token: string | null = null;

  constructor(private store: Store<{ auth: AuthState }>) {
    store
      .select((state) => state.auth)
      .subscribe((auth: AuthState) => {
        this.token = auth.token;
        if (this.token && !isTokenExpired(this.token)) {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
          // this.store.dispatch(logout())
        }
      });
  }
}
