import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {TdMediaService, TdSearchBoxComponent} from '@covalent/core';

// Observable class extensions
import 'rxjs/add/observable/of';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';

// services
import { SearchService } from '../shared/search.service';
import {API} from '../../shared/api/api';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  providers: [  ],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit {
  @ViewChild('searchBar') searchBar: TdSearchBoxComponent;

  private searchInputTerm = new Subject<string>();
  complete: Observable<Array<any>>;
  results = [];
  searchBoxTerm = '';
  debounce = 0;
  alwaysVisible = false;

  apiImg = API.apiImg + 'w300';

  constructor(public _mediaService: TdMediaService,
              private searchService: SearchService,
              private router: Router) {
  }

  ngOnInit() {
    this.updateSearch();
  }

  updateSearch(): void {
    this.complete = this.searchInputTerm
      .debounceTime(300)
      .distinctUntilChanged()
      .switchMap(query => query ?
        this.searchService.searchMulti(query, 1)
          .map(response => response['results'].sort((a, b) => b['popularity'] - a['popularity'])) :
        Observable.of<Array<any>>([])).do(response => {
          this.results = response;
        });
  }

  search(event: string): void {
    // console.log(event);
    this.searchInputTerm.next(event);
  }

  clear() {
    this.searchBar.value = '';
    this.searchInputTerm.next('');
    if (this.searchBar.searchVisible) {
      this.searchBar.toggleVisibility();
    }
  }

  onEnter() {
    const query = this.searchBar.value;
    this.clear();
    // this.complete = Observable.of<Array<any>>([]);
    this.router.navigate(['/search', 'movie', {'query': query, 'page': 1}]);
  }

  onFocusOut() {
    this.searchInputTerm.next('');
  }

}
