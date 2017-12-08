import { Component, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

// pagination
import { TdMediaService } from '@covalent/core';
import { Subscription } from 'rxjs/Subscription';

// Load shared
import { TdLoadingService } from '@covalent/core';

// api
import { API} from '../../shared/api/api';
import { MOVIE_GENRES } from '../../shared/api/genres';

// services
import { SeriesService } from '../shared/series.service';
import {Image, ImageModalEvent} from "angular-modal-gallery";

@Component({
  selector: 'app-series-images',
  templateUrl: './series-images.component.html',
  styleUrls: ['./series-images.component.css'],
  providers: [ SeriesService, TdMediaService ]
})
export class SeriesImagesComponent implements OnInit, OnDestroy {

  // Used for responsive services
  isDesktop = true;
  columns: number;
  private _querySubscription: Subscription;

  seriesBackdrops = [];
  seriesPosters = [];
  apiImg = API.apiImg + 'w500';
  apiImgOrig = API.apiImg + 'original';

  // image gallery
  images: Image[] = [];
  openModalWindow = false;
  imagePointer = 0;

  constructor(private seriesService: SeriesService,
              private route: ActivatedRoute,
              private _mediaService: TdMediaService,
              private _ngZone: NgZone,
              private _loadingService: TdLoadingService) {
  }

  ngOnInit(): void {
    this.registerLoading();

    this.updateSeriesImages();

    this.checkScreen();
    this.watchScreen();
  }

  updateSeriesImages(): void {
    this.route.params.switchMap((params: Params) => this.seriesService
      .getSeriesImages(params['id']))
      .subscribe(response => {
        this.seriesBackdrops = response['backdrops'].slice(0, 12);
        this.seriesPosters = response['posters'].slice(0, 12);
        this.buildImagesArray();
        this.resolveLoading();
      });
  }

  buildImagesArray() {
    for (let i = 0; i < this.seriesBackdrops.length; i++) {
      const imgUrl = this.apiImgOrig + this.seriesBackdrops[i]['file_path'];
      const image = new Image(imgUrl, null, null, null);
      this.images.push(image);
    }
    for (let i = 0; i < this.seriesPosters.length; i++) {
      const imgUrl = this.apiImgOrig + this.seriesPosters[i]['file_path'];
      const image = new Image(imgUrl, null, null, null);
      this.images.push(image);
    }
  }

  openImageModal(index: number) {
    this.imagePointer = index;
    this.openModalWindow = true;
  }

  onCloseImageModal(event: ImageModalEvent) {
    this.openModalWindow = false;
  }

  ngOnDestroy(): void {
    this._querySubscription.unsubscribe();
  }

  /**
   * Check the size of the screen
   */
  checkScreen(): void {
    // this.columns = 4;
    this._ngZone.run(() => {
      if (this._mediaService.query('(max-width: 600px)')) {
        this.columns = 1;
        this.isDesktop = false;
      }
      if (this._mediaService.query('gt-xs')) {
        this.columns = 2;
        this.isDesktop = true;
      }
      if (this._mediaService.query('gt-sm')) {
        this.columns = 3;
        this.isDesktop = true;
      }
      if (this._mediaService.query('gt-md')) {
        this.columns = 4;
        this.isDesktop = true;
      }
    });
  }

  /**
   * This method subscribes with the shared 'TdMediaService' to detect changes on the size of the screen
   */
  watchScreen(): void {
    // this.columns = 4;
    this._querySubscription = this._mediaService.registerQuery('(max-width: 600px)')
      .subscribe((matches: boolean) => {
        this._ngZone.run(() => {
          if (matches) {
            this.columns = 1;
            this.isDesktop = false;
          }
        });
      });
    this._querySubscription = this._mediaService.registerQuery('gt-xs').subscribe((matches: boolean) => {
      this._ngZone.run(() => {
        if (matches) {
          this.columns = 2;
          this.isDesktop = true;
        }
      });
    });
    this._querySubscription = this._mediaService.registerQuery('gt-sm').subscribe((matches: boolean) => {
      this._ngZone.run(() => {
        if (matches) {
          this.columns = 3;
          this.isDesktop = true;
        }
      });
    });
    this._querySubscription = this._mediaService.registerQuery('gt-md').subscribe((matches: boolean) => {
      this._ngZone.run(() => {
        if (matches) {
          this.columns = 4;
          this.isDesktop = true;
        }
      });
    });
  }

  // Methods for the loading
  registerLoading(): void {
    this._loadingService.register('series-images');
  }

  resolveLoading(): void {
    this._loadingService.resolve('series-images');
  }

  changeValue(value: number): void { // Usage only enabled on [LoadingMode.Determinate] mode.
    this._loadingService.setValue('seriesImages', value);
  }

}
