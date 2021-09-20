import { Component } from '@angular/core';
import {Platform} from '@ionic/angular';
import {BackgroundMode} from '@ionic-native/background-mode/ngx';
import { startOfDay, differenceInMinutes, addHours } from 'date-fns';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  bookingTable = {
    latitude: 27.677950,
    longitude: 76.354360,
    checkedIn: false,
    datetime: addHours(startOfDay(new Date()), 1),
  };

  constructor(public plt: Platform,
              private backgroundMode: BackgroundMode,
              private geolocation: Geolocation) {
    this.plt.ready()
      .then(() => {
        this.backgroundMode.enable();
        setInterval(() => {
          this.checkIfValid(new Date());
        }, 60000);
      });
  }

  checkIfValid(time) {
    const minutes = differenceInMinutes(time, this.bookingTable.datetime);
    console.log('difference in minutes', minutes);
    if(!this.bookingTable.checkedIn && (minutes == 15 || minutes == 30 || minutes == 45 || minutes == 60)) {
      this.geolocation.getCurrentPosition().then((location) => {
        let latitude = location.coords.latitude;
        let longitude = location.coords.latitude;
        const distance = this.distance(latitude, longitude, this.bookingTable.latitude, this.bookingTable.longitude);
        console.log('distance', distance);
        if(distance < 50) {
          this.bookingTable.checkedIn = true;
        }
      });
    }
  }

  distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 +
      c(lat1 * p) * c(lat2 * p) *
      (1 - c((lon2 - lon1) * p))/2;

    return 12742000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }
}
