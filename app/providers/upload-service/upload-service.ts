import {StorageService} from '../storage-service/storage-service';
import {Injectable, EventEmitter} from 'angular2/core';
import {Jsonp, Http} from 'angular2/http';
import 'rxjs/add/operator/map';


@Injectable()
export class UploadService {
    
    //TODO: CHANGE PER EVENT
    guid1: string = "_OG=af71b830-d00e-4579-a2b0-77a450a1d8f9";
    guid2: string = "_LSG=87e00f0b-537d-400e-bcbd-c5b73c38b054";
    
    // base URL
    url : string = "https://www.test.com/JSONP.aspx?";
    JSONobject : string = "_JO=JSONP_CALLBACK";    
    postString : string = this.url + this.JSONobject + "&" + this.guid1 + "&" + this.guid1;
    
    urlArray : Array<any> = [];
    uploadArray : Array<any> = [];
    
    public allUploaded$ : EventEmitter<number>;
    public errorCount : number = 0;
    
    constructor(public jsonp : Jsonp, public storageService : StorageService){
        this.allUploaded$ = new EventEmitter();
    }
    
    public buildUploadURLs(uploadList, overwrite) {
        this.errorCount = 0;
        this.urlArray = [];
        this.uploadArray = [];
        for(let i = 0, j = uploadList.length; i < j; i++) {
            let person = uploadList.item(i);
            if(person.recordguid){
                let personObj = {
                    recordguid : <string> null,
                    url: <string> null
                };
                personObj.recordguid = person.recordguid;
                personObj.url = this.parsePerson(person.formdata, overwrite);
                this.urlArray.push(personObj);
            }
        }
        //Begin uploading
        if(this.urlArray.length > 0) {
            this.watchRequest(this.urlArray[0].url);
        }
    }
    
    //Convert Person to URL
    private parsePerson(personData, overwrite) {
        let regData = JSON.parse(personData);
        let resultKey = "";
        let surveyFieldsQuery = "";
        let url;
        for(let fieldTag in regData) {
            if(regData.hasOwnProperty(fieldTag)){
                if(regData[fieldTag] !== "" && regData[fieldTag] !== null && regData[fieldTag] !== undefined){
                    if(regData[fieldTag].constructor === Array){ // If Pickone/PickMany Response
                        for (let i = 0, j = regData[fieldTag].length; i < j; i++){
                            if(regData[fieldTag][i] !== ''){
                                surveyFieldsQuery += "&" + encodeURIComponent(regData[fieldTag][i]) + "=1";
                            }                            
                        }
                    } else {  // Text Response
                        if(fieldTag.toUpperCase() === "QRREGID"){
                            resultKey = "&_RK=" + encodeURIComponent(regData[fieldTag]);
                        }
                        if(fieldTag.toUpperCase() === 'QRBOOTHREP' || fieldTag.toUpperCase() === 'QRBOOTHSTATION'){
                            if(regData[fieldTag].toUpperCase() !== 'NULL'){
                                surveyFieldsQuery += "&" + fieldTag + "=" + encodeURIComponent(regData[fieldTag]);
                            }
                        } else {
                            surveyFieldsQuery += "&" + fieldTag + "=" + encodeURIComponent(regData[fieldTag]);
                        }
                    }
                }
            }
        }
        if(overwrite){
            url = this.postString + resultKey + "&_AA=0" + surveyFieldsQuery + "&_Z=X";
        } else {
            url = this.postString + resultKey + "&_AA=1" + surveyFieldsQuery + "&_Z=X";
        }
        return url;
    }
    
    private watchRequest(url) {
        this.makeRequest(url).subscribe((data) => {
            //Push current registrant to uploaded array
            this.uploadArray.push(this.urlArray[0].recordguid);
            
            //Remove Registrant
            this.urlArray.shift();
            
            //Make next call if needed
            if(this.urlArray.length > 0){
                this.watchRequest(this.urlArray[0].url);
            } else {
                //Zero uploads left, mark as uploaded
                this.storageService.markUploaded(this.uploadArray).then(() => {   
                    this.allUploaded$.emit(this.errorCount);               
                });
            }
        }, (error) => {
            console.log(error);
            this.errorCount += 1;
            //Remove registrant
            this.urlArray.shift();
            
            //Make next call if needed
            if(this.urlArray.length > 0) {
                this.watchRequest(this.urlArray[0].url);
            } else {
                //Zero registrants left, alert user, mark uploads
                this.allUploaded$.emit(this.errorCount);
                try {
                 this.storageService.markUploaded(this.uploadArray).then(() => {});
                } catch(err) {
                	//eat the error
                }
            }
        });
    }
    
    //Make request and pass back to observer
    private makeRequest(url) {
        return this.jsonp.request(url)
        .map(res => {
            return res.json();
        });
    }
}