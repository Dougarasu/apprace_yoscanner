import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Vibration } from '@ionic-native/vibration';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  options: BarcodeScannerOptions;
  results: {};
  url: string;
  tag: any;
  tagId: number;

  constructor(private vibration:Vibration, private barcode: BarcodeScanner, private nfc: NFC, private ndef: Ndef, private Alert: AlertController, private zone: NgZone,private platform: Platform, public navCtrl: NavController) {
    this.tag = {};
  }

  ionViewDidEnter() {
    console.log('ionviewdidenter');
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.nfc.enabled()
        .then(() => {
          console.log("NFC is ready");
          this.addListenNFC();
          // IF Disabled
        })
        .catch(err => {
          console.log(err);
          let alert = this.Alert.create({
            subTitle : "NFC DISABLED",
            buttons: [{ text : "OK"},{ text : "Go Setting",
              handler : () => {
                this.nfc.showSettings();
              }
            }]
          });
          alert.present();
        });
    });
  }

  addListenNFC() {
    console.log("Listening...");
    this.nfc.addNdefFormatableListener().subscribe(nfcEvent => this.sesReadNFC(nfcEvent.tag));
    this.nfc.addMimeTypeListener("text/json").subscribe(nfcEvent => this.sesReadNFC(nfcEvent.tag));
    this.nfc.addMimeTypeListener("text/plain").subscribe(nfcEvent => this.sesReadNFC(nfcEvent.tag));
    this.nfc.addMimeTypeListener("application/json").subscribe(nfcEvent => this.sesReadNFC(nfcEvent.tag));
    this.nfc.addTagDiscoveredListener().subscribe(nfcEvent => this.sesReadNFC(nfcEvent.tag));
    this.nfc.addNdefListener().subscribe(nfcEvent => this.sesReadNFC(nfcEvent.tag));
  }

  sesReadNFC(data):void {
    this.vibration.vibrate(100);
    this.tag = JSON.parse(JSON.stringify(data, null, 4));
    this.tagId = this.tag.id.includes(86) ? 1 : 2;
    console.log(JSON.stringify(data, null, 4));
  }

  scanNfc() {
    console.log('scan NFC');
    this.nfc.showSettings();
  }

  scanBarcode() {
    const _this = this;

    this.scanning().then((_response) => {
      _this.results = _response;
      _this.url = _response.text;
    });
  }

  async scanning() {
    const options = {
      prompt: 'Scan a barcode to see the result!',
      showTorchButton: true
    };

    return await this.barcode.scan(options);
  }
}
