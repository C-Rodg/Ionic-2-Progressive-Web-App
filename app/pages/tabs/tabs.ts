import {Page} from 'ionic-angular';
import {PageCapture} from '../page-capture/page-capture';
import {PageLeads} from '../page-leads/page-leads';
import {PageSettings} from '../page-settings/page-settings';


@Page({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = PageCapture;
  tab2Root: any = PageLeads;
  tab3Root: any = PageSettings;
}
