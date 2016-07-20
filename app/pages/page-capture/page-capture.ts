import {Page, Content, NavController, NavParams, Toast} from 'ionic-angular';
import {StorageService, Person} from '../../providers/storage-service/storage-service';
import {UUID} from 'angular2-uuid';
import {ViewChild} from 'angular2/core';
import {HeaderImage} from '../header/header';

@Page({
  templateUrl: 'build/pages/page-capture/page-capture.html',
  directives: [HeaderImage]
})
export class PageCapture {
  @ViewChild(Content) content: Content;
  
  person : Person = null;
  rep : string = '';
  station : string = ''; 
  editFlag : boolean = false;
  
  //TODO: DECLARE REQUIRED FIELDS
  requiredFields : Array<string> = ['qrFirstName', 'qrLastName', 'qrCompany', 'qrFollowUp'];  
   
  constructor(public storageService : StorageService, public nav : NavController, public navParams : NavParams) {    
    let editRegistrant = navParams.get("editRegistrant");    
    if(!editRegistrant){
      //Create new Person
      let newRegId = UUID.UUID();
      let formObject = this.newFormData(newRegId);
      this.person = new Person(newRegId, formObject);
      this.editFlag = false;
    } else {
      this.person = new Person(editRegistrant.recordguid, editRegistrant.formdata);
      this.editFlag = true;      
    }    
  }
  
  private newFormData(uuid) {
     return {
          qrRegId : uuid,  
          qrBoothRep : this.rep,
          qrBoothStation : this.station,
          qrLeadRank : Array<string>(0),
          
          //TODO: DECLARE ANY PICK ONE QUESTIONS                  
          qrSolution: Array<string>(0),
          qrRole : Array<string>(0),
          qrManage : Array<string>(0),
          qrFollowUp : Array<string>(0)
     }    
  }
  
  public savePerson() {     
    //Check if valid 
    let validFlag = true;
    for(let i = 0; i < this.requiredFields.length; i++) {
      let fieldValue = this.person.formData[this.requiredFields[i]];
      let fieldLength = 0;
      if(fieldValue){
         fieldLength = fieldValue.length;
      }     
      if(fieldValue === '' || fieldValue === undefined || fieldValue === null || fieldLength === 0){
        validFlag = false; 
      }
    }

	if (!validFlag) {
		let toast = Toast.create({
			message: "Please fill out all required fields.",
			duration: 2000
		});
		this.nav.present(toast);
		this.content.scrollToTop();
		return false;
    }

    //TODO: CLEAR HIDDEN/SHOWN QUESTIONS
    let control = this.person.formData.qrFollowUp[0];
    if(control !== 'qrFollowUp_1'){
		this.person.formData.qrCampaign = [];		
		this.person.formData.qrProduct = [];
		this.person.formData.qrManage[0] = '';
		this.person.formData.qrRole[0] = '';
		this.person.formData.qrSolution[0] = '';
    }
    
    //TODO: DECLARE LEAD RANKING LOGIC
    let basedOff = this.person.formData.qrFollowUp[0];
    if (basedOff === 'qrFollowUp_1') {
      this.person.formData.qrLeadRank[0] = 'qrLeadRank_1';
    } else if (basedOff === 'qrFollowUp_2' || basedOff === 'qrFollowUp_3') {
      this.person.formData.qrLeadRank[0] = 'qrLeadRank_2';
    } else {
      this.person.formData.qrLeadRank[0] = 'qrLeadRank_3';
    }
             
    if(!this.editFlag){
      this.storageService.saveNewRecord(this.person);
    
      //Create new Person
      let newRegId = UUID.UUID();
      let formObject = this.newFormData(newRegId);
      this.person = new Person(newRegId, formObject);
      this.editFlag = false;
      this.content.scrollToTop();
      
      let toast = Toast.create({
        message: "New record saved!",
        duration : 2000
      });
      this.nav.present(toast);
    } else {
      this.storageService.updateRecord(this.person);
       //Create new Person
      let newRegId = UUID.UUID();
      let formObject = this.newFormData(newRegId);
      this.person = new Person(newRegId, formObject);
      this.editFlag = false;
      
      let toast = Toast.create({
        message: "Saved all edits!",
        duration : 2000
      });
      this.nav.present(toast);      
      this.nav.pop();
    }    
  }
  
  private onPageDidEnter(){
    this.storageService.getLocalRep().then((data) => {
      this.person.formData.qrBoothRep = data;
      this.rep = data;
    });    
    this.storageService.getLocalStation().then((data) => {
      this.person.formData.qrBoothStation = data;
      this.station = data;
    });
  }   
}
