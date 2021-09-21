import { Component } from '@angular/core';
import {Platform} from '@ionic/angular';
import {BackgroundMode} from '@ionic-native/background-mode/ngx';
import { startOfDay, differenceInMinutes, addHours } from 'date-fns';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationEvents,
  BackgroundGeolocationResponse
} from '@ionic-native/background-geolocation/ngx';
import {Geolocation } from '@ionic-native/geolocation/ngx';

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
    datetime: addHours(startOfDay(new Date()), 4),
  };
  lastLocation;

  constructor(public plt: Platform,
              private backgroundMode: BackgroundMode,
              private backgroundGeolocation: BackgroundGeolocation,
              private geolocation: Geolocation) {
    this.plt.ready()
      .then(() => {
        console.log('Starting app');
        const config: BackgroundGeolocationConfig = {
          desiredAccuracy: 10,
          stationaryRadius: 20,
          distanceFilter: 30,
          debug: true, //  enable this hear sounds for background-geolocation life-cycle.
          stopOnTerminate: false, // enable this to clear background location settings when the app terminates
        };
        this.backgroundMode.enable();
        this.backgroundGeolocation.configure(config)
          .then(() => {

            this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
              this.lastLocation = location;
              console.log('last location', JSON.stringify(location));
              // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
              // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
              // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
              this.backgroundGeolocation.finish(); // FOR IOS ONLY
            });

          });
        // start recording location
        this.backgroundGeolocation.start();
        setInterval(() => {
          this.checkIfValid(new Date());
        }, 60000);
      });
  }

  checkIfValid(time) {
    const minutes = differenceInMinutes(time, this.bookingTable.datetime);
    console.log('difference in minutes', minutes);
    if(!this.bookingTable.checkedIn && (minutes == 15 || minutes == 30 || minutes == 45 || minutes == 60)) {
      const distance = this.distance(this.lastLocation.latitude, this.lastLocation.longitude,
        this.bookingTable.latitude, this.bookingTable.longitude);
      console.log('distance', distance);
      if(distance < 50) {
        this.bookingTable.checkedIn = true;
      }
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
