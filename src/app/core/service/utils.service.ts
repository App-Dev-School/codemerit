import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  splitTimestampFromDate(dataVal){
    if(dataVal.includes('T')){
    let formattedVal = dataVal.split('T')[0];
    return formattedVal;
    }
    return dataVal;
  }

  splitTimeOnlyFromDate(dataVal){
    //console.log("Utils splitTimeOnlyFromDate=> "+dataVal);
    if(dataVal.includes('T')){
    let formattedVal = dataVal.split('T')[1];
    let hour = formattedVal.split(':')[0];
    let minute = formattedVal.split(':')[1];
    //let AmOrPm = hour >= 12 ? 'pm' : 'am';
    //console.log("Utils splitTimeOnlyFromDate=> hour "+hour+" minute "+minute+" AmOrPm"+AmOrPm);
    hour = (hour % 12) || 12;
    let formattedTime = hour + ":" + minute +":00";
    console.log("Utils splitTimeOnlyFromDate formattedTime=> "+formattedTime);
    return formattedTime;
    }
    return dataVal;
  }

   public isValidDate(dateString:string) : boolean {
    try{
      var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
    }catch(Exception){
        return true;
    }
  }

   formatTheDate(date:string) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

}
