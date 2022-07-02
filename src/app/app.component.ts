import {Component, OnInit} from '@angular/core';
import {ImageComment} from "./interfaces/image-comment";
import {ImageGallery} from "./interfaces/image-gallery";
import {repeatWhen, Subject, takeUntil, timer} from "rxjs";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor() {
  }
  gallery: ImageGallery[] = [];
  thumbnailImages: ImageGallery[] = [];
  selectedImage: ImageGallery = {full: '', preview: '', thumb: '', liked: false};
  currentStep = 0;
  imagesPerStep = 4;
  showLightbox = false;
  showPreviewArrows = false;
  showThumbnailArrows = false;
  commentText: string = '';
  comments: ImageComment[] = [];
  _stop = new Subject<void>();
  _start = new Subject<void>();
  timerStartDelay = 3000;
  timerDuration = 3000;
  ngOnInit(): void {
    for (let x = 1; x <= 10; x++){
      this.gallery.push({full: `assets/pics/full/${x}.jpg`, thumb: `assets/pics/thumb/${x}.jpg`, preview: `assets/pics/preview/${x}.jpg`, liked: false});
    }
    this.thumbnailImages = this.gallery.slice(this.currentStep, this.imagesPerStep);
    this.selectedImage = this.thumbnailImages[0];
    timer(this.timerStartDelay, this.timerDuration).pipe(takeUntil(this._stop), repeatWhen(() => this._start)).subscribe(() => {
      this.movePreviewImage(1);
    });
  }
  restartAutoMoving(){
    this._stop.next();
    this._start.next();
  }

  selectImage(img: ImageGallery) {
    this.restartAutoMoving();
    this.selectedImage = img;
  }

  moveThumbnailImages(number: number) {
    if (this.currentStep + number < 0){
      return;
    }
    if (this.currentStep + this.imagesPerStep + number > this.gallery.length){
      return;
    }
    this.currentStep += number;
    this.thumbnailImages = this.gallery.slice(this.currentStep, this.currentStep + this.imagesPerStep);
  }

  movePreviewImage(number: number, restartAutoMoving: boolean = false) {
    let newIndex = (this.gallery.indexOf(this.selectedImage) + number + this.gallery.length) % this.gallery.length;
    this.selectedImage = this.gallery[newIndex];
    if (newIndex == 0){
      this.currentStep = 0;
      this.moveThumbnailImages(0);
    }
    else if (newIndex == this.gallery.length - 1){
      this.currentStep = this.gallery.length - this.imagesPerStep;
      this.moveThumbnailImages(0);
    }
    else if (newIndex < this.currentStep){
      this.moveThumbnailImages(-1);
    }
    else if (newIndex > this.currentStep + this.imagesPerStep - 1){
      this.moveThumbnailImages(1);
    }
    if (restartAutoMoving){
      this.restartAutoMoving();
    }
  }

  checkNewRow(area: HTMLTextAreaElement) {
    area.style.minHeight = this.calculateAreaHeight(area, this.commentText);
  }

  calculateAreaHeight(area: HTMLTextAreaElement, text: string){
    let perRow = 35;
    let perWidth = 350;
    let ratio = Math.floor(perRow / perWidth * area.clientWidth);
    let breakLines = 0;
    for (let x = 0; x < text.length; x ++){
      if (text[x] == '\n'){
        breakLines++;
      }
    }
    return (Math.floor(text.length / ratio) + 1 + breakLines) * 22 + 'px';
  }

  checkEnter(event: KeyboardEvent, area: HTMLTextAreaElement) {
    if (event.key == 'Enter'){
      area.style.minHeight = (area.offsetHeight + 22) + 'px';
    }
  }

  sendComment(area: HTMLTextAreaElement) {
    this.comments.push({text: this.commentText, user: 'Test User', date: new Date().getTime()});
    this.commentText = '';
    area.style.minHeight = '22px';
  }

  getComments() {
    return this.comments.reverse();
  }
  getDate(dateLong: number): string{
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear() + ' ' + date.getHours() + ':' + ('0' + (date.getMinutes())).slice(-2);
  }

  getCommentHeight(viewArea: HTMLTextAreaElement, text: string) {
    return{
      height: this.calculateAreaHeight(viewArea, text)
    };
  }

  likeToggle(img: ImageGallery) {
    img.liked = !img.liked;
  }

  openLightBox() {
    this._stop.next();
    this.showLightbox = true
  }

  closeLightBox() {
    this._start.next();
    this.showLightbox = false;
  }
}
