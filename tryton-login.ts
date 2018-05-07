import { Component } from '@angular/core';
import { Locker } from 'angular-safeguard';
import { SessionService } from '../ngx-tryton';
import { NavController, Events } from 'ionic-angular';

import { TranslateService } from 'ng2-translate';
import { TrytonProvider } from '../ngx-tryton-providers/tryton-provider';
import { EncodeJSONRead } from '../ngx-tryton-json/encode-json-read';

// Models
import { User, UserSession } from './interfaces/user';
import { Party } from './interfaces/party';
import { MainMenuPage} from '../../pages/main-menu/main-menu'

import { environment } from '../../environments/environment';

@Component({
  selector: 'page-tryton-login',
  templateUrl: 'login.html',
})

/**
 * Login class for tryton.
 * This class will log the user in the system and store the necessary data to
 * continue working
 */
export class TrytonLoginPage {
  user: User;
  user_session: UserSession;
  party_response: Party[];
  location_response: Location[];
  driver = this.locker.useDriver(Locker.DRIVERS.LOCAL)
  database: string = ''
  locale: string= '';
  title: string = '';
  fields: Array<string>;
  config;

  constructor(
    public session_service: SessionService,
    public locker: Locker,
    public tryton_provider: TrytonProvider,
    public navCtrl: NavController,
    public translate: TranslateService,
    public events: Events) {
    this.title = environment.title;
    this.user = {
      'employee.rec_name': '',
      employee: -1,
      'employee.party.name': '',
      'employee.party': -1,
      'language.code': 'en',
      company: -1,
    }
    this.fields = Object.keys(this.user)
    translate.setDefaultLang(this.user['language.code']);
  }

  /**
   * Initialize the login page
   */
  ionViewDidLoad() {
    if (this.locker.get('sessionId')) {
      this.user_session = {
        userId: this.locker.get('userId'),
        sessionId: this.locker.get('sessionId'),
      }
      this.get_user_data();
    }
  }

  /**
   * Logs the user into the system
   * @param {event}  event    Name of the event (form submit in this case)
   * @param {string} username username of the user
   * @param {string} password password of the user
   */
  public login(event, username: string, password: string) {
    this.session_service.doLogin(environment.database, username, password)
      .subscribe(
      data => {
        if (data.constructor.name == "ErrorObservable") {
          alert("Incorrect username or password");
          return;
        }
        this.user_session = data;
        this.user_session.database = environment.database;
        this.get_user_data();
        this.navCtrl.push(MainMenuPage)
      },
      err => {
        alert("Incorrect username or password")
        console.log("Incorrect username or password", err)
      },
      () => {
        console.log("Completed!")
      })
  }

  /**
   * Gets the following data from the current user:
   * name, employee, employee party and language
   */
  public get_user_data() {
    let json_constructor = new EncodeJSONRead;
    let userId = Number(this.user_session.userId);
    let method = "res.user";
    let domain = [json_constructor.createDomain('id', '=', userId)];

    json_constructor.addNode(method, domain, this.fields);
    let json = json_constructor.createJson();

    this.tryton_provider.search(json)
      .subscribe(
      data => {
        this.user = data[method];
        this.driver.set('UserData', this.user[0]);
        let locale = this.user[0]['language.code'] || 'en';
        sessionStorage.setItem('locale', locale);
        this.translate.use(locale);
        this.events.publish('Data received');
      },
      error => {
        alert('Error start session', )
        console.log("An error was encountered", error)
      })
  }
}
