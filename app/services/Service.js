import firebase, {firestoreDB} from '../config/firebase';
import {AsyncStorage} from 'react-native';

export class Service {
    static getDocRef(docName) {
        return firestoreDB.collection(docName);
    }

    static addSnapshotListener(docName, successFn, errorFn) {
        Service.getDocRef(docName).onSnapshot((snapshot) => {
            //Audit Statements
            successFn(snapshot);
        }).catch((error)=>{
            if(errorFn){
                errorFn(error);
            }
        });
    }
    static getList(docName, successFn, errorFn){
        Service.getDocRef(docName).get().then(
            (snapshot)=>{
                successFn(snapshot)
            }
        ).catch((error)=>{
            if(errorFn){
                errorFn(error);
            }
        });
    }

    static getDocument(collection, document, successFn,errorFn){
       firestoreDB.collection(collection).doc(document).get().then(
            (snapshot)=>{
                if(snapshot.exists){
                    let data = snapshot.data();
                    successFn(data, snapshot.id)
                }else{
                    successFn({});
                }                
            }
        ).catch((error)=>{
            if(errorFn){
                errorFn(error);
            }else{
                console.error(error);
            }
        });
    }

    static getCurrentUser(successFn, errorFn){
        AsyncStorage.getItem("USER_DETAILS").then((userDetails)=>{
                successFn(JSON.parse(userDetails));
            }).catch(err => {
                console.warn('Errors');
                if(errorFn){
                    errorFn(err);
                }
                
        });
    }
}