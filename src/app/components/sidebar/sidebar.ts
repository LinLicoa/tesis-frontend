import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.css',
})
export class SidebarComponent {
    @Input() activeMenu = 'dashboard';

    currentUser = computed(() => this.auth.currentUser());
    isAdmin = computed(() => this.auth.isAdmin());

    constructor(private auth: AuthService, private router: Router) { }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }
}
