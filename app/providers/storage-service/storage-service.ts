import {Storage, SqlStorage, LocalStorage} from 'ionic-angular';
import {Injectable} from 'angular2/core';

export class Person {
    recordGuid : string;
    formData : any;
    
    constructor(recordGuid : string, formData : any) {
        this.recordGuid = recordGuid;
        this.formData = formData;
    }
}

@Injectable()
export class StorageService {
    storage : Storage = null;
    local : Storage = null;
    
    constructor() {        
		try {
			this.storage = new Storage(SqlStorage);
        	this.local = new Storage(LocalStorage);
			//  id |  recordguid  |  formdata  |  capturedatetime  |  lastupdatedatetime  |  upload  |  deleted
			this.storage.query('CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, recordguid TEXT, formdata TEXT, capturedatetime TEXT, lastupdatedatetime TEXT, upload INTEGER, deleted INTEGER)');	
		} catch (error) {
			alert('Sorry, database creation is not supported with this browser.');
		}
        
    }
    
    // Return ALL records
	public getAllRecords() {
		return this.storage.query('SELECT * FROM leads');
	}

	// Return NON-DELETED records
	public getExistingRecords() {
		return this.storage.query('SELECT * FROM leads WHERE deleted = 0');
	}

	// Return PENDING records
	public getPendingRecords() {
		return this.storage.query('SELECT * FROM leads WHERE upload = 0 AND deleted = 0');
	}
	
	// Get DELETED records
	public getDeletedRecords() {
		return this.storage.query('SELECT * FROM leads WHERE deleted = 1');
	}

	// Save NEW record
	public saveNewRecord(person : Person) {
		let dateNow = new Date();
        let formData = JSON.stringify(person.formData);      
		let sql = "INSERT INTO leads (recordguid, formdata, capturedatetime, lastupdatedatetime, upload, deleted) VALUES (?,?,?,?,?,?)";
		return this.storage.query(sql, [person.recordGuid, formData, dateNow, dateNow, 0, 0]);
	}

	// Update EXISTING record
	public updateRecord(person : Person) {
		let dateNow = new Date();
        let formData = JSON.stringify(person.formData);
        formData = formData.replace(/\'/g, "''");
		let sql = 'UPDATE leads SET formdata = \'' + formData + '\', lastupdatedatetime = \"' + dateNow + '\", upload = 0 WHERE recordguid = \"' + person.recordGuid + '\"';
        return this.storage.query(sql);
	}        

	//Mark as DELETED
	public markDeleted(regId : string) {
		let sql = 'UPDATE leads SET deleted = 1 WHERE recordguid = \"' + regId + '\"';
		return this.storage.query(sql);
	}
	
	//Mark as UPLOADED
	public markUploaded(regArray){
		if(regArray.length > 0) {
			let queryString = "UPDATE leads SET upload = 1 WHERE ";
			for(let i = 0, j = regArray.length; i < j; i++){
				if(i !== j-1){
					queryString += "recordguid = '" + regArray[i] + "' OR ";
				} else {
					queryString += "recordguid = '" + regArray[i] + "'";
				}
			}
			return this.storage.query(queryString);
		}
	}

	//CLEAR from Database
	public clearDeleted(){
		let sql = 'DELETE FROM leads WHERE deleted = 1';
		return this.storage.query(sql);
	}
    
    // ------------ LOCAL STORAGE METHODS ----------------- //
    // Get Rep name
	public getLocalRep() {
		return this.local.get('rep');
	}

	// Get Station name
	public getLocalStation() {
		return this.local.get('station');
	}

	// Get Overwrite status
	public getLocalOverwrite() {
		return this.local.get('overwrite');
	}

	// Set Rep name
	public setLocalRep(repName) {
		return this.local.set('rep', repName);
	}

	// Set Station name
	public setLocalStation(stationName) {
		return this.local.set('station', stationName);
	}

	// Set Overwrite status
	public setLocalOverwrite(status) {
		return this.local.set('overwrite', status);
	}      
}