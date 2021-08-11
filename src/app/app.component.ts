import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { State } from './state';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Word } from './word';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private mobileQueryListener: () => void;
  private portraitQueryListener: () => void;
  public hiraganaList: string[];
  public state: State;
  public words: Word[];
  public mainUpdatedStr: string;
  public mobileQuery: MediaQueryList;
  public portraitQuery: MediaQueryList;
  public copiedAnimation = false;
  public isInitialized = false;
  public wordShowing = null;
  public word: Word;
  public showKana: boolean;
  public showKanji: boolean;
  public showEnglish: boolean;
  public showRomanji: boolean;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
    this.portraitQuery = media.matchMedia('(orientation: portrait)');
    this.portraitQueryListener = () => changeDetectorRef.detectChanges();
    this.portraitQuery.addListener(this.portraitQueryListener);
  }

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.queryParams.subscribe(async p => {
      this.state = new State();
      
      const paramsStr = localStorage.getItem('state');
      if (paramsStr) {
        this.state = JSON.parse(paramsStr) as State;
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

      await this.showNextWord();
    });
  }

  public async initialize(): Promise<void> {
    await this.initData();
  }
  
  public getHiraganaSetting(h: string): boolean {
    return this.state.knownHiragana.indexOf(h) >= 0;
  }

  public async setHiraganaSetting(h: string, e: boolean): Promise<void> {
    if (e && this.state.knownHiragana.indexOf(h) < 0) {
      this.state.knownHiragana.push(h);
    } else if (!e && this.state.knownHiragana.indexOf(h) >= 0) {
      const hi = this.state.knownHiragana.indexOf(h);
      this.state.knownHiragana.splice(hi, 1);
    }
    await this.saveState();
  }

  public async saveState(): Promise<void> {
    localStorage.setItem('state', JSON.stringify(this.state));
  }

  private async initData(): Promise<void> {
    if (this.words) {
      return;
    }

    const baseHref = document.getElementsByTagName('base')[0].href;
    this.words = await (await fetch(baseHref + '/assets/words.json')).json();
    this.hiraganaList = [];
    for (const word of this.words) { 
      for (const c of word.kana) {
        if (c.charCodeAt(0) >= 12352 && c.charCodeAt(0) <= 12447 && this.hiraganaList.indexOf(c) < 0) {
          this.hiraganaList.push(c);
        }
      }
    }
    this.hiraganaList.sort((a, b) => a.localeCompare(b));
  }

  public showImage(): void {
    window.open("https://www.google.com/search?q=" + (this.word.kanji ?? this.word.kana) + "&newwindow=1&source=lnms&tbm=isch&sa=X");
  }

  public async showNextWord(): Promise<void> {
    let wordChosen = true;
    let i = 0;
    this.state.wordsShown = this.state.wordsShown ?? [];
    do {
      i++;
      if (i > 5000) {
        if (this.state.knownHiragana.length < 10 && this.state.wordsShown.length == 0) {
          return;
        } else {
          this.state.wordsShown = [];
          i = 0;
        }
      }
      wordChosen = true;
      this.wordShowing = Math.trunc(Math.random() * this.words.length);
      if (this.state.wordsShown.indexOf(this.wordShowing) >= 0) {
        wordChosen = false;
      } else {
        this.word = this.words[this.wordShowing];
        for (const c of this.word.kana) {
          if (this.state.knownHiragana.indexOf(c) < 0) {
            wordChosen = false;
          }
        }
      }
    }
    while (!wordChosen);

    this.showKana = true;
    this.showKanji = false;
    this.showEnglish = true;
    this.showRomanji = false;
  }
}
