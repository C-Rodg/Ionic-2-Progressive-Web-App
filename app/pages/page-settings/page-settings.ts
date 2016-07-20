import {Page, NavController, Alert, Toast} from 'ionic-angular';
import {StorageService} from '../../providers/storage-service/storage-service';
import {UploadService} from '../../providers/upload-service/upload-service';


@Page({
  templateUrl: 'build/pages/page-settings/page-settings.html'
})
export class PageSettings {
  rep : string = '';
  station : string = '';
  overwrite : Boolean = true;
  pending : number = 0;  
  
  constructor(public storageService : StorageService, public nav : NavController, public uploadService : UploadService) {
    this.storageService.getLocalRep().then((data) => {
      this.rep = data;
      if(String(data) === 'null' || String(data) === 'undefined'){
        this.rep = "";
      }
    });
    
    this.storageService.getLocalStation().then((data) => {
      this.station = data;
      if (String(data) === 'null' || String(data) === 'undefined') {
        this.station = "";
      }
    });
    
    this.storageService.getLocalOverwrite().then((data) => {
      this.overwrite = data;
    });
    
    this.storageService.getPendingRecords().then((data) => {
      this.pending = data.res.rows.length;
    });
    
    this.uploadService.allUploaded$.subscribe(item => this.doneUploading(item));
  }
  
  private doneUploading(data) {
    if(data === 0) {
      this.pending = data;
      let toast = Toast.create({
        message: "Done uploading pending records",
        duration : 3000
      });
      this.nav.present(toast);
    } else {
      this.pending = data;
      let toast = Toast.create({
        message: "Done uploading, but with " + data + " errors",
        duration : 3000
      });
      this.nav.present(toast);
    }
  }
  
  // Force Uploading of Records
  forceUpload() {
    this.storageService.getPendingRecords().then((data) => {
      if(data.res.rows.length > 0){
        this.uploadService.buildUploadURLs(data.res.rows, this.overwrite);
      } else {
        let toast = Toast.create({
          message : "No records to upload",
          duration : 3000
        });
        this.nav.present(toast);
      }
    })
  }
  
  //Clear records marked for deletion
  private clearDeleted() {
    this.storageService.getDeletedRecords().then((data) => {
      if(data.res.rows.length > 0) {
        this.confirmClear(data.res.rows.length);
      } else {
        let toast = Toast.create({
          message : "No records to clear",
          duration : 3000
        });
        this.nav.present(toast);
      }
    });
  } 
  
  //Create alert for confiming clear
  private confirmClear(num) {
    let msg = "Are you sure you want to permanately remove " + String(num) + " records? These records cannot be recovered after this action."
    let confirm = Alert.create({
      title: "Clear out old records?",
      message: msg,
      buttons : [
        {
          text : "Cancel"
        },
        {
          text : "Delete",
          handler : () => {
            this.storageService.clearDeleted();
          }
        }
      ]
    });
    this.nav.present(confirm);
  }
  
  //Save overwrite selection to local storage
  private saveOverwrite(){
    var that = this;
    setTimeout(function() {
      that.storageService.setLocalOverwrite(that.overwrite);
    });
  }
  
  onPageWillEnter() {
     this.storageService.getPendingRecords().then((data) => {
        this.pending = data.res.rows.length;
     });
  }
  
  //Save settings
  onPageWillLeave() {
    this.storageService.setLocalRep(this.rep);
    this.storageService.setLocalStation(this.station);
    this.storageService.setLocalOverwrite(this.overwrite);
  }
}
