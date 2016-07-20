import {Page, NavController, Alert} from 'ionic-angular';
import {StorageService, Person} from '../../providers/storage-service/storage-service';
import {PageCapture} from '../page-capture/page-capture';


@Page({
  templateUrl: 'build/pages/page-leads/page-leads.html',
})
export class PageLeads {
  registrants : any = [];
  
  constructor(public storageService : StorageService, public nav : NavController) {}
  
  //Load Registrant List
  private loadPeople(){
    this.registrants = [];
    this.storageService.getExistingRecords().then((data) => {
      this.registrants = [];
      if (data.res.rows.length > 0) {
        for (let i = 0, j = data.res.rows.length; i < j; i++) {
          let item = data.res.rows.item(i);         
          let formObj = JSON.parse(item.formdata);
          let listItem = {
            recordguid : item.recordguid,
            formdata : formObj,
            upload : item.upload
          }
          this.registrants.push(listItem);
        }
      }
    });
  }
  
  // Edit Records
  private editPerson(person, index) {
    this.nav.push(PageCapture, {
      editRegistrant : person
    });
  }
  
  //Mark person as Deleted
  public removePerson(person, regId, index, uploaded) {
    if(!uploaded){
      this.confirmDelete(regId, index);
    } else {
      this.storageService.markDeleted(regId);
      this.registrants.splice(index, 1);
    }    
  }
  
  //Confirm Deletion if not uploaded
  private confirmDelete(regId, index) {
    let confirm = Alert.create({
      title: "Delete this record?",
      message: "Are you sure you want to delete this record? It has not yet been uploaded.",
      buttons : [
        {
          text : "Cancel"
        },
        {
          text : "Delete",
          handler : () => {
            this.storageService.markDeleted(regId);
            this.registrants.splice(index, 1);
          }
        }
      ]
    });
    this.nav.present(confirm);
  }
  
  //Refresh List of Records
  private onPageWillEnter() {
    this.loadPeople();
  }
}
