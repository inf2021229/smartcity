import React from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  useIonAlert
} from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { useIonRouter } from '@ionic/react';
import './Home.css';

const Home: React.FC = () => {
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();

  const handleReportButtonClick = async () => {
    try {
      const permissionStatus = await Geolocation.requestPermissions();
      //const permissionStatus = { location: 'granted' };
      if (permissionStatus.location === 'granted') {
        router.push('/report', 'forward');
      } else if (permissionStatus.location === 'denied') {
        presentAlert({
          header: 'Permission Denied',
          message:
            'Location permission is required to report an issue. Please enable it in your phone settings.',
          buttons: [
            {
              text: 'Open Settings',
              handler: () => {
                Capacitor?.Plugins?.App?.openAppSettings?.();
              },
            },
            'Cancel',
          ],
        });
      }
    } catch (error) {
      console.error('Error requesting location permission', error);
      presentAlert({
        header: 'Error',
        message: 'An error occurred while requesting location permission.',
        buttons: ['OK'],
      });
    }
  };

  const goToMyReports = () => router.push('/my-reports', 'forward');

  return (
    <IonPage className="lock-vh">
      <IonContent fullscreen scrollY={false}>
        <div className="home-hero">
          <h1 className="brand-title">UrbanEye</h1>
        </div>

        <div className="home-container">
          <IonText className="home-page-title">Home</IonText>
          <IonText>
            <p className="home-description">
              Report issues in your city and help municipal authorities improve.
            </p>
          </IonText>

          <IonButton expand="block" className="home-button" shape="round" onClick={handleReportButtonClick}>
            REPORT AN ISSUE
          </IonButton>

          <IonButton expand="block" className="home-button" shape="round" onClick={goToMyReports}>
            VIEW MY REPORTS
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;