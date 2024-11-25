import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { environment } from '../../environment';

@Component({
  selector: 'app-program',
  standalone: true,
  imports: [CommonModule], // Add other required imports (e.g., CommonModule if needed)
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.css'],
})
export class ProgramComponent {
  thumbnails: string[] = [
    'https://picsum.photos/seed/100/200/300',
    'https://picsum.photos/seed/101/200/300',
    'https://picsum.photos/seed/102/200/300',
    'https://picsum.photos/seed/103/200/300',
    'https://picsum.photos/seed/104/200/300',
    'https://picsum.photos/seed/105/200/300',
    'https://picsum.photos/seed/106/200/300',
    'https://picsum.photos/seed/107/200/300',
    'https://picsum.photos/seed/108/200/300',
    'https://picsum.photos/seed/108/200/300',
    'https://picsum.photos/seed/188/200/300',
    'https://picsum.photos/seed/199/200/300',
  ];

  ip: any = localStorage.getItem('host');
  host: any = this.ip;
  clips: any[] = [];
  loading: boolean = false;

  enlargedImage: any = undefined;
  selectedIndex: any = 0;

  constructor(private router: Router) {}

  onThumbnailClick(image: any, index?: number) {
    this.selectedIndex = index;
    console.log(image);
    this.enlargedImage = image.thumbnail.path;
  }

  async ngOnInit(): Promise<void> {
    await this.fetchClips();
    this.enlargedImage = this.clips[0]?.thumbnail.path;
  }

  async fetchClips() {
    this.loading = true;
    const apiUrl = `${environment.apiUrl}/get-clips`;
    const getClips = await axios.get(apiUrl);
    console.log(getClips.data.clips);
    this.clips = getClips.data.clips;
    this.loading = false;
  }
}
