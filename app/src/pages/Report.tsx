import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLabel, IonTextarea, IonLoading, IonToast } from '@ionic/react';
import { Camera, CameraResultType, CameraSource} from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { useHistory } from 'react-router-dom';
import './Report.css';

const Report: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [showToast, setShowToast] = useState(false); 
  const history = useHistory();

  const takePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 50,
        width: 600,
      });
      setPhoto(photo.webPath || null);
    } catch (error) {
      console.error('Error taking photo', error);
    }
  };

  const getGeolocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting geolocation', error);
    }
  };

  async function submitReport(description: string, latitude: number, longitude: number, imageUri: string) {
    const { value } = await Preferences.get({ key: 'user' });
    const user = value ? JSON.parse(value) : null;
    const userId = user?._id || '';
    
    console.log('Submitting report:', description, latitude, longitude, imageUri, userId);
    
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("latitude", latitude.toString());
      formData.append("longitude", longitude.toString());
      formData.append('userId', userId);

      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("image", blob, "report.jpg");
      }
  
      console.log("Sending FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      const response = await fetch('https://smart-city.koyeb.app/api/reports', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Report submitted:', data);
        setShowToast(true);
        setTimeout(() => history.push('/home'), 2000);
      } else {
        console.error('Failed to submit report:', data.message);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([takePhoto(), getGeolocation()]);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <IonPage className="lock-vh">
      <IonContent fullscreen scrollY={false} className="no-scroll">
        <IonLoading isOpen={loading} message={'Loading...'} />
        {!loading && (
          <div className="report-container">
            <h2>Take a photo of the issue</h2>
            {photo && (
              <img
                src={photo}
                alt="Captured"
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  objectFit: 'cover',
                  aspectRatio: '3 / 4', 
                }}
              />
            )}
            <IonLabel position="floating">Description</IonLabel>
            <IonTextarea
              value={description}
              placeholder="Describe the issue"
              onIonInput={(e) => setDescription(e.detail.value!)}
            />

            <div className="photo-description">
              <p>Is this the issue you want to report? If so, add a description and submit!</p>
            </div>

            <IonButton
              className='button'
              expand="block"
              shape='round'
              onClick={() => {
                if (description && location && photo) {
                  submitReport(description, location.lat, location.lon, photo);
                } else {
                  alert('Please provide a description and allow location access.');
                }
              }}
            >
              Submit
            </IonButton>
          </div>
        )}
        <IonToast
          isOpen={showToast}
          message="Report submitted successfully!"
          duration={2000} 
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Report;
