import { Component } from '@angular/core';
import { AutocompleteComponent } from '@app/shared/components';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [AutocompleteComponent],
	templateUrl: './settings.component.html',
	styleUrl: './settings.component.scss',
})
export class SettingsComponent {

	suggestions = [
    "Channel",
    "Mr Code Box",
    "Vs Code",
    "Instagram",
    "YouTube",
    "YouTuber",
    "YouTube Channel",
    "Blogger",
    "Please Like, Share & Subscribe",
    "Bollywood",
    "Vlogger",
    "Vechiles",
    "Facebook",
    "Freelancer",
    "Facebook Page",
    "Designer",
    "Developer",
    "Web Designer",
    "Web Developer",
    "Login Form in HTML & CSS",
    "How to learn HTML & CSS",
    "How to learn JavaScript",
    "How to become Freelancer",
    "How to become Web Designer",
    "How to start Gaming Channel",
    "How to start YouTube Channel",
    "What does HTML stands for?",
    "What does CSS stands for?",
];
}
