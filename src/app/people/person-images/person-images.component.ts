import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TdMediaService } from '@covalent/core';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';

// Loading service
import { TdLoadingService } from '@covalent/core';

// api
import { API } from '../../shared/api/api';
import { MOVIE_GENRES } from '../../shared/api/genres';

// services
import { PeopleService } from '../shared/people.service';

// modal gallery
import { Image } from 'angular-modal-gallery';

@Component({
  selector: 'app-person-images',
  templateUrl: './person-images.component.html',
  styleUrls: ['./person-images.component.css']
})
export class PersonImagesComponent implements OnInit, OnDestroy {

  // Used for responsive services
  columns: number;
  _querySubscription: Subscription;

  personImages = [];
  apiImg = API.apiImg + 'w500';
  apiImgOrig = API.apiImg + 'original';

  // image gallery
  images: Image[] = [];
  openModalWindow = false;
  imagePointer = 0;

  constructor(public peopleService: PeopleService,
              public route: ActivatedRoute,
              public _mediaService: TdMediaService,
              public _ngZone: NgZone,
              public _loadingService: TdLoadingService) {
  }

  ngOnInit(): void {
    this.registerLoading();

    this.updatePersonImages();

    this.checkScreen();
    this.watchScreen();
  }

  // updates the images of a given person
  updatePersonImages(): void {
    this.route.params.switchMap((params: Params) => this.peopleService
      .getPersonImages(params['id']))
      .subscribe(response => {
        this.personImages = response['profiles'].slice(0, 12);
        this.buildImagesArray();
        this.resolveLoading();
      }, err => {
        console.log(err);
        this.resolveLoading();
      });
  }

  // builds an array with all the images for the gallery
  buildImagesArray() {
    for (let i = 0; i < this.personImages.length; i++) {
      const imgUrl = this.apiImgOrig + this.personImages[i]['file_path'];
      const image = new Image(imgUrl, null, null, null);
      this.images.push(image);
    }
  }

  // opens the gallery at the selected image
  openImageModal(index: number) {
    this.imagePointer = index;
    this.openModalWindow = true;
  }

  // closes the modal gallery
  onCloseImageModal() {
    this.openModalWindow = false;
  }

  ngOnDestroy(): void {
    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
    }
  }

  /**
   * Checks the size of the screen
   */
  checkScreen(): void {
    this._ngZone.run(() => {
      if (this._mediaService.query('(max-width: 600px)')) {
        this.columns = 2;
      }
      if (this._mediaService.query('(max-width: 375px)')) {
        this.columns = 1;
      }
      if (this._mediaService.query('gt-xs')) {
        this.columns = 3;
      }
      if (this._mediaService.query('gt-sm')) {
        this.columns = 4;
      }
      if (this._mediaService.query('gt-md')) {
        this.columns = 5;
      }
    });
  }

  /**
   * subscribes to the shared 'TdMediaService' to detect changes on the size of the screen
   */
  watchScreen(): void {
    // this.columns = 4;
    this._querySubscription = this._mediaService.registerQuery('(max-width: 600px)').subscribe((matches: boolean) => {
      this._ngZone.run(() => {
        if (matches) {
          this.columns = 2;
        }
      });
    });
    this._querySubscription = this._mediaService.registerQuery('(max-width: 375px)').subscribe((matches: boolean) => {
      this._ngZone.run(() => {
        if (matches) {
          this.columns = 1;
        }
      });
    });
    this._querySubscription = this._mediaService.registerQuery('gt-xs').subscribe((matches: boolean) => {
      this._ngZone.run(() => {
        if (matches) {
          this.columns = 3;
        }
      });
    });
    this._querySubscription = this._mediaService.registerQuery('gt-sm').subscribe((matches: boolean) => {
      this._ngZone.run(() => {
        if (matches) {
          this.columns = 4;
        }
      });
    });
    this._querySubscription = this._mediaService.registerQuery('gt-md').subscribe((matches: boolean) => {
      this._ngZone.run(() => {
        if (matches) {
          this.columns = 5;
        }
      });
    });
  }

  // Methods for the loading
  registerLoading(): void {
    this._loadingService.register('person-images');
  }

  resolveLoading(): void {
    this._loadingService.resolve('person-images');
  }
}
